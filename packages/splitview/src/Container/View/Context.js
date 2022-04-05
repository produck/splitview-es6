import { Math } from '@produck/charon';
import { Global } from '@produck/charon-browser';

import * as utils from '../utils.js';
import { BaseViewContext } from './BaseContext.js';
import { SideAccessor } from '../Field/index.js';

import * as $ from './symbol.js';
import * as $A from '../Axis/symbol.js';
import * as $H from '../Handler/symbol.js';
import * as $F from '../Field/symbol.js';

const MAX = Global.WINDOW.screen.width * 4;

export class ViewContext extends BaseViewContext {
	constructor(proxy, container) {
		super(container);

		this.$ = proxy;

		this[$.MAX] = MAX;
		this[$.MIN] = 0;

		this[$.ELEMENT] = utils.createDivWithClassName('sv-view');
	}

	get [$.SIZE]() {
		return this[$.ELEMENT][this[$.AXIS][$A.PROPERTY_SIZE]];
	}

	[$.SET_SIZE](value, side) {
		const accessor = SideAccessor[side];
		const handler = accessor[$F.HANDLER](this);
		const delta = value - this[$.SIZE];
		const direction = accessor[$F.SIDE](delta);

		handler[$H.MOVE](Math.abs(delta), direction);
	}
}
