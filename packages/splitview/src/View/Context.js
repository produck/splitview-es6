import * as Dom from '../utils/dom';
import * as Lang from '../utils/lang';
import { ResizingField } from './Field/index';

import * as $ from './symbol';
import * as $C from '../Container/symbol';
import * as $F from './Field/symbol';
import * as $a from '../Axis/symbol';

/** @typedef {import('../Container/Context').SplitviewContainerContext} SplitviewContainerContext */
/** @typedef {import('./Interface').SplitviewViewInterface} SplitviewViewInterface */
/** @typedef {import('./Field/Field').Field} Field */

export class SplitviewBaseViewContext {
	/**
	 * @param {SplitviewBaseViewContext} containerContext
	 */
	constructor(containerContext) {
		this[$.CONTAINER] = containerContext;

		/**
		 * @type {SplitviewViewContext | SplitviewBaseViewContext | null}
		 */
		this[$.NEXT] = null;

		/**
		 * @type {SplitviewViewContext | SplitviewBaseViewContext | null}
		 */
		this[$.PREVIOUS] = null;
	}

	get [$.RESIZABLE]() {
		return false;
	}

	/**
	 * @param {(view: SplitviewViewContext) => void} callback
	 * @param {$.NEXT | $.PREVIOUS} [side=$.NEXT]
	 */
	[$.FOR_EACH](callback, side = $.NEXT) {
		let sibling = this[side];

		while (sibling !== null && sibling[side] !== null) {
			callback(sibling);
			sibling = sibling[side];
		}
	}
}

const
	MOUSEMOVE = 'mousemove',
	MOUSEUP = 'mouseup',
	MOUSEDOWN = 'mousedown';

export class SplitviewViewContext extends SplitviewBaseViewContext {
	/**
	 * @param {SplitviewViewInterface} viewInterface
	 * @param {SplitviewContainerContext} containerContext
	 */
	constructor(viewInterface, containerContext) {
		super(containerContext);

		this[$.INTERFACE] = viewInterface;
		this[$.CONTAINER] = containerContext;

		const
			viewElement = Dom.createDivElement(),
			handlerElement = Dom.createDivElement();

		Dom.addClass(viewElement, 'sv-view');
		Dom.addClass(handlerElement, 'sv-handler');

		this[$.VIEW_ELEMENT] = viewElement;
		this[$.HANDLER_ELEMENT] = handlerElement;

		this[$.MAX] = Dom.WINDOW.screen.width * 4;
		this[$.MIN] = 0;

		Dom.addEventListener(handlerElement, MOUSEDOWN, () => this[$.RESIZE_BY_EVENT]());
	}

	get [$.AXIS]() {
		return this[$.CONTAINER][$C.AXIS];
	}

	get [$.RESIZABLE]() {
		return this[$.MIN] !== this[$.MAX];
	}

	get [$.SIZE]() {
		return this[$.VIEW_ELEMENT][this[$.AXIS][$a.PROPERTY_SIZE]];
	}

	/**
	 * @param {number} value
	 */
	set [$.SIZE](value) {
		value = Lang.MATH_TRUNC(value);

		if (this[$.SIZE] !== value) {
			Dom.setStyle(this[$.VIEW_ELEMENT], {
				[this[$.AXIS][$a.STYLE_SIZE]]: `${value}px`
			});

			this[$.FOR_EACH](sibling => sibling[$.FIX_OFFSET]());
		}
	}

	get [$.OFFSET]() {
		return this[$.VIEW_ELEMENT][this[$.AXIS][$a.PROPERTY_OFFSET]];
	}

	[$.FIX_OFFSET]() {
		const propertyNameOfOffset = this[$.AXIS][$a.STYLE_OFFSET];
		const previousView = this[$.PREVIOUS];
		const offset = previousView[$.OFFSET] + previousView[$.SIZE];

		Dom.setStyle(this[$.VIEW_ELEMENT], {
			[propertyNameOfOffset]: `${offset}px`
		});

		Dom.setStyle(this[$.HANDLER_ELEMENT], {
			[propertyNameOfOffset]: `${offset}px`
		});
	}

	[$.RESET]() {
		const { [$.AXIS]: axis } = this;

		Dom.setStyle(this[$.VIEW_ELEMENT], {
			[axis[$a.CROSS_STYLE_SIZE]]: '100%',
			[axis[$a.CROSS_STYLE_OFFSET]]: 0
		});

		Dom.setStyle(this[$.HANDLER_ELEMENT], {
			[axis[$a.CROSS_STYLE_SIZE]]: '100%',
			[axis[$a.CROSS_STYLE_OFFSET]]: 0,
			[axis[$a.STYLE_SIZE]]: '4px',
			display: this[$.PREVIOUS][$.RESIZABLE] ? 'block' : 'none'
		});
	}

	/**
	 * @param {number} deltaSize
	 * @param {Field} field
	 * @param {Map<SplitviewViewContext, number>} originalSizeMap
	 */
	[$.UPDATE_VIEW_STATE](deltaSize, field, originalSizeMap) {
		const {
			[$F.SIDE]: side,
			[$F.PULLED_VIEW]: pulledView,
			[$F.LIMIT_PULLING_MAX]: pulledLimitMax,
			[$F.LIMIT_PUSHING_MIN]: pushedLimitMin,
			[$F.ORIGINAL_PULLIND_SIZE]: pulledOriginalSize,
			[$F.ORIGINAL_PUSHING_SIZE]: pushedOriginalSize
		} = field;

		const finalPulledViewSize = pulledView[$.SIZE] = Lang.MATH_MIN(
			/**
			 * The size of view equal to view.max. No pulling.
			 */
			pulledLimitMax,

			/**
			 * All pushed view size has been equaled to its view.min. No pushing.
			 */
			pulledOriginalSize + pushedOriginalSize - pushedLimitMin,

			/**
			 * A typical case that the `deltaSize` is the real delta size.
			 */
			pulledOriginalSize + deltaSize
		);

		/**
		 * The `pulled view` & all `pushed views` MUST be resized together.
		 *
		 * Because number of view changing size a time may be less than last time.
		 * So use `forEach` not `find`. No need for more optimization.
		 */
		let freeDelta = finalPulledViewSize - pulledOriginalSize;

		pulledView[$.FOR_EACH](view => {
			const originalSize = originalSizeMap.get(view);

			const finalDelta = originalSize - freeDelta > view[$.MIN]
				? freeDelta
				: originalSize - view[$.MIN];

			view[$.SIZE] = originalSize - finalDelta;
			freeDelta -= finalDelta;
		}, side);
	}

	/**
	 * @param {MouseEvent} event
	 */
	[$.RESIZE_BY_EVENT](event) {
		const { [$C.AXIS]: axis, [$C.DIRECTION]: direction } = this[$.CONTAINER];

		/**
		 * @param {MouseEvent} event
		 * @returns {number}
		 */
		const getPosition = event => event[axis[$a.PROPERTY_POSITION]];

		const originalPosition = getPosition(event);
		const bodyClass = `sv-resizing-${direction}`;
		const originalSizeMap = this[$.CONTAINER][$C.SIZE_MAP]();

		const fieldMap = {
			[$.NEXT]: ResizingField(this, $.NEXT),
			[$.PREVIOUS]: ResizingField(this, $.PREVIOUS)
		};

		Dom.addClass(Dom.BODY, bodyClass);

		const updateViewStateWhenMoving = event => {
			const delta = getPosition(event) - originalPosition;

			/**
			 * - There will be a smaller probability that pointer position moving back
			 *   to the original. Just only `return` means no size adjustment this time
			 *   and may cause all sizes of views keeping at a previous state.
			 *
			 * - Restoring sizes of all views every time, avoids creating a dirty state
			 *   when `which` is reversed causing sizes of last views not be restored.
			 */

			for (const [view, originalSize] of originalSizeMap) {
				view[$.SIZE] = originalSize;
			}

			if (delta !== 0) {
				const field = fieldMap[delta > 0 ? $.NEXT : $.PREVIOUS];

				this[$.UPDATE_VIEW_STATE](Lang.MATH_ABS(delta), field, originalSizeMap);
			}
		};

		const endResizing = () => {
			Dom.addEventListener(Dom.WINDOW, MOUSEMOVE, updateViewStateWhenMoving);
			Dom.addEventListener(Dom.WINDOW, MOUSEUP, endResizing);
			Dom.removeClass(Dom.BODY, bodyClass);
		};

		Dom.addEventListener(Dom.WINDOW, MOUSEMOVE, updateViewStateWhenMoving);
		Dom.addEventListener(Dom.WINDOW, MOUSEUP, endResizing);
	}

	/**
	 * @param {number} value
	 */
	[$.RESIZE_BY_CALLING](value) {
		const finalValue = Lang.MATH_CLIP(this[$.MIN], this[$.MAX], value);
		const isComplete = () => Lang.MATH_ABS(finalValue - this[$.SIZE]) === 0;
		const THIS_HANDLER = -1, NEXT_HANDLER = 1;

		/**
		 * @param {THIS_HANDLER | NEXT_HANDLER} handler
		 */
		const resize = (handler) => {
			const delta = value - this[$.SIZE];
			const deltaSize = Lang.MATH_ABS(delta);
			const field = ResizingField(
				handler === THIS_HANDLER ? this[$.NEXT] : this,
				delta * handler > 0 ? $.NEXT : $.PREVIOUS
			);

			this[$.UPDATE_VIEW_STATE](deltaSize, field, this[$.CONTAINER][$C.SIZE_MAP]());
		};

		if (!isComplete()) {
			resize(NEXT_HANDLER);

			if (!isComplete()) {
				resize(THIS_HANDLER);
			}
		}
	}
}