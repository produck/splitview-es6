import * as $H from './symbol.js';
import * as $V from '../View/symbol.js';
import { Array } from '@produck/charon';

export const Direction = {
	[$H.VIEW_PREVIOUS]: [$V.PREVIOUS],
	[$H.VIEW_NEXT]: [$V.NEXT]
};

const sum = (handler, side, property) => {
	return Array.from(handler[side][$V.SIBLINGS](Direction[side]))
		.reduce((sum, view) => sum + view[property], 0);
};

export const Limit = {
	[$H.VIEW_PREVIOUS]: {
		[$V.MIN]: handler => sum(handler, $H.VIEW_PREVIOUS, $V.MIN),
		[$V.MAX]: handler => sum(handler, $H.VIEW_PREVIOUS, $V.MAX)
	},
	[$H.VIEW_NEXT]: {
		[$V.MIN]: handler => sum(handler, $H.VIEW_NEXT, $V.MIN),
		[$V.MAX]: handler => sum(handler, $H.VIEW_NEXT, $V.MAX)
	}
};

export const Size = {
	[$H.VIEW_PREVIOUS]: handler => sum(handler, $H.VIEW_PREVIOUS, $V.LAST_SIZE),
	[$H.VIEW_NEXT]: handler => sum(handler, $H.VIEW_NEXT, $V.LAST_SIZE)
};