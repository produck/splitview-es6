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

		this[$.ELEMENT] = utils.createDivWithClassName('sv-view');
	}

	[$.SET_SIZE](value, side) {

	}
}
