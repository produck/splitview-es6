import * as Dom from '../utils/dom';

import { MAP as AXIS_MAP } from '../Axis';
import { ResizingField } from './Field';

import * as Style from './style';

import * as $ from './symbol';
import * as $C from '../Container/symbol';
import * as $F from './Field/symbol';
import * as $a from '../Axis/symbol';

export class SplitviewBaseViewContext {
	/**
	 * @param {import('../Container/Context').SplitviewContainerContext} containerContext
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

	/**
	 * @param {(view: SplitviewViewContext) => void} callback
	 * @param {import('./symbol').NEXT | import('./symbol').PREVIOUS} side
	 */
	[$.FOR_EACH](callback, side = $.NEXT) {
		let sibling = this[side];

		while (sibling !== null && sibling[side] !== null) {
			callback(sibling);
			sibling = sibling[side];
		}
	}
}

export class SplitviewViewContext extends SplitviewBaseViewContext {
	/**
	 * @param {import('./Interface').SplitviewViewInterface} viewInterface
	 * @param {import('../Container/Context').SplitviewContainerContext} containerContext
	 */
	constructor(viewInterface, containerContext) {
		super(containerContext);

		this[$.INTERFACE] = viewInterface;
		this[$.CONTAINER] = containerContext;

		const
			viewElement = Dom.createDivElement(),
			handlerElement = Dom.createDivElement();

		Dom.setClassName(viewElement, 'sv-view');
		Dom.setClassName(handlerElement, 'sv-handler');
		Dom.setStyle(viewElement, Style.FIXED_VIEW_STYLE);
		Dom.setStyle(handlerElement, Style.FIXED_HANDLER_STYLE);

		this[$.VIEW_ELEMENT] = viewElement;
		this[$.HANDLER_ELEMENT] = handlerElement;

		this[$.MAX] = Dom.WINDOW.screen.width * 4;
		this[$.MIN] = 0;

		Dom.addEventListener(handlerElement, () => this[$.START_RESIZING]());
	}

	get [$.AXIS]() {
		return AXIS_MAP[this[$.CONTAINER][$C.DIRECTION]];
	}

	get [$.SIZE]() {
		return this[$.VIEW_ELEMENT][this[$.AXIS][$a.PROPERTY_SIZE]];
	}

	/**
	 * @param {number} value
	 */
	set [$.SIZE](value) {
		value = Math.trunc(value);

		if (this[$.SIZE] !== value) {

		}
	}

	get [$.OFFSET]() {
		return this[$.VIEW_ELEMENT][this[$.AXIS][$a.PROPERTY_OFFSET]];
	}

	[$.FIX_OFFSET]() {

	}

	/**
	 * @param {number} deltaSize
	 * @param {import('./Field/Field').Field} field
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

		const finalPulledViewSize = pulledView[$.SIZE] = Math.min(
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
	[$.START_RESIZING](event) {
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

		Dom.addClass(Dom.DOCUMENT.body, bodyClass);

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

				this[$.UPDATE_VIEW_STATE](Math.abs(delta), field, originalSizeMap);
			}
		};

		const endResizing = () => {
			Dom.addEventListener(Dom.WINDOW, 'mousemove', updateViewStateWhenMoving);
			Dom.addEventListener(Dom.WINDOW, 'mouseup', endResizing);
			Dom.removeClass(Dom.DOCUMENT.body, bodyClass);
		};

		Dom.addEventListener(Dom.WINDOW, 'mousemove', updateViewStateWhenMoving);
		Dom.addEventListener(Dom.WINDOW, 'mouseup', endResizing);
	}
}