import * as $ from './symbol.js';
import * as $V from '../symbol.js';
import * as $H from '../../Handler/symbol.js';

const previous = {
	[$.HANDLER]: view => view[$V.HANDLER_PREVIOUS],
	[$.DIRECTION]: delta => delta > 0 ? $H.VIEW_PREVIOUS : $H.VIEW_NEXT
};

const next = {
	[$.HANDLER]: view => view[$V.HANDLER_NEXT],
	[$.DIRECTION]: delta => delta > 0 ? $H.VIEW_NEXT : $H.VIEW_PREVIOUS
};

previous[$.OTHER] = next;
next[$.OTHER] = previous;

export const SideAccessor = { previous, next };
