const store = new WeakMap();
const get = key => store.get(key);

export const set = (key, value) => store.set(key, value);
export const _c = get, _v = get, _V = get;