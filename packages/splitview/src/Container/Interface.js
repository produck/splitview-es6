import { SplitviewContainerContext } from './Context';
import { SplitviewViewInterface, _ as _v } from './View/Interface';
import * as $C from './symbol';
import * as $V from './View/symbol';

/**
 * @type {Map<SplitviewContainerInterface, SplitviewContainerContext>}
 */
const map = new Map();

/**
 * @param {SplitviewContainerInterface} containerInterface
 */
const _c = containerInterface => map.get(containerInterface);

(function observe() {
	for (const [, context] of map) {
		context[$C.UPDATE_LAST_SIZE]();
	}

	requestAnimationFrame(observe);
}());

const DIRECTION_REG = /^(row|column)$/;

export class SplitviewContainerInterface {
	constructor() {
		map.set(this, new SplitviewContainerContext(this));
		Object.seal(this);
	}

	get element() {
		return _c(this)[$C.VIEW_CONTAINER_ELEMENT];
	}

	get direction() {
		return _c(this)[$C.DIRECTION];
	}

	set direction(value) {
		if (!DIRECTION_REG.test(value)) {
			throw new Error('A direction MUST be `row` or `column`.');
		}

		_c(this)[$C.DIRECTION] = value;
	}

	get firstView() {
		return _c(this)[$C.HEAD_VIEW][$V.NEXT][$V.INTERFACE];
	}

	get lastView() {
		return _c(this)[$C.REAR_VIEW][$V.PREVIOUS][$V.INTERFACE];
	}

	get viewList() {

	}

	/**
	 * @param {HTMLElement} element
	 */
	mount(element) {
		_c(this)[$C.MOUNT](element);
		_c(this)[$C.RESET]();
	}

	destroy() {
		map.delete(this);
		_c(this)[$C.UNMOUNT]();
	}

	reset() {
		_c(this)[$C.RESET]();
	}

	/**
	 * @param {SplitviewViewInterface} view
	 */
	appendView(view) {
		_c(this)[$C.ASSERT_OWNED_VIEW](_v(view));
		_c(this)[$C.APPEND_VIEW](_v(view));
		_c(this)[$C.ADJUST]();

		return view;
	}

	/**
	 * @param {SplitviewViewInterface} view
	 */
	removeView(view) {
		_c(this)[$C.ASSERT_OWNED_VIEW](_v(view));
		_c(this)[$C.REMOVE_VIEW](_v(view));
		_c(this)[$C.ADJUST]();

		return view;
	}

	/**
	 * @param {SplitviewViewInterface} newView
	 * @param {SplitviewViewInterface | null} referenceView
	 */
	insertBefore(newView, referenceView = null) {
		_c(this)[$C.ASSERT_OWNED_VIEW](_v(newView));

	}

	createView() {
		return new SplitviewViewInterface(_c(this));
	}
}