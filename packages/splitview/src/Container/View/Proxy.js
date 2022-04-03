import { Lang, Math, Object, Type } from '@produck/charon';

import { put, _ } from '../../reference.js';
import { ViewContext } from './Context.js';

import * as $ from './symbol.js';

const SIDE_REG = /^next|previous$/;

export class ViewProxy {
	constructor(container) {
		put(this, new ViewContext(this, _(container)));
		Object.freeze(this);
	}

	get element() {
		return _(this)[$.ELEMENT_VIEW];
	}

	get container() {
		return _(this)[$.CONTAINER].$;
	}

	get previous() {
		return _(this)[$.PREVIOUS].$;
	}

	get next() {
		return _(this)[$.NEXT].$;
	}

	get size() {
		return _(this)[$.SIZE];
	}

	get min() {
		return _(this)[$.MIN];
	}

	set min(value) {
		if (Type.isNumber(value) || value <= 0) {
			Lang.Throw.TypeError('Invalid min, a number(>0) expected.');
		}

		_(this)[$.MIN] = Math.trunc(value);
	}

	get max() {
		return _(this)[$.MAX];
	}

	set max(value) {
		if (Type.isNumber(value) || value <= _(this)[$.MIN]) {
			Lang.Throw.TypeError('Invalid max, a number(> .min) expected.');
		}

		_(this)[$.MAX] = Math.trunc(value);
	}

	setSize(value, side = 'next') {
		if (Type.isNumber(value) || value <= 0) {
			Lang.Throw.TypeError('Invalid size, a number(>0) expected.');
		}

		if (SIDE_REG.test(side)) {
			Lang.Throw.TypeError('Invalid side, `previous` or `next` expected.');
		}

		const finalValue = Math.trunc(value);

		_(this)[$.SET_SIZE](finalValue, side);

		return _(this)[$.SIZE];
	}
}
