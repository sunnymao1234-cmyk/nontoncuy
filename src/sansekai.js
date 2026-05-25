export const sansekaiProviders = [
  {
    id: 'shivra-anime',
    label: 'Shivra Anime',
    eyebrow: 'ANIME',
    sourceType: 'shivra-otd',
    listPath: '/otd/ongoing?page=1',
    searchPath: '/otd/search',
    idParam: 'slug',
    detailPath: '/otd/anime',
    episodePath: '/otd/episode',
    idKeys: ['slug'],
    playerType: 'iframe',
  },
  {
    id: 'shivra-donghua',
    label: 'Shivra Donghua',
    eyebrow: 'DONGHUA',
    sourceType: 'shivra-dnh',
    listPath: '/dnh/ongoing?page=1',
    searchPath: '/dnh/search?page=1',
    idParam: 'slug',
    detailPath: '/dnh/detail',
    episodePath: '/dnh/episode',
    idKeys: ['slug'],
    playerType: 'iframe',
  },
  {
    id: 'dramaku',
    label: 'Dramaku',
    eyebrow: 'KATALOG',
    sourceType: 'dramaku',
    listPath: '/api/category/449?page=1&size=18&lang=in',
    searchPath: '/api/search',
    idParam: 'bookId',
    detailPath: '/api/detail',
    episodePath: '/api/stream',
    idKeys: ['bookId', 'originalBookId', 'id'],
  },
  {
    id: 'hafizh-dramabox',
    label: 'DramaBox ID',
    eyebrow: 'AKTIF',
    sourceType: 'hafizh',
    listPath: '/dramas/trending?page=1',
    searchPath: '/search',
    idParam: 'book_id',
    detailPath: '/dramas',
    episodePath: '/chapters/video',
    idKeys: ['id', 'book_id', 'bookId'],
  },
  {
    id: 'dramabox',
    label: 'DramaBox',
    eyebrow: 'SHORT DRAMA',
    listPath: '/dramabox/latest',
    searchPath: '/dramabox/search',
    idParam: 'bookId',
    detailPath: '/dramabox/detail',
    episodePath: '/dramabox/allepisode',
    streamPath: '/dramabox/decrypt',
    idKeys: ['bookId', 'book_id', 'bookID', 'id'],
  },
  {
    id: 'pinedrama',
    label: 'PineDrama',
    eyebrow: 'SHORT DRAMA',
    listPath: '/pinedrama/trending',
    searchPath: '/pinedrama/search',
    idParam: 'collection_id',
    detailPath: '/pinedrama/detail',
    episodePath: '/pinedrama/episode',
    idKeys: ['collection_id', 'collectionId', 'id'],
  },
  {
    id: 'reelshort',
    label: 'ReelShort',
    eyebrow: 'SHORT DRAMA',
    listPath: '/reelshort/homepage',
    searchPath: '/reelshort/search',
    idParam: 'bookId',
    detailPath: '/reelshort/detail',
    episodePath: '/reelshort/episode',
    idKeys: ['bookId', 'book_id', 'id'],
  },
  {
    id: 'shortmax',
    label: 'ShortMax',
    eyebrow: 'SHORT DRAMA',
    listPath: '/shortmax/latest',
    searchPath: '/shortmax/search',
    idParam: 'shortPlayId',
    detailPath: '/shortmax/detail',
    episodePath: '/shortmax/episode',
    idKeys: ['shortPlayId', 'short_play_id', 'id'],
  },
  {
    id: 'goodshort',
    label: 'GoodShort',
    eyebrow: 'SHORT DRAMA',
    listPath: '/goodshort/trending',
    searchPath: '/goodshort/search',
    idParam: 'bookId',
    detailPath: '/goodshort/detail',
    episodePath: '/goodshort/allepisode',
    streamPath: '/goodshort/decrypt',
    idKeys: ['bookId', 'book_id', 'id'],
  },
  {
    id: 'freereels',
    label: 'FreeReels',
    eyebrow: 'SHORT DRAMA',
    listPath: '/freereels/homepage',
    searchPath: '/freereels/search',
    idParam: 'key',
    detailPath: '/freereels/detailAndAllEpisode',
    episodePath: null,
    idKeys: ['key', 'bookId', 'id'],
  },
  {
    id: 'dramanova',
    label: 'DramaNova',
    eyebrow: 'DRAMA & KOMIK',
    listPath: '/dramanova/home?page=1',
    searchPath: '/dramanova/search',
    idParam: 'dramaId',
    detailPath: '/dramanova/detail',
    episodePath: '/dramanova/getvideo',
    idKeys: ['dramaId', 'drama_id', 'id'],
  },
  {
    id: 'anime',
    label: 'Anime',
    eyebrow: 'ANIME',
    listPath: '/anime/latest',
    searchPath: '/anime/search',
    idParam: 'urlId',
    detailPath: '/anime/detail',
    episodePath: '/anime/getvideo',
    idKeys: ['urlId', 'url_id', 'url', 'id'],
  },
  {
    id: 'moviebox',
    label: 'MovieBox',
    eyebrow: 'MOVIEBOX',
    listPath: '/moviebox/trending?page=0',
    searchPath: '/moviebox/search',
    idParam: 'subjectId',
    detailPath: '/moviebox/detail',
    episodePath: '/moviebox/sources',
    streamPath: '/moviebox/generate-link-stream-video',
    idKeys: ['subjectId', 'subject_id', 'id'],
  },
];

const titleKeys = ['title', 'name', 'bookName', 'dramaName', 'seriesName', 'videoName', 'animeTitle'];
const imageKeys = ['cover', 'cover_url', 'coverUrl', 'poster', 'poster_url', 'posterUrl', 'image', 'imageUrl', 'thumb', 'thumbnail', 'banner'];
const descriptionKeys = ['description', 'desc', 'summary', 'synopsis', 'introduction'];
const episodeKeys = ['episodeNumber', 'episode', 'chapter', 'chapterNumber', 'number', 'index'];
const streamKeys = ['url', 'video_url', 'videoUrl', 'stream', 'streamUrl', 'playUrl', 'm3u8', 'mp4', 'src'];

function isShivraProvider(provider) {
  return provider.sourceType?.startsWith('shivra');
}

function pick(object, keys) {
  if (!object || typeof object !== 'object') return '';
  for (const key of keys) {
    const value = object[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function collectObjects(value, output = []) {
  if (Array.isArray(value)) {
    for (const entry of value) collectObjects(entry, output);
    return output;
  }

  if (value && typeof value === 'object') {
    output.push(value);
    for (const entry of Object.values(value)) collectObjects(entry, output);
  }

  return output;
}

function looksLikeMedia(object, provider) {
  return Boolean(pick(object, titleKeys) && (pick(object, imageKeys) || pick(object, provider.idKeys)));
}

function parseEpisodeNumber(value, fallback = 1) {
  const text = String(value || '');
  const episodeMatch = text.match(/episode\s*(\d+)/i);
  const slugMatch = text.match(/(?:^|-)(\d+)(?:-|$)/);
  return Number(episodeMatch?.[1] || slugMatch?.[1] || fallback);
}

function joinTags(value, fallback = '') {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return value || fallback;
}

function normalizeShivraItems(payload, provider) {
  const buckets = [
    payload?.data?.list,
    payload?.data?.latest_release,
    payload?.data?.latest,
    payload?.data?.popular_today,
    payload?.data?.recommendation,
    payload?.data?.slider,
    Array.isArray(payload?.data) ? payload.data : null,
  ];
  const items = buckets.find((bucket) => Array.isArray(bucket)) || [];

  return items.map((object, index) => {
    const id = String(object.slug || `${provider.id}-${index}`);
    const episodeNumber = parseEpisodeNumber(object.episode || object.title || object.slug, 0);

    return {
      source: 'sansekai',
      provider: provider.id,
      providerLabel: provider.label,
      subjectId: id,
      detailPath: id,
      title: String(object.title || 'Tanpa judul'),
      description: String(object.synopsis || object.description || ''),
      cover_url: String(object.cover || object.thumbnail || ''),
      genre: joinTags(object.genres || object.genre || object.tags, object.type || provider.eyebrow),
      rating: object.rating || object.skor || '',
      releaseDate: object.date || object.release_date || object.released_on || '',
      totalEpisode: episodeNumber,
      raw: object,
    };
  });
}

function normalizeShivraEpisodes(data, provider) {
  const episodes = provider.sourceType === 'shivra-otd' ? data?.episode_list : data?.episodes;

  return (episodes || [])
    .map((object, index) => {
      const title = object.title || `Episode ${object.episode || index + 1}`;
      const number = Number(object.episode) || parseEpisodeNumber(title || object.slug, index + 1);

      return {
        number,
        slug: String(object.slug || ''),
        title: String(title),
        date: object.date || object.release_date || '',
        raw: object,
      };
    })
    .filter((episode) => episode.slug);
}

export function getSansekaiProvider(providerId) {
  return sansekaiProviders.find((provider) => provider.id === providerId) || sansekaiProviders[0];
}

export function normalizeSansekaiItems(payload, provider) {
  const seen = new Set();

  if (isShivraProvider(provider)) {
    return normalizeShivraItems(payload, provider);
  }

  if (provider.sourceType === 'hafizh') {
    return (payload?.data || []).map((object, index) => ({
      source: 'sansekai',
      provider: provider.id,
      providerLabel: provider.label,
      subjectId: String(object.id || `${provider.id}-${index}`),
      detailPath: String(object.id || `${provider.id}-${index}`),
      title: String(object.title || 'Tanpa judul'),
      description: String(object.introduction || ''),
      cover_url: String(object.cover_image || ''),
      genre: Array.isArray(object.tags) ? object.tags.join(', ') : 'DramaBox',
      rating: '',
      releaseDate: '',
      totalEpisode: Number(object.episode_count || 1),
      sansekaiEpisodes: Array.from({ length: Number(object.episode_count || 1) }, (_, episodeIndex) => ({ number: episodeIndex + 1 })),
      raw: object,
    }));
  }

  if (provider.sourceType === 'dramaku') {
    return (payload?.data?.bookList || payload?.data || []).map((object, index) => ({
      source: 'sansekai',
      provider: provider.id,
      providerLabel: provider.label,
      subjectId: String(object.bookId || object.originalBookId || `${provider.id}-${index}`),
      detailPath: String(object.bookId || object.originalBookId || `${provider.id}-${index}`),
      title: String(object.bookName || object.title || 'Tanpa judul'),
      description: String(object.introduction || ''),
      cover_url: String(object.cover || object.cover_image || ''),
      genre: Array.isArray(object.tags) ? object.tags.join(', ') : 'Dramaku',
      rating: object.ratings || '',
      releaseDate: object.shelfTime || '',
      totalEpisode: Number(object.chapterCount || object.episode_count || 1),
      sansekaiEpisodes: Array.from({ length: Number(object.chapterCount || object.episode_count || 1) }, (_, episodeIndex) => ({ number: episodeIndex + 1 })),
      raw: object,
    }));
  }

  return collectObjects(payload)
    .filter((object) => looksLikeMedia(object, provider))
    .map((object, index) => {
      const id = String(pick(object, provider.idKeys) || pick(object, ['id']) || `${provider.id}-${index}`);
      const title = String(pick(object, titleKeys));
      const key = `${provider.id}-${id}-${title}`;

      if (seen.has(key)) return null;
      seen.add(key);

      return {
        source: 'sansekai',
        provider: provider.id,
        providerLabel: provider.label,
        subjectId: id,
        detailPath: id,
        title,
        description: String(pick(object, descriptionKeys) || ''),
        cover_url: String(pick(object, imageKeys) || ''),
        genre: String(pick(object, ['genre', 'category', 'tags', 'type']) || provider.eyebrow),
        rating: pick(object, ['rating', 'score']) || '',
        releaseDate: pick(object, ['releaseDate', 'year', 'release']) || '',
        totalEpisode: Number(pick(object, ['totalEpisode', 'episodeCount', 'chapterCount', 'episodes']) || 0),
        raw: object,
      };
    })
    .filter(Boolean)
    .slice(0, 60);
}

export function normalizeSansekaiDetail(payload, provider, fallback) {
  if (isShivraProvider(provider)) {
    const data = payload?.data || fallback.raw || fallback;
    const episodes = normalizeShivraEpisodes(data, provider);
    const episodeCount = Number(data.total_episode || data.total_episodes || episodes.length || fallback.totalEpisode || 1);

    return {
      ...fallback,
      source: 'sansekai',
      provider: provider.id,
      providerLabel: provider.label,
      title: String(data.title || fallback.title),
      description: String(data.synopsis || data.description || fallback.description || ''),
      cover_url: String(data.cover || fallback.cover_url || ''),
      genre: joinTags(data.genre || data.genres, fallback.genre || provider.eyebrow),
      rating: data.skor || data.rating || fallback.rating || '',
      releaseDate: data.tanggal_rilis || data.released || data.release_date || fallback.releaseDate || '',
      totalEpisode: episodeCount,
      sansekaiEpisodes: episodes.length ? episodes : [{ number: 1, slug: data.slug || fallback.detailPath }],
      raw: data,
    };
  }

  if (provider.sourceType === 'hafizh') {
    const data = payload?.data && !payload.detail ? payload.data : fallback.raw || fallback;
    const episodeCount = Number(data.episode_count || fallback.totalEpisode || 1);

    return {
      ...fallback,
      source: 'sansekai',
      provider: provider.id,
      providerLabel: provider.label,
      title: String(data.title || fallback.title),
      description: String(data.introduction || fallback.description || ''),
      cover_url: String(data.cover_image || fallback.cover_url || ''),
      genre: Array.isArray(data.tags) ? data.tags.join(', ') : fallback.genre || 'DramaBox',
      totalEpisode: episodeCount,
      sansekaiEpisodes: Array.from({ length: episodeCount }, (_, index) => ({ number: index + 1 })),
      raw: data,
    };
  }

  if (provider.sourceType === 'dramaku') {
    const data = payload?.data?.bookId || payload?.data?.bookName ? payload.data : fallback.raw || fallback;
    const episodeCount = Number(data.chapterCount || data.episode_count || fallback.totalEpisode || 1);

    return {
      ...fallback,
      source: 'sansekai',
      provider: provider.id,
      providerLabel: provider.label,
      title: String(data.bookName || data.title || fallback.title),
      description: String(data.introduction || fallback.description || ''),
      cover_url: String(data.cover || data.cover_image || fallback.cover_url || ''),
      genre: Array.isArray(data.tags) ? data.tags.join(', ') : fallback.genre || 'Dramaku',
      rating: data.ratings || fallback.rating || '',
      totalEpisode: episodeCount,
      sansekaiEpisodes: Array.from({ length: episodeCount }, (_, index) => ({ number: index + 1 })),
      raw: data,
    };
  }

  const detailObject = collectObjects(payload).find((object) => looksLikeMedia(object, provider)) || payload;
  const episodes = normalizeSansekaiEpisodes(payload);

  return {
    ...fallback,
    source: 'sansekai',
    provider: provider.id,
    providerLabel: provider.label,
    title: String(pick(detailObject, titleKeys) || fallback.title),
    description: String(pick(detailObject, descriptionKeys) || fallback.description || ''),
    cover_url: String(pick(detailObject, imageKeys) || fallback.cover_url || ''),
    genre: String(pick(detailObject, ['genre', 'category', 'tags', 'type']) || fallback.genre || provider.eyebrow),
    rating: pick(detailObject, ['rating', 'score']) || fallback.rating || '',
    totalEpisode: Number(pick(detailObject, ['totalEpisode', 'episodeCount', 'chapterCount']) || episodes.length || fallback.totalEpisode || 1),
    sansekaiEpisodes: episodes.length ? episodes : [{ number: 1 }],
    raw: payload,
  };
}

export function normalizeSansekaiEpisodes(payload) {
  const seen = new Set();

  return collectObjects(payload)
    .map((object) => {
      const number = Number(pick(object, episodeKeys));
      const streamUrl = String(pick(object, streamKeys) || '');

      if (!number && !streamUrl) return null;
      const key = `${number || seen.size + 1}-${streamUrl}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return {
        number: number || seen.size,
        url: streamUrl,
        raw: object,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number)
    .slice(0, 120);
}

export function extractStreamUrl(payload, preferredQuality = '') {
  const shivraData = payload?.data;
  if (shivraData?.defaultstream || shivraData?.embed || shivraData?.stream || shivraData?.servers) {
    const quality = String(preferredQuality || '').replace('p', '');
    const streamGroups = Array.isArray(shivraData.stream) ? shivraData.stream : [];
    const selectedGroup = streamGroups.find((group) => String(group.quality || '').includes(quality)) || streamGroups[0];
    const providerUrl = selectedGroup?.providers?.find((entry) => entry.url)?.url || selectedGroup?.url;
    const serverUrl = Array.isArray(shivraData.servers) ? shivraData.servers.find((entry) => entry.src)?.src : '';

    return String(providerUrl || shivraData.defaultstream || shivraData.embed || serverUrl || '');
  }

  const dramakuData = payload?.data;
  if (dramakuData) {
    if (typeof dramakuData === 'string') return dramakuData;
    const dramakuStream = dramakuData.url || dramakuData.streamUrl || dramakuData.stream_url || dramakuData.m3u8 || dramakuData.mp4;
    if (dramakuStream) return String(dramakuStream);
  }

  const hafizhStream = payload?.data?.[0]?.stream_url?.[0];
  if (hafizhStream) {
    return String(hafizhStream.url || hafizhStream.stream_url || hafizhStream.video_url || hafizhStream.src || '');
  }

  const direct = pick(payload, streamKeys);
  if (direct) return String(direct);

  const object = collectObjects(payload).find((entry) => pick(entry, streamKeys));
  return object ? String(pick(object, streamKeys)) : '';
}
