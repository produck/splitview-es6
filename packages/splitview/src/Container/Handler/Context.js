import * as utils from '../utils.js';

import * as $ from './symbol.js';

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
}