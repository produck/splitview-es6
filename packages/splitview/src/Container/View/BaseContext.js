import { Type } from '@produck/charon';

import * as $ from './symbol.js';
import * as $C from '../symbol.js';

export class BaseViewContext {
	constructor(container) {
		this.$ = null;

		this[$.CONTAINER] = container;
		this[$.PREVIOUS] = null;
		this[$.NEXT] = null;
		this[$.HANDLER_PREVIOUS] = null;
		this[$.HANDLER_NEXT] = null;
	}

	get [$.AXIS]() {
		return this[$.CONTAINER][$C.AXIS];
	}

	*[$.SIBLINGS](side = $.NEXT) {
		let sibling = this[side];

		while (Type.Not.Null(sibling) && Type.Not.Null(sibling[side])) {
			yield sibling;

			sibling = sibling[side];
		}
	}
}