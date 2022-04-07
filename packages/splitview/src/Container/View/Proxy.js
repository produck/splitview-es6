import { Lang, Math, Object, Type } from '@produck/charon';

import { put, _ } from '../../reference.js';
import { ViewContext } from './Context.js';
import { SideAccessor } from '../Field/index.js';
import * as utils from '../utils.js';

import * as $ from './symbol.js';

export class ViewProxy {
	constructor(container) {
		put(this, new ViewContext(this, _(container)));
		Object.freeze(this);
	}

	get element() {
		return _(this)[$.ELEMENT];
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
		if (!Type.isNumber(value) || value <= 0) {
			Lang.Throw.TypeError('Invalid min, a number(>0) expected.');
		}

		_(this)[$.MIN] = Math.trunc(value);
	}

	get max() {
		return _(this)[$.MAX];
	}

	set max(value) {
		if (!Type.isNumber(value) || value < _(this)[$.MIN]) {
			Lang.Throw.TypeError('Invalid max, a number(>=.min) expected.');
		}

		_(this)[$.MAX] = Math.trunc(value);
	}

	setSize(value, side = 'next') {
		if (!Type.isNumber(value) || value <= 0) {
			Lang.Throw.TypeError('Invalid value, a number(>0) expected.');
		}

		if (!SideAccessor[side]) {
			Lang.Throw.TypeError('Invalid side, `previous` or `next` expected.');
		}

		const _this = _(this);
		const finalValue = Math.trunc(utils.clip(_this[$.MIN], _this[$.MAX], value));

		if (_this[$.SIZE] !== finalValue) {
			_this[$.SET_SIZE](finalValue, SideAccessor[side]);
		}

		return _this[$.SIZE];
	}
}
