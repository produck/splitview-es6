import * as Lang from '../utils/lang';
import { SplitviewContainerContext } from './Context';
import { SplitviewViewInterface, _ as _v } from '../View/Interface';

import * as $C from './symbol';
import * as $V from '../View/symbol';

/**
 * @type {WeakMap<SplitviewContainerInterface, SplitviewContainerContext>}
 */
const map = Lang.WEAKMAP();

/**
 * @param {SplitviewContainerInterface} containerInterface
 */
const _ = containerInterface => map.get(containerInterface);
const DIRECTION_REG = /^(row|column)$/;

export class SplitviewContainerInterface {
	constructor() {
		map.set(this, new SplitviewContainerContext(this));
		Lang.OBJECT_SEAL(this);
	}

	get element() {
		return _(this)[$C.VIEW_CONTAINER_ELEMENT];
	}

	get direction() {
		return _(this)[$C.DIRECTION];
	}

	set direction(value) {
		if (!DIRECTION_REG.test(value)) {
			Lang.THROW('A direction MUST be `row` or `column`.');
		}

		const _this = _(this);

		if (value !== this[$C.DIRECTION]) {
			_this[$C.DIRECTION] = value;
			_this[$C.RESET]();
		}
	}

	get firstView() {
		return _(this)[$C.HEAD_VIEW][$V.NEXT][$V.INTERFACE];
	}

	get lastView() {
		return _(this)[$C.REAR_VIEW][$V.PREVIOUS][$V.INTERFACE];
	}

	get viewList() {
		const list = [];

		_(this)[$C.HEAD_VIEW][$V.FOR_EACH](view => list.push(view[$V.INTERFACE]));

		return list;
	}

	/**
	 * @param {HTMLElement} element
	 */
	mount(element) {
		const _this = _(this);

		_this[$C.MOUNT](element);
		_this[$C.RESET]();
	}

	destroy() {
		_(this)[$C.UNMOUNT]();
	}

	reset() {
		_(this)[$C.RESET]();
	}

	adjust() {
		_(this)[$C.ADJUST]();
	}

	/**
	 * @param {SplitviewViewInterface} view
	 */
	appendView(view) {
		const _this = _(this), _view = _v(view);

		_this[$C.ASSERT_OWNED_VIEW](_view);
		_this[$C.APPEND_VIEW](_view);
		_this[$C.RESET]();

		return view;
	}

	/**
	 * @param {SplitviewViewInterface} view
	 */
	removeView(view) {
		const _this = _(this), _view = _v(view);

		_this[$C.ASSERT_OWNED_VIEW](_view);
		_this[$C.REMOVE_VIEW](_view);
		_this[$C.RESET]();

		return view;
	}

	/**
	 * @param {SplitviewViewInterface} newView
	 * @param {SplitviewViewInterface | null} referenceView
	 */
	insertBefore(newView, referenceView = null) {
		const _this = _(this);
		const newViewContext = _v(newView);

		_this[$C.ASSERT_OWNED_VIEW](newViewContext, 'new');

		if (referenceView === null) {
			_this[$C.APPEND_VIEW](newViewContext);
		} else {
			const referenceViewContext = _v(referenceView);

			_this[$C.ASSERT_OWNED_VIEW](referenceViewContext, 'reference');
			//TODO is in view list;

			if (newViewContext[$V.PREVIOUS] !== null) {
				_this[$C.REMOVE_VIEW](newViewContext);
			}

			_this[$C.INSERT_BEFORE](newViewContext, referenceViewContext);
		}

		_this[$C.RESET]();

		return newView;
	}

	createView() {
		return new SplitviewViewInterface(_(this));
	}
}