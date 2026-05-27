import app from '../server.js';

export const config = {
  maxDuration: 30,
};

export default function handler(req, res) {
  const originalUrl = new URL(req.url || '/', 'http://nontoncuy.local');
  const routedPath = originalUrl.searchParams.get('path');

  if (routedPath) {
    originalUrl.searchParams.delete('path');
    const query = originalUrl.searchParams.toString();
    req.url = `/api/${routedPath}${query ? `?${query}` : ''}`;
  }

  return app(req, res);
}
