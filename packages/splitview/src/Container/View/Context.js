import {} from '@produck/charon';
import { Dom, Global } from '@produck/charon-browser';

import * as utils from '../utils.js';
import { BaseViewContext } from './BaseContext.js';

import * as $ from './symbol.js';
import * as $C from './symbol.js';

const MAX = Global.WINDOW.screen.width * 4;

export class ViewContext extends BaseViewContext {
	constructor(proxy, container) {
		super(container);

		this.$ = proxy;

		this[$.MAX] = MAX;
		this[$.MIN] = 0;

		const handlerElement = utils.createDivWithClassName('sv-handler');

		this[$.ELEMENT_VIEW] = utils.createDivWithClassName('sv-view');
		this[$.ELEMENT_HANDLER] = handlerElement;

		Dom.addEventListener(
			handlerElement,
			'mousedown',
			event => this[$.RESIZE_BY_EVENT](event)
		);
	}

	get [$.RESIZABLE]() {
		return this[$.MAX] !== this[$.MIN];
	}

	[$.RESIZE_BY_EVENT]() {
		console.log(1111);
	}

	[$.SET_SIZE](value, side) {

	}
}
