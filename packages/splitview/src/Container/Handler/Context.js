import { Math, Type } from '@produck/charon';
import { Dom, Event } from '@produck/charon-browser';

import * as utils from '../utils.js';
import * as Side from './side.js';

import * as $ from './symbol.js';
import * as $C from '../symbol.js';
import * as $V from '../View/symbol.js';

const SiblingGetter = {
	[$.VIEW_PREVIOUS]: handler => handler[$.VIEW_PREVIOUS][$V.HANDLER_PREVIOUS],
	[$.VIEW_NEXT]: handler => handler[$.VIEW_NEXT][$V.HANDLER_NEXT]
};

const Other = {
	[$.VIEW_PREVIOUS]: $.VIEW_NEXT,
	[$.VIEW_NEXT]: $.VIEW_PREVIOUS
};

export class HandlerContext {
	constructor(container) {
		const element = utils.createDivWithClassName('sv-handler');

		this[$.CONTAINER] = container;
		this[$.ELEMENT] = element;
		this[$.VIEW_PREVIOUS] = null;
		this[$.VIEW_NEXT] = null;
		this[$.RESIZABLE] = null;

		Dom.addEventListener(element, 'mousedown', event => {
			Event.stopPropagation(event);
			container[$C.UPDATE_ALL_VIEW_LAST_SIZE]();
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

	[$.MOVE](delta, side) {
		const totalThisSize = Side.Size[side](this);
		const totalThisMin = Side.Limit[side][$V.MIN](this);
		const otherSide = Other[side];
		const totalThatSize = Side.Size[otherSide](this);
		const totalThatMax = Side.Limit[otherSide][$V.MAX](this);

		delta = Math.min(delta, totalThisSize - totalThisMin);
		delta = Math.min(delta, totalThatMax - totalThatSize);

		console.log(this, delta);
		let freeShrink = delta;

		for (const view of this[side][$V.SIBLINGS](Side.Direction[side], true)) {
			const lastSize = view[$V.LAST_SIZE];
			const finalSize = Math.max(view[$V.MIN], lastSize - freeShrink);

			console.log(view, lastSize, finalSize, freeShrink);

			view[$V.SIZE] = finalSize;
			freeShrink -= lastSize - finalSize;

			if (freeShrink <= 0) {
				break;
			}
		}

		let freeGrow = delta;

		for (const view of this[otherSide][$V.SIBLINGS](Side.Direction[otherSide], true)) {
			const lastSize = view[$V.LAST_SIZE];
			const finalSize = Math.min(view[$V.MAX], lastSize + freeGrow);

			view[$V.SIZE] = finalSize;
			freeGrow -= finalSize - lastSize;

			if (freeGrow <= 0) {
				break;
			}
		}
	}
}