import { Type } from '@produck/charon';

import * as $ from './symbol.js';
import * as $C from '../symbol.js';

export class BaseViewContext {
	constructor(container) {
		this[$.CONTAINER] = container;

		this.$ =
		this[$.PREVIOUS] =
		this[$.NEXT] =
		this[$.HANDLER_PREVIOUS] =
		this[$.HANDLER_NEXT] = null;
	}

	get [$.AXIS]() {
		return this[$.CONTAINER][$C.AXIS];
	}

	*[$.SIBLINGS](side = $.NEXT) {
		let sibling = this;

		while (Type.Not.Null(sibling) && Type.Not.Null(sibling[side])) {
			yield sibling;

			sibling = sibling[side];
		}
	}
}