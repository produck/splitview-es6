import { Math } from '@produck/charon';
import { Global } from '@produck/charon-browser';

import * as utils from '../utils.js';
import { BaseViewContext } from './BaseContext.js';

import * as $ from './symbol.js';
import * as $C from '../symbol.js';
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
		this[$.LAST_SIZE] = 0;

		this[$.ELEMENT] = utils.createDivWithClassName('sv-view');
	}

	get [$.SIZE]() {
		return this[$.ELEMENT][this[$.AXIS][$A.PROPERTY_SIZE]];
	}

	set [$.SIZE](value) {
		utils.setStyle(this[$.ELEMENT], this[$.AXIS][$A.STYLE_SIZE], `${value}px`);
	}

	[$.SET_OFFSET](value) {
		utils.setStyle(this[$.ELEMENT], this[$.AXIS][$A.STYLE_OFFSET], `${value}px`);
	}

	[$.UPDATE_LAST_SIZE]() {
		this[$.LAST_SIZE] = this[$.SIZE];
	}

	[$.SET_EXPECTED_SIZE](value, side, first = true) {
		const handler = side[$F.HANDLER](this);

		if (handler[$H.RESIZABLE]) {
			this[$.CONTAINER][$C.STASH_ALL_VIEWS_SIZE]();

			const delta = value - this[$.LAST_SIZE];
			const direction = side[$F.DIRECTION](delta);

			handler[$H.MOVE](Math.abs(delta), direction);
		}

		if (first && this[$.SIZE] !== value) {
			this[$.SET_EXPECTED_SIZE](value, side[$F.OTHER], false);
		}
	}
}
