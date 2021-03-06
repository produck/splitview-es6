import { Math, Type } from '@produck/charon';
import { Dom, Event, Global } from '@produck/charon-browser';

import * as utils from '../utils.js';
import * as Side from './side.js';

import * as $ from './symbol.js';
import * as $C from '../symbol.js';
import * as $V from '../View/symbol.js';
import * as $A from '../Axis/symbol.js';

const VIEW_FORWARD_HANDLER = {
	[$.VIEW_PREVIOUS]: [$V.HANDLER_PREVIOUS],
	[$.VIEW_NEXT]: [$V.HANDLER_NEXT]
};

const Other = {
	[$.VIEW_PREVIOUS]: $.VIEW_NEXT,
	[$.VIEW_NEXT]: $.VIEW_PREVIOUS
};

const MovingDirection = delta => delta > 0 ? $.VIEW_NEXT : $.VIEW_PREVIOUS;
const ACTIVE_CLASS = 'sv-active';
export class HandlerContext {
	constructor(container) {
		const element = utils.createDivWithClassName('sv-handler');

		this[$.CONTAINER] = container;
		this[$.ELEMENT] = element;

		this[$.RESIZABLE] =
		this[$.VIEW_PREVIOUS] =
		this[$.VIEW_NEXT] = null;

		const getPosition = event => event[container[$C.AXIS][$A.PROPERTY_POSITION]];

		let startPosition = 0;

		const moveHandler = event => {
			const position = getPosition(event);
			const delta = position - startPosition;
			const direction = MovingDirection(delta);

			this[$.MOVE](Math.abs(delta), direction);
		};

		Dom.addEventListener(element, 'mousedown', event => {
			Event.stopPropagation(event);
			container[$C.STASH_ALL_VIEWS_SIZE]();
			startPosition = getPosition(event);
			Dom.addEventListener(Global.WINDOW, 'mousemove', moveHandler);
			Dom.addClass(element, ACTIVE_CLASS);
			utils.setStyle(Dom.body, 'cursor', container[$C.AXIS][$A.CURSOR]);
		});

		Dom.addEventListener(Global.WINDOW, 'mouseup', () => {
			Dom.removeEventListener(Global.WINDOW, 'mousemove', moveHandler);
			Dom.removeClass(element, ACTIVE_CLASS);
			utils.setStyle(Dom.body, 'cursor', '');
		});
	}

	[$.SET_RESIZABLE](flag) {
		if (this[$.RESIZABLE] !== flag) {
			this[$.RESIZABLE] = flag;
			utils.setStyle(this[$.ELEMENT], 'display', flag ? 'block' : 'none');
		}
	}

	*[$.SIBLINGS](viewSide = $.VIEW_NEXT) {
		const FORWARD_HANDLER = VIEW_FORWARD_HANDLER[viewSide];
		let current = this;

		while (Type.Not.Null(current = current[viewSide][FORWARD_HANDLER])) {
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

		let freeShrink = delta;

		for (const view of this[side][$V.SIBLINGS](Side.Direction[side])) {
			const lastSize = view[$V.LAST_SIZE];
			const finalSize = Math.max(view[$V.MIN], lastSize - freeShrink);

			view[$V.SIZE] = finalSize;
			freeShrink -= lastSize - finalSize;
		}

		let freeGrow = delta;

		for (const view of this[otherSide][$V.SIBLINGS](Side.Direction[otherSide])) {
			const lastSize = view[$V.LAST_SIZE];
			const finalSize = Math.min(view[$V.MAX], lastSize + freeGrow);

			view[$V.SIZE] = finalSize;
			freeGrow -= finalSize - lastSize;
		}

		this[$.CONTAINER][$C.UPDATE_OFFSET]();
	}
}