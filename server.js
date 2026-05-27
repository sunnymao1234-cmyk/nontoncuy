import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const indocastOrigin = 'https://indocast.site';
const sansekaiOrigin = 'https://api.sansekai.my.id';
const hafizhOrigin = 'https://db.hafizhibnusyam.my.id';
const dramakuOrigin = 'https://api.dramaku.biz.id';
const shivraOrigin = 'https://shivraapi.my.id';
const apiKey = process.env.INDOCAST_API_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function createIndocastHeaders(req, extra = {}) {
  const headers = {
    'x-api-key': apiKey || '',
    'user-agent': req.get('user-agent') || 'Nontoncuy/1.0',
    ...extra,
  };

  if (req.get('range')) headers.range = req.get('range');
  if (req.get('accept')) headers.accept = req.get('accept');
  if (req.get('content-type')) headers['content-type'] = req.get('content-type');

  return headers;
}

function localizeIndocastUrl(value) {
  if (!value || typeof value !== 'string') return value;
  if (!value.startsWith(`${indocastOrigin}/api/stream`)) return value;

  const url = new URL(value);
  return `/api/stream${url.search}`;
}

function localizePayload(value) {
  if (Array.isArray(value)) return value.map(localizePayload);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, localizePayload(localizeIndocastUrl(entry))]),
  );
}

async function proxyJsonRequest(req, res) {
  if (!apiKey) {
    res.status(500).json({ message: 'INDOCAST_API_KEY belum diatur di .env' });
    return;
  }

  const target = new URL(req.originalUrl, indocastOrigin);
  const requestOptions = {
    method: req.method,
    headers: createIndocastHeaders(req, { 'content-type': 'application/json' }),
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    requestOptions.body = JSON.stringify(req.body || {});
  }

  try {
    const upstream = await fetch(target, requestOptions);
    const contentType = upstream.headers.get('content-type') || '';
    const status = upstream.status;
    const raw = await upstream.text();

    res.status(status);

    if (contentType.includes('application/json')) {
      const parsed = raw ? JSON.parse(raw) : {};
      res.json(localizePayload(parsed));
      return;
    }

    res.type(contentType || 'text/plain').send(raw);
  } catch (error) {
    res.status(502).json({
      message: 'Gagal menghubungi Indocast',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

async function proxySansekaiJsonRequest(req, res) {
  const upstreamPath = req.originalUrl.replace(/^\/api\/sansekai/, '/api');
  const target = new URL(upstreamPath, sansekaiOrigin);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        accept: 'application/json',
        'user-agent': req.get('user-agent') || 'Nontoncuy/1.0',
      },
    });
    const contentType = upstream.headers.get('content-type') || '';
    const raw = await upstream.text();

    res.status(upstream.status);
    if (contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      res.json(raw ? JSON.parse(raw) : {});
      return;
    }

    res.type(contentType || 'text/plain').send(raw);
  } catch (error) {
    res.status(502).json({
      message: 'Gagal menghubungi Sansekai API',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

async function proxyHafizhJsonRequest(req, res) {
  const upstreamPath = req.originalUrl.replace(/^\/api\/hafizh/, '/api');
  const target = new URL(upstreamPath, hafizhOrigin);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        accept: 'application/json',
        'user-agent': req.get('user-agent') || 'Nontoncuy/1.0',
      },
    });
    const contentType = upstream.headers.get('content-type') || '';
    const raw = await upstream.text();

    res.status(upstream.status);
    if (contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      res.json(raw ? JSON.parse(raw) : {});
      return;
    }

    res.type(contentType || 'text/plain').send(raw);
  } catch (error) {
    res.status(502).json({
      message: 'Gagal menghubungi Hafizh DramaBox API',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

async function proxyDramakuJsonRequest(req, res) {
  const upstreamPath = req.originalUrl.replace(/^\/api\/dramaku/, '');
  const target = new URL(upstreamPath, dramakuOrigin);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        accept: 'application/json',
        'user-agent': req.get('user-agent') || 'Nontoncuy/1.0',
      },
    });
    const contentType = upstream.headers.get('content-type') || '';
    const raw = await upstream.text();

    res.status(upstream.status);
    if (contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      res.json(raw ? JSON.parse(raw) : {});
      return;
    }

    res.type(contentType || 'text/plain').send(raw);
  } catch (error) {
    res.status(502).json({
      message: 'Gagal menghubungi Dramaku API',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

async function proxyShivraJsonRequest(req, res) {
  const upstreamPath = req.originalUrl.replace(/^\/api\/shivra/, '');
  const target = new URL(upstreamPath, shivraOrigin);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        accept: 'application/json',
        'user-agent': req.get('user-agent') || 'Nontoncuy/1.0',
      },
    });
    const contentType = upstream.headers.get('content-type') || '';
    const raw = await upstream.text();

    res.status(upstream.status);
    if (contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      res.json(raw ? JSON.parse(raw) : {});
      return;
    }

    res.type(contentType || 'text/plain').send(raw);
  } catch (error) {
    res.status(502).json({
      message: 'Gagal menghubungi Shivra API',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

async function proxyStreamRequest(req, res) {
  if (!apiKey) {
    res.status(500).json({ message: 'INDOCAST_API_KEY belum diatur di .env' });
    return;
  }

  const target = new URL(req.originalUrl, indocastOrigin);

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: createIndocastHeaders(req),
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (['content-encoding', 'transfer-encoding', 'connection'].includes(lowerKey)) return;
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    res.status(502).json({
      message: 'Gagal membuka stream Indocast',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

function convertSrtToVtt(value) {
  return `WEBVTT\n\n${value.replace(/\r/g, '').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')}`;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: 'indocast' });
});

app.get('/api/subtitle', async (req, res) => {
  const subtitleUrl = String(req.query.url || '');

  try {
    const parsed = new URL(subtitleUrl);
    if (parsed.protocol !== 'https:') throw new Error('Subtitle URL tidak valid');

    const upstream = await fetch(parsed);
    if (!upstream.ok) throw new Error(`Subtitle upstream ${upstream.status}`);

    const text = await upstream.text();
    res.type('text/vtt').send(convertSrtToVtt(text));
  } catch (error) {
    res.status(400).json({
      message: 'Gagal memuat subtitle',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

app.all('/api/stream', proxyStreamRequest);
app.use('/api/sansekai', proxySansekaiJsonRequest);
app.use('/api/hafizh', proxyHafizhJsonRequest);
app.use('/api/dramaku', proxyDramakuJsonRequest);
app.use('/api/shivra', proxyShivraJsonRequest);
app.all('/api/filmbox/*path', proxyJsonRequest);

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/*path', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const server = app.listen(port, () => {
    console.log(`Nontoncuy API proxy listening on http://127.0.0.1:${port}`);
  });
  globalThis.nontoncuyServer = server;
}

export default app;
