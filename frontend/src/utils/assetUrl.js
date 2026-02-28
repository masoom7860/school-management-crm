const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const FRONT_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const FALLBACK_ASSET_ORIGIN = import.meta.env.VITE_FALLBACK_ASSET_ORIGIN || 'http://localhost:5000';

const normalizeBase = (base) => {
  if (!base) return '';
  return base.replace(/\/$/, '');
};

const isLocalOrigin = (origin) => /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?$/i.test(origin || '');

const resolveRelativeToOrigin = (origin, relativePath) => {
  const trimmedOrigin = normalizeBase(origin);
  const trimmedPath = (relativePath || '').replace(/^\//, '').replace(/\/api$/i, '');
  if (!trimmedPath) return trimmedOrigin;
  return `${trimmedOrigin}/${trimmedPath}`;
};

const getFilesBase = () => {
  const normalizedApiBase = normalizeBase(API_BASE);
  if (/^https?:\/\//i.test(normalizedApiBase)) {
    // If API_BASE is absolute, strip trailing '/api' if present to get file host
    return normalizedApiBase.replace(/\/api$/i, '');
  }

  if (normalizedApiBase) {
    // Relative API path configured (e.g. "/api") – assume same origin
    if (FRONT_ORIGIN) {
      return resolveRelativeToOrigin(FRONT_ORIGIN, normalizedApiBase);
    }
  }

  if (FRONT_ORIGIN && !isLocalOrigin(FRONT_ORIGIN)) {
    return normalizeBase(FRONT_ORIGIN);
  }

  return normalizeBase(FALLBACK_ASSET_ORIGIN);
};

export const resolveAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (/^https?:\/\//i.test(url)) return url;

  const base = getFilesBase();
  if (!base) return url.startsWith('/') ? url : `/${url}`;

  const clean = url.replace(/^\/+/, '');
  return `${base}/${clean}`;
};

export default resolveAssetUrl;
