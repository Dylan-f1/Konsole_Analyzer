const store = new Map();

export function getCache(url) {
  return store.get(url) ?? null;
}

export function setCache(url, data) {
  store.set(url, data);
}
