export const
	PREVIOUS_MIN = 'i',
	PREVIOUS_MAX = 'a',
	NEXT_MIN = 'I',
	NEXT_MAX = 'A';

import * as $H from './symbol.js';
import * as $V from '../View/symbol.js';

export const Direction = {
	[$H.VIEW_PREVIOUS]: [$V.PREVIOUS],
	[$H.VIEW_NEXT]: [$V.NEXT]
};

const getTotal = (handler, side, property) => {
	let size = 0;

	for (const view of handler[side][$V.SIBLINGS](Direction[side])) {
		size += view[property];
	}

	return size;
};

export const Limit = {
	[$H.VIEW_PREVIOUS]: {
		[$V.MIN]: handler => getTotal(handler, $H.VIEW_PREVIOUS, $V.MIN),
		[$V.MAX]: handler => getTotal(handler, $H.VIEW_PREVIOUS, $V.MAX)
	},
	[$H.VIEW_NEXT]: {
		[$V.MIN]: handler => getTotal(handler, $H.VIEW_NEXT, $V.MIN),
		[$V.MAX]: handler => getTotal(handler, $H.VIEW_NEXT, $V.MAX)
	}
};

export const Size = {
	[$H.VIEW_PREVIOUS]: handler => getTotal(handler, $H.VIEW_PREVIOUS, $V.LAST_SIZE),
	[$H.VIEW_NEXT]: handler => getTotal(handler, $H.VIEW_NEXT, $V.LAST_SIZE)
};