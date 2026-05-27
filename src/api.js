const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || `Request gagal (${response.status})`);
  }

  return payload.data;
}

export async function getHome() {
  const response = await fetch('/api/filmbox/home');
  return readJson(response);
}

export async function getTrending(page = 0, perPage = 18) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  const response = await fetch(`/api/filmbox/trending?${params}`);
  return readJson(response);
}

export async function getAllMovies(page = 0, perPage = 20) {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    subjectType: '1',
  });
  const response = await fetch(`/api/filmbox/trending?${params}`);
  return readJson(response);
}

export async function searchTitles({ keyword, page = 1, perPage = 18, subjectType = '' }) {
  const body = {
    keyword,
    page: String(page),
    perPage: String(perPage),
  };

  if (subjectType) body.subjectType = String(subjectType);

  const response = await fetch('/api/filmbox/search', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });

  return readJson(response);
}

export async function getDetails(detailPath) {
  const params = new URLSearchParams({ detailPath });
  const response = await fetch(`/api/filmbox/details?${params}`);
  return readJson(response);
}

export async function getPlayback({ subjectId, detailPath, season = 0, episode = 0, quality = '', lang = 'in_id' }) {
  const params = new URLSearchParams({
    subjectId,
    detailPath,
    se: String(season),
    ep: String(episode),
    lang,
  });

  if (quality) params.set('quality', String(quality));

  const response = await fetch(`/api/filmbox/getplay?${params}`);
  return readJson(response);
}

export function subtitleProxyUrl(url) {
  if (!url) return '';
  return `/api/subtitle?url=${encodeURIComponent(url)}`;
}

async function readSansekaiJson(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error || payload.detail) {
    const upstreamError = typeof payload.error === 'object' ? payload.error.message || payload.error.code : payload.error;
    const detail = typeof payload.detail === 'string' ? payload.detail : '';
    if (detail.includes('Expecting value')) {
      throw new Error('Endpoint provider sedang error dari upstream.');
    }
    throw new Error(payload.message || upstreamError || detail || `Request gagal (${response.status})`);
  }

  return payload;
}

function providerApiBase(provider) {
  if (provider.sourceType === 'dramaku') return '/api/dramaku';
  if (provider.sourceType?.startsWith('shivra')) return '/api/shivra';
  return provider.sourceType === 'hafizh' ? '/api/hafizh' : '/api/sansekai';
}

export async function getSansekaiList(provider) {
  const response = await fetch(`${providerApiBase(provider)}${provider.listPath}`);
  return readSansekaiJson(response);
}

export async function searchSansekai(provider, query) {
  if (provider.sourceType === 'hafizh') {
    const response = await fetch(`${providerApiBase(provider)}${provider.searchPath}?keyword=${encodeURIComponent(query)}&page=1&size=20`);
    return readSansekaiJson(response);
  }

  if (provider.sourceType === 'dramaku') {
    const response = await fetch(`${providerApiBase(provider)}${provider.searchPath}?keyword=${encodeURIComponent(query)}&page=1&size=20&lang=in`);
    return readSansekaiJson(response);
  }

  if (provider.sourceType?.startsWith('shivra')) {
    const separator = provider.searchPath.includes('?') ? '&' : '?';
    const response = await fetch(`${providerApiBase(provider)}${provider.searchPath}${separator}q=${encodeURIComponent(query)}`);
    return readSansekaiJson(response);
  }

  const separator = provider.searchPath.includes('?') ? '&' : '?';
  const response = await fetch(`${providerApiBase(provider)}${provider.searchPath}${separator}query=${encodeURIComponent(query)}`);
  return readSansekaiJson(response);
}

export async function getSansekaiDetail(provider, item) {
  const id = item.subjectId || item.detailPath;
  if (provider.sourceType === 'hafizh') {
    const response = await fetch(`${providerApiBase(provider)}${provider.detailPath}/${encodeURIComponent(id)}`);
    return readSansekaiJson(response);
  }

  if (provider.sourceType === 'dramaku') {
    const response = await fetch(`${providerApiBase(provider)}${provider.detailPath}/${encodeURIComponent(id)}/v2?lang=in`);
    return readSansekaiJson(response);
  }

  if (provider.sourceType?.startsWith('shivra')) {
    const response = await fetch(`${providerApiBase(provider)}${provider.detailPath}/${encodeURIComponent(id)}`);
    return readSansekaiJson(response);
  }

  const response = await fetch(`${providerApiBase(provider)}${provider.detailPath}?${provider.idParam}=${encodeURIComponent(id)}`);
  return readSansekaiJson(response);
}

export async function getSansekaiEpisode(provider, item, episodeNumber) {
  if (!provider.episodePath) return item.raw || item;

  const id = item.subjectId || item.detailPath;
  if (provider.sourceType === 'hafizh') {
    const response = await fetch(`${providerApiBase(provider)}${provider.episodePath}?book_id=${encodeURIComponent(id)}&episode=${encodeURIComponent(episodeNumber || 1)}`, {
      method: 'POST',
    });
    return readSansekaiJson(response);
  }

  if (provider.sourceType === 'dramaku') {
    const response = await fetch(`${providerApiBase(provider)}${provider.episodePath}?bookId=${encodeURIComponent(id)}&episode=${encodeURIComponent(episodeNumber || 1)}&lang=in`);
    return readSansekaiJson(response);
  }

  if (provider.sourceType?.startsWith('shivra')) {
    const episodeEntry = item.sansekaiEpisodes?.find((entry) => Number(entry.number) === Number(episodeNumber || 1));
    const slug = episodeEntry?.slug || episodeEntry?.raw?.slug || id;
    const response = await fetch(`${providerApiBase(provider)}${provider.episodePath}/${encodeURIComponent(slug)}`);
    return readSansekaiJson(response);
  }

  const params = new URLSearchParams({ [provider.idParam]: id });

  if (provider.id === 'moviebox') {
    params.set('season', String(item.subjectType === 2 ? 1 : 0));
    params.set('episode', String(episodeNumber || 0));
  } else if (provider.id === 'dramanova') {
    params.set('fileId', String(item.raw?.fileId || item.raw?.file_id || id));
    params.delete(provider.idParam);
  } else if (provider.id === 'anime') {
    params.set('chapterUrlId', String(item.raw?.chapterUrlId || item.raw?.chapterUrlID || id));
    params.delete(provider.idParam);
  } else {
    params.set('episodeNumber', String(episodeNumber || 1));
  }

  const response = await fetch(`${providerApiBase(provider)}${provider.episodePath}?${params}`);
  return readSansekaiJson(response);
}

export async function decryptSansekaiStream(provider, url) {
  if (!provider.streamPath || !url) return { url };

  const response = await fetch(`${providerApiBase(provider)}${provider.streamPath}?url=${encodeURIComponent(url)}`);
  return readSansekaiJson(response);
}
