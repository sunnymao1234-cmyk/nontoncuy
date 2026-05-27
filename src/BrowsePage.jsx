import { Calendar, ChevronLeft, ChevronRight, Film, LoaderCircle, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getAllMovies } from './api.js';

const perPage = 20;

function formatYear(value) {
  if (!value) return '';
  return String(value).slice(0, 4);
}

function getTotalPages(data) {
  const total = Number(data?.totalPages || data?.total_pages || data?.totalPage || 0);
  if (total > 0) return total;

  const totalItems = Number(data?.total || data?.totalItems || data?.total_items || 0);
  if (totalItems > 0) return Math.max(1, Math.ceil(totalItems / perPage));

  return 1;
}

function MovieCard({ item, onSelect }) {
  return (
    <button className="movie-card" onClick={() => onSelect(item)} type="button">
      <span className="movie-poster">
        {item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" /> : <span>Nontoncuy</span>}
        <span className="movie-chip">
          <Star size={13} />
          {item.rating || 'N/A'}
        </span>
      </span>
      <span className="movie-copy">
        <strong>{item.title}</strong>
        <span>
          <Film size={14} />
          {item.genre || 'Film'}
        </span>
        <span>
          <Calendar size={14} />
          {formatYear(item.releaseDate) || item.country || 'Unknown'}
        </span>
      </span>
    </button>
  );
}

export default function BrowsePage({ onSelect }) {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setError('');

      try {
        const data = await getAllMovies(page, perPage);
        if (cancelled) return;
        setItems(data.items || []);
        setTotalPages(getTotalPages(data));
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadItems();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const canGoNext = useMemo(() => {
    if (totalPages > 1) return page < totalPages - 1;
    return items.length >= perPage;
  }, [items.length, page, totalPages]);

  return (
    <section className="browse-band" id="all-movies">
      <div className="app-shell">
        <div className="browse-header">
          <div>
            <p className="eyebrow">INDOCAST FILMBOX</p>
            <h2>All Movies</h2>
          </div>
          <div className="browse-counter">
            <span>20 per page</span>
            <strong>Page {page + 1}</strong>
          </div>
        </div>

        {error ? <div className="drawer-notice browse-notice">{error}</div> : null}

        {loading ? (
          <div className="movie-grid">
            {Array.from({ length: perPage }, (_, index) => (
              <div className="poster-skeleton" key={index} />
            ))}
          </div>
        ) : items.length ? (
          <>
            <div className="movie-grid">
              {items.map((item) => (
                <MovieCard key={`${item.subjectId}-${item.detailPath}`} item={item} onSelect={onSelect} />
              ))}
            </div>

            <div className="pagination" aria-label="All Movies pagination">
              <button className="pagination-button" type="button" disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="pagination-info">
                Page {page + 1}{totalPages > 1 ? ` of ${totalPages}` : ''}
              </span>
              <button className="pagination-button" type="button" disabled={!canGoNext || loading} onClick={() => setPage((value) => value + 1)}>
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="browse-empty">
            <p>Belum ada film untuk halaman ini.</p>
          </div>
        )}
      </div>
    </section>
  );
}
