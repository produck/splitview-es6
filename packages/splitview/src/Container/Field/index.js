import * as $ from './symbol.js';
import * as $V from '../View/symbol.js';
import * as $H from '../Handler/symbol.js';

export const SideAccessor = {
	previous: {
		[$.HANDLER]: view => view[$V.HANDLER_PREVIOUS],
		[$.SIDE]: delta => delta > 0 ? $H.VIEW_PREVIOUS : $H.VIEW_NEXT
	},
	next: {
		[$.HANDLER]: view => view[$V.HANDLER_NEXT],
		[$.SIDE]: delta => delta > 0 ? $H.VIEW_NEXT : $H.VIEW_PREVIOUS
	}
};
