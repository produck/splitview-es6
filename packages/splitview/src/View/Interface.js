import * as Lang from '../utils/lang';
import * as Type from '../utils/type';
import { SplitviewViewContext } from './Context';

import * as $V from './symbol';
import * as $C from '../Container/symbol';

/** @typedef {import('../Container/Context').SplitviewContainerContext} SplitviewContainerContext */

/**
 * @type {WeakMap<SplitviewViewInterface, SplitviewViewContext>}
 */
const map = Lang.WEAKMAP();

/**
 * @param {SplitviewViewInterface} iView
 */
export const _ = iView => map.get(iView);

export class SplitviewViewInterface {
	/**
	 * @param {SplitviewContainerContext} containerContext
	 */
	constructor(containerContext) {
		map.set(this, new SplitviewViewContext(this, containerContext));
		Lang.OBJECT_SEAL(this);
	}

	get element() {
		return _(this)[$V.VIEW_ELEMENT];
	}

	get container() {
		return _(this)[$V.CONTAINER][$C.INTERFACE];
	}

	get previousSibling() {
		return _(this)[$V.PREVIOUS][$V.INTERFACE];
	}

	get nextSibling() {
		return _(this)[$V.NEXT][$V.INTERFACE];
	}

	get size() {
		return _(this)[$V.SIZE];
	}

	get min() {
		return _(this)[$V.MIN];
	}

	set min(value) {
		if (Type.isNumber(value)) {
			Lang.THROW('A number expected.');
		}

		value = Lang.MATH_TRUNC(value);

		if (this.size < value) {
			this.setSize(value);
		}

		_(this)[$V.MIN] = value;
	}

	get max() {
		return _(this)[$V.MAX];
	}

	set max(value) {
		if (Type.isNumber(value)) {
			Lang.THROW('A number expected.');
		}

		value = Lang.MATH_TRUNC(value);

		if (this.size > value) {
			this.setSize(value);
		}

		_(this)[$V.MAX] = value;
	}

	setSize(value) {
		if (Type.isNumber(value)) {
			Lang.THROW('A view size MUST be a number.');
		}

		const _this = _(this);

		_this[$V.RESIZE_BY_CALLING](Lang.MATH_TRUNC(value));

		return Lang.MATH_ABS(value - _this[$V.SIZE]);
	}
}