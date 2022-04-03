const map = new WeakMap();

export const put = (key, value) => map.set(key, value);
export const _ = key => map.get(key);