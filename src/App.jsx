import {
  Calendar,
  ChevronRight,
  Clapperboard,
  Eye,
  Film,
  LoaderCircle,
  Play,
  Search,
  Sparkles,
  Star,
  Tv,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  decryptSansekaiStream,
  getDetails,
  getHome,
  getPlayback,
  getSansekaiDetail,
  getSansekaiEpisode,
  getSansekaiList,
  getTrending,
  searchSansekai,
  searchTitles,
  subtitleProxyUrl,
} from './api.js';
import {
  extractStreamUrl,
  getSansekaiProvider,
  normalizeSansekaiDetail,
  normalizeSansekaiItems,
  sansekaiProviders,
} from './sansekai.js';

const qualityOptions = ['', '360', '480', '720', '1080'];
const typeOptions = [
  { value: '', label: 'Semua' },
  { value: '1', label: 'Film' },
  { value: '2', label: 'Serial' },
];

function formatYear(date) {
  if (!date) return '';
  return String(date).slice(0, 4);
}

function formatViews(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `${Math.round(number / 1_000)}K`;
  return String(number);
}

function firstItems(sections = []) {
  return sections.flatMap((section) => section.items || []).slice(0, 18);
}

function isSeries(item) {
  return Number(item?.subjectType) === 2;
}

function getEpisodes(details) {
  if (details?.sansekaiEpisodes?.length) {
    return [
      {
        season: 1,
        label: 'Episode',
        episodes: details.sansekaiEpisodes.map((episode) => Number(episode.number || 1)),
      },
    ];
  }

  const seasons = details?.seasons_list || [];
  if (!seasons.length) return [{ season: 0, episodes: [0] }];

  return seasons.map((season) => ({
    season: (season.episodes || []).some((episode) => Number(episode) === 0)
      ? Math.max(Number(season.season || 1) - 1, 0)
      : Number(season.season || 1),
    label: `Season ${season.season || 1}`,
    episodes: season.episodes?.length
      ? season.episodes.map((episode) => Number(episode))
      : Array.from({ length: Number(season.total_episodes || 1) }, (_, index) => index),
  }));
}

function formatEpisodeLabel(episode) {
  return Number(episode) === 0 ? 1 : episode;
}

function Badge({ icon: Icon, children }) {
  if (!children && children !== 0) return null;
  return (
    <span className="meta-badge">
      {Icon ? <Icon size={14} /> : null}
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function PosterCard({ item, onSelect, compact = false }) {
  return (
    <button className={compact ? 'poster-card compact' : 'poster-card'} onClick={() => onSelect(item)} type="button">
      <span className="poster-frame">
        {item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" /> : <span className="poster-placeholder">{item.providerLabel || 'Nontoncuy'}</span>}
        <span className="poster-topline">
          <Badge icon={Star}>{item.rating || 'N/A'}</Badge>
        </span>
      </span>
      <span className="poster-copy">
        <strong>{item.title}</strong>
        <span>
          {item.providerLabel || formatYear(item.releaseDate)} {item.country ? `• ${item.country}` : ''}
        </span>
      </span>
    </button>
  );
}

function PosterRow({ title, eyebrow, items, onSelect }) {
  if (!items?.length) return null;

  return (
    <section className="content-band">
      <div className="app-shell">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="poster-row">
          {items.map((item) => (
            <PosterCard key={`${item.subjectId}-${item.detailPath}`} item={item} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayerPanel({ playback, title, poster, onClose }) {
  if (!playback?.vid_url_proxy && !playback?.vid_url) return null;

  const videoUrl = playback.vid_url_proxy || playback.vid_url;
  const trackUrl = subtitleProxyUrl(playback.sub_url);

  return (
    <section className="player-band" id="player">
      <div className="app-shell player-shell">
        <div className="player-heading">
          <div>
            <p className="eyebrow">SEDANG DIPUTAR</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-button dark" type="button" onClick={onClose} aria-label="Tutup player">
            <X size={18} />
          </button>
        </div>
        <div className="video-stage">
          <video controls poster={poster || undefined} src={videoUrl} crossOrigin="anonymous">
            {trackUrl ? <track kind="subtitles" srcLang="id" label="Indonesia" src={trackUrl} default /> : null}
          </video>
        </div>
      </div>
    </section>
  );
}

function DetailDrawer({ item, details, loading, detailError, playbackLoading, selectedQuality, onQualityChange, onClose, onPlay }) {
  const episodeGroups = useMemo(() => getEpisodes(details), [details]);

  if (!item) return null;

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={item.title} onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Tutup detail">
          <X size={18} />
        </button>

        {loading ? (
          <div className="drawer-loading">
            <LoaderCircle size={24} />
            <span>Memuat detail...</span>
          </div>
        ) : (
          <>
            {(details?.cover_url || item.cover_url) ? (
              <div className="detail-hero">
                <img src={details?.cover_url || item.cover_url} alt={item.title} />
              </div>
            ) : null}
            <div className="drawer-content">
              <p className="eyebrow">{details?.providerLabel || item.providerLabel || (isSeries(details || item) ? 'SERIAL' : 'FILM')}</p>
              <h2>{details?.title || item.title}</h2>
              <div className="meta-line">
                <Badge icon={Star}>{details?.rating || item.rating || 'N/A'}</Badge>
                <Badge icon={Calendar}>{formatYear(details?.releaseDate || item.releaseDate)}</Badge>
                <Badge icon={Eye}>{formatViews(details?.view || item.view)} views</Badge>
              </div>
              <p className="description">
                {details?.description || item.description || 'Sinopsis belum tersedia untuk judul ini.'}
              </p>
              <p className="genre-line">{details?.genre || item.genre}</p>

              {detailError && !details ? (
                <div className="drawer-notice">{detailError}</div>
              ) : (
                <>
                  <label className="field-label" htmlFor="quality">
                    Kualitas
                  </label>
                  <select id="quality" className="quality-select" value={selectedQuality} onChange={(event) => onQualityChange(event.target.value)}>
                    {qualityOptions.map((quality) => (
                      <option key={quality || 'auto'} value={quality}>
                        {quality ? `${quality}p` : 'Auto'}
                      </option>
                    ))}
                  </select>

                  <div className="episode-list">
                    {episodeGroups.map((group) => (
                      <div key={group.label || group.season} className="episode-group">
                        <p>{group.label || 'Film'}</p>
                        <div>
                          {group.episodes.map((episode) => (
                            <button
                              className="episode-button"
                              key={`${group.season}-${episode}`}
                              type="button"
                              onClick={() => onPlay(details || item, group.season, episode)}
                              disabled={playbackLoading}
                            >
                              {playbackLoading ? <LoaderCircle size={14} /> : <Play size={14} />}
                              Ep {formatEpisodeLabel(episode)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function SearchPanel({ query, setQuery, subjectType, setSubjectType, loading, results, onSubmit, onSelect }) {
  return (
    <section className="search-band" id="search">
      <div className="app-shell">
        <SectionHeader eyebrow="TEMUKAN JUDUL" title="Cari film, drama, atau anime." />
        <form className="search-panel" onSubmit={onSubmit}>
          <div className="search-input-wrap">
            <Search size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul..." />
          </div>
          <div className="segmented-control" aria-label="Tipe tontonan">
            {typeOptions.map((option) => (
              <button
                key={option.value || 'all'}
                className={subjectType === option.value ? 'active' : ''}
                type="button"
                onClick={() => setSubjectType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button className="primary-button" type="submit" disabled={loading || !query.trim()}>
            {loading ? <LoaderCircle size={16} /> : <Search size={16} />}
            Cari
          </button>
        </form>

        {results?.length ? (
          <div className="search-grid">
            {results.map((item) => (
              <PosterCard key={`${item.subjectId}-${item.detailPath}`} compact item={item} onSelect={onSelect} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SansekaiPanel({
  provider,
  providerId,
  setProviderId,
  query,
  setQuery,
  loading,
  searchLoading,
  error,
  items,
  onRefresh,
  onSearch,
  onSelect,
}) {
  return (
    <section className="apps-band" id="apps">
      <div className="app-shell">
        <SectionHeader
          eyebrow="DRAMA APP APIS"
          title="Kategori dari app API."
          action={
            <button className="ghost-button ink" type="button" onClick={onRefresh} disabled={loading}>
              {loading ? <LoaderCircle size={16} /> : <Sparkles size={16} />}
              Refresh
            </button>
          }
        />

        <div className="provider-strip" aria-label="Sansekai provider">
          {sansekaiProviders.map((entry) => (
            <button key={entry.id} className={providerId === entry.id ? 'active' : ''} type="button" onClick={() => setProviderId(entry.id)}>
              <span>{entry.eyebrow}</span>
              {entry.label}
            </button>
          ))}
        </div>

        <form className="provider-search" onSubmit={onSearch}>
          <div className="search-input-wrap">
            <Search size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari di ${provider.label}...`} />
          </div>
          <button className="primary-button" type="submit" disabled={searchLoading || !query.trim()}>
            {searchLoading ? <LoaderCircle size={16} /> : <Search size={16} />}
            Cari
          </button>
        </form>

        {error ? <div className="drawer-notice provider-notice">{error}</div> : null}

        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="poster-skeleton" key={index} />
            ))}
          </div>
        ) : items.length ? (
          <div className="poster-row">
            {items.map((item) => (
              <PosterCard key={`${item.provider}-${item.subjectId}-${item.title}`} item={item} onSelect={onSelect} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Hero({ item, loading, onPlay, onSelect }) {
  return (
    <section className="hero-band">
      <div className="app-shell hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">INDOCAST FILMBOX</p>
          <h1>{item?.title || 'Nontoncuy'}</h1>
          <p>{item?.genre || 'Streaming film, drama, dan anime dari katalog Filmbox.'}</p>
          <div className="meta-line hero-meta">
            <Badge icon={Star}>{item?.rating || 'N/A'}</Badge>
            <Badge icon={Film}>{isSeries(item) ? 'Serial' : 'Film'}</Badge>
            <Badge icon={Eye}>{formatViews(item?.view)} views</Badge>
          </div>
          <div className="hero-actions">
            <button className="hero-button" type="button" onClick={() => item && onPlay(item)} disabled={!item || loading}>
              {loading ? <LoaderCircle size={16} /> : <Play size={16} />}
              Putar
            </button>
            <button className="ghost-button light" type="button" onClick={() => item && onSelect(item)} disabled={!item}>
              Detail
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-panel">
            {item?.cover_url ? <img src={item.cover_url} alt={item.title} /> : <div className="skeleton" />}
            <div className="preview-copy">
              <span>{isSeries(item) ? <Tv size={16} /> : <Clapperboard size={16} />}</span>
              <strong>{item?.title || 'Memuat katalog...'}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [home, setHome] = useState(null);
  const [trending, setTrending] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [playback, setPlayback] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [query, setQuery] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sansekaiProviderId, setSansekaiProviderId] = useState('dramaku');
  const [sansekaiItems, setSansekaiItems] = useState([]);
  const [sansekaiQuery, setSansekaiQuery] = useState('');
  const [sansekaiError, setSansekaiError] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [appLoading, setAppLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sansekaiLoading, setSansekaiLoading] = useState(false);
  const [sansekaiSearchLoading, setSansekaiSearchLoading] = useState(false);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [error, setError] = useState('');
  const heroItem = home?.hero_banners?.[0] || trending?.[0] || firstItems(home?.content_sections)[0];
  const sansekaiProvider = useMemo(() => getSansekaiProvider(sansekaiProviderId), [sansekaiProviderId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setAppLoading(true);
        setError('');
        const [homeData, trendingData] = await Promise.all([getHome(), getTrending(0, 18)]);
        if (cancelled) return;
        setHome(homeData);
        setTrending(trendingData.items || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setAppLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadSansekai(provider = sansekaiProvider) {
    setSansekaiLoading(true);
    setSansekaiError('');

    try {
      const payload = await getSansekaiList(provider);
      setSansekaiItems(normalizeSansekaiItems(payload, provider));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSansekaiError(message);
      setSansekaiItems([]);
    } finally {
      setSansekaiLoading(false);
    }
  }

  useEffect(() => {
    loadSansekai(sansekaiProvider);
  }, [sansekaiProvider]);

  async function openDetails(item) {
    setSelectedItem(item);
    setDetails(null);
    setDetailLoading(true);
    setDetailError('');
    setError('');

    try {
      if (item.source === 'sansekai') {
        const provider = getSansekaiProvider(item.provider);
        if (provider.sourceType === 'hafizh' || provider.sourceType === 'dramaku') {
          setDetails(normalizeSansekaiDetail({ data: item.raw }, provider, item));
          return;
        }
        const payload = await getSansekaiDetail(provider, item);
        setDetails(normalizeSansekaiDetail(payload, provider, item));
      } else {
        const data = await getDetails(item.detailPath);
        setDetails(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setDetailError(message);
      setError(message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function playItem(item, season, episode) {
    const source = details?.detailPath === item.detailPath ? details : item;

    setPlaybackLoading(true);
    setError('');

    try {
      if (source.source === 'sansekai' || item.source === 'sansekai') {
        const provider = getSansekaiProvider(source.provider || item.provider);
        const detailData = source.sansekaiEpisodes ? source : normalizeSansekaiDetail(await getSansekaiDetail(provider, source), provider, source);
        const firstEpisode = detailData.sansekaiEpisodes?.[0]?.number || 1;
        const playEpisode = episode ?? firstEpisode;
        const episodeEntry = detailData.sansekaiEpisodes?.find((entry) => Number(entry.number) === Number(playEpisode));
        let streamUrl = episodeEntry?.url || '';

        if (!streamUrl) {
          const episodePayload = await getSansekaiEpisode(provider, detailData, playEpisode);
          streamUrl = extractStreamUrl(episodePayload);
        }

        if (provider.streamPath && streamUrl) {
          const decrypted = await decryptSansekaiStream(provider, streamUrl);
          streamUrl = extractStreamUrl(decrypted) || streamUrl;
        }

        if (!streamUrl) throw new Error('Stream Sansekai belum tersedia untuk episode ini.');

        setPlayback({ vid_url: streamUrl });
        setNowPlaying(`${detailData.title} • Episode ${formatEpisodeLabel(playEpisode)}`);
        setSelectedItem(null);
        window.setTimeout(() => document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' }), 80);
        return;
      }

      const detailData = source.seasons_list ? source : await getDetails(item.detailPath);
      const firstEpisodeGroup = getEpisodes(detailData)[0];
      const playSeason = season ?? firstEpisodeGroup?.season ?? 0;
      const playEpisode = episode ?? firstEpisodeGroup?.episodes?.[0] ?? 0;
      const data = await getPlayback({
        subjectId: detailData.subjectId,
        detailPath: detailData.detailPath,
        season: playSeason,
        episode: playEpisode,
        quality: selectedQuality,
      });
      setPlayback(data);
      setNowPlaying(`${detailData.title} • Episode ${formatEpisodeLabel(playEpisode)}`);
      setSelectedItem(null);
      window.setTimeout(() => document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPlaybackLoading(false);
    }
  }

  async function submitSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;

    setSearchLoading(true);
    setError('');

    try {
      const data = await searchTitles({ keyword: query.trim(), subjectType, perPage: 18 });
      setSearchResults(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSearchLoading(false);
    }
  }

  async function submitSansekaiSearch(event) {
    event.preventDefault();
    if (!sansekaiQuery.trim()) return;

    setSansekaiSearchLoading(true);
    setSansekaiError('');

    try {
      const payload = await searchSansekai(sansekaiProvider, sansekaiQuery.trim());
      setSansekaiItems(normalizeSansekaiItems(payload, sansekaiProvider));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSansekaiError(message);
      setSansekaiItems([]);
    } finally {
      setSansekaiSearchLoading(false);
    }
  }

  const rows = useMemo(() => {
    const sections = (home?.content_sections || []).slice(0, 5);
    return sections.map((section, index) => ({
      title: section.section_title,
      eyebrow: index % 2 === 0 ? 'KURASI FILMBOX' : 'PILIHAN EDITOR',
      items: (section.items || []).slice(0, 18),
    }));
  }, [home]);

  return (
    <>
      <nav className="top-nav">
        <a className="brand" href="#top" aria-label="Nontoncuy">
          <span>N</span>
          Nontoncuy
        </a>
        <div className="nav-links" aria-label="Navigasi utama">
          <a href="#trending">Trending</a>
          <a href="#apps">Apps</a>
          <a href="#search">Search</a>
          <a href="#player">Player</a>
        </div>
        <a className="nav-cta" href="#search">
          <Search size={16} />
          Cari
        </a>
      </nav>

      <main id="top">
        <Hero item={heroItem} loading={playbackLoading || appLoading} onPlay={playItem} onSelect={openDetails} />

        {error ? (
          <div className="app-shell">
            <div className="error-banner">
              <Sparkles size={18} />
              {error}
            </div>
          </div>
        ) : null}

        <PlayerPanel
          playback={playback}
          title={nowPlaying}
          poster={details?.cover_url || heroItem?.cover_url}
          onClose={() => {
            setPlayback(null);
            setNowPlaying(null);
          }}
        />

        <section className="content-band" id="trending">
          <div className="app-shell">
            <SectionHeader eyebrow="SEDANG RAMAI" title="Trending minggu ini." />
            {appLoading ? (
              <div className="loading-grid">
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="poster-skeleton" key={index} />
                ))}
              </div>
            ) : (
              <div className="poster-row">
                {trending.map((item) => (
                  <PosterCard key={`${item.subjectId}-${item.detailPath}`} item={item} onSelect={openDetails} />
                ))}
              </div>
            )}
          </div>
        </section>

        <SansekaiPanel
          provider={sansekaiProvider}
          providerId={sansekaiProviderId}
          setProviderId={setSansekaiProviderId}
          query={sansekaiQuery}
          setQuery={setSansekaiQuery}
          loading={sansekaiLoading}
          searchLoading={sansekaiSearchLoading}
          error={sansekaiError}
          items={sansekaiItems}
          onRefresh={() => loadSansekai(sansekaiProvider)}
          onSearch={submitSansekaiSearch}
          onSelect={openDetails}
        />

        <SearchPanel
          query={query}
          setQuery={setQuery}
          subjectType={subjectType}
          setSubjectType={setSubjectType}
          loading={searchLoading}
          results={searchResults}
          onSubmit={submitSearch}
          onSelect={openDetails}
        />

        {rows.map((row) => (
          <PosterRow key={row.title} {...row} onSelect={openDetails} />
        ))}
      </main>

      <DetailDrawer
        item={selectedItem}
        details={details}
        loading={detailLoading}
        detailError={detailError}
        playbackLoading={playbackLoading}
        selectedQuality={selectedQuality}
        onQualityChange={setSelectedQuality}
        onClose={() => setSelectedItem(null)}
        onPlay={playItem}
      />
    </>
  );
}
