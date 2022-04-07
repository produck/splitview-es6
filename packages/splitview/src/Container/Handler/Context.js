import { Type } from '@produck/charon';
import { Dom } from '@produck/charon-browser';

import * as utils from '../utils.js';

import * as $ from './symbol.js';
import * as $V from '../View/symbol.js';

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
		this[$.RESIZABLE] = null;

		Dom.addEventListener(element, 'mousedown', event => {
			console.log(event);
		});
	}

	[$.SET_RESIZABLE](flag) {
		if (this[$.RESIZABLE] !== flag) {
			this[$.RESIZABLE] = flag;
			utils.setStyle(this[$.ELEMENT], 'visibility', flag ? 'visible' : 'hidden');
		}
	}

	*[$.SIBLINGS](side = $.VIEW_NEXT) {
		let current = this;

		while (Type.Not.Null(current = SiblingGetter[side](current))) {
			yield current;
		}
	}

	[$.MOVE](distance, side, record) {
		console.log(distance, side);
	}
}