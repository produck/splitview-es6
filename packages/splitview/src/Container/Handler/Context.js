import * as utils from '../utils.js';

import * as $ from './symbol.js';
import * as $V from '../View/symbol.js';
import { Type } from '@produck/charon';

const SiblingGetter = {
	[$.VIEW_PREVIOUS]: handler => handler[$.VIEW_PREVIOUS][$V.HANDLER_PREVIOUS],
	[$.VIEW_NEXT]: handler => handler[$.VIEW_NEXT][$V.HANDLER_NEXT]
};

export class HandlerContext {
	constructor() {
		const element = utils.createDivWithClassName('sv-handler');

		this[$.ELEMENT] = element;
		this[$.VIEW_PREVIOUS] = null;
		this[$.VIEW_NEXT] = null;
	}

	[$.SET_RESIZABLE](flag) {
		this[$.ELEMENT].style.setProperty('visibility', flag ? 'visible' : 'hidden');
	}

	*[$.SIBLINGS](side = $.VIEW_NEXT) {
		let current = this;

		while (Type.Not.Null(current = SiblingGetter[side])) {
			yield current;
		}
	}
}