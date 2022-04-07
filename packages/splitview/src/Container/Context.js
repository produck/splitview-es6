import { Console, Math, Type } from '@produck/charon';
import { Dom } from '@produck/charon-browser';

import * as View from './View/index.js';
import * as Handler from './Handler/index.js';
import { AXIS, NULL_AXIS } from './Axis/index.js';
import * as Reference from '../reference.js';
import * as utils from './utils.js';

import * as $ from './symbol.js';
import * as $V from './View/symbol.js';
import * as $H from './Handler/symbol.js';
import * as $A from './Axis/symbol.js';

const TAIL = 0.000001;

const createHeadRearViewPair = (container) => {
	const head = new View.BaseContext(container);
	const rear = new View.BaseContext(container);

	head[$V.NEXT] = rear;
	rear[$V.PREVIOUS] = head;

	const handler = new Handler.Context();

	handler[$H.VIEW_PREVIOUS] = head;
	handler[$H.VIEW_NEXT] = rear;
	head[$V.HANDLER_NEXT] = handler;
	rear[$V.HANDLER_PREVIOUS] = handler;

	Dom.appendChild(container[$.ELEMENT_HANDLER_CONTAINER], handler[$H.ELEMENT]);

	return [head, rear];
};

const observer = new ResizeObserver(entries => {
	for (const containerElement of entries) {
		Reference._(containerElement.target)[$.RESET]();
	}
});

/**
 * Container Structure:
 *
 *     *    +    +    *      - Handler
 *    / \  / \  / \  / \
 *  []---{}---{}---{}---[]   - View
 * HEAD   <-- == -->   REAR
 *   Previous || Next
 */
export class ContainerContext {
	constructor(proxy) {
		this.$ = proxy;

		const viewSlot = utils.createDivWithClassName('sv-container');
		const handlerSlot = utils.createDivWithClassName('sv-handler-container');

		Reference.put(viewSlot, this);
		Dom.appendChild(viewSlot, handlerSlot);

		this[$.ELEMENT_VIEW_CONTAINER] = viewSlot;
		this[$.ELEMENT_HANDLER_CONTAINER] = handlerSlot;

		[this[$.VIEW_HEAD], this[$.VIEW_REAR]] = createHeadRearViewPair(this);

		this[$.AXIS] = NULL_AXIS;
		this[$.DIRECTION] = 'row';
	}

	get [$.SIZE]() {
		return this[$.ELEMENT_VIEW_CONTAINER][this[$.AXIS][$A.PROPERTY_SIZE]];
	}

	get [$.DIRECTION]() {
		return this[$.AXIS][$A.NAME];
	}

	set [$.DIRECTION](value) {
		const originAxisName = this[$.AXIS][$A.NAME];

		if (originAxisName !== value) {
			const containerElement = this[$.ELEMENT_VIEW_CONTAINER];

			Dom.removeClass(containerElement, `sv-${originAxisName}`);
			Dom.addClass(containerElement, `sv-${value}`);
			this[$.AXIS] = AXIS[value];
			this[$.RESET]();
		}
	}

	[$.HAS_VIEW](view) {
		return view[$V.CONTAINER] === this;
	}

	[$.MOUNT](element) {
		observer.observe(this[$.ELEMENT_VIEW_CONTAINER]);
		Dom.appendChild(element, this[$.ELEMENT_VIEW_CONTAINER]);
		this[$.RESET]();
	}

	[$.UNMOUNT]() {
		const element = this[$.ELEMENT_VIEW_CONTAINER];
		const { parentElement } = element;

		if (Type.Not.Null(parentElement)) {
			observer.unobserve(this[$.ELEMENT_VIEW_CONTAINER]);
			Dom.removeChild(parentElement, element);
		}
	}

	[$.INSERT](newView, referenceView) {
		const handler = new Handler.Context();
		const previousView = referenceView[$V.PREVIOUS];
		const previousHandler = referenceView[$V.HANDLER_PREVIOUS];

		newView[$V.PREVIOUS] = previousView;
		previousView[$V.NEXT] = newView;
		newView[$V.NEXT] = referenceView;
		referenceView[$V.PREVIOUS] = newView;

		newView[$V.HANDLER_PREVIOUS] = previousHandler;
		previousHandler[$H.VIEW_NEXT] = newView;
		newView[$V.HANDLER_NEXT] = handler;
		handler[$H.VIEW_PREVIOUS] = newView;
		referenceView[$V.HANDLER_PREVIOUS] = handler;
		handler[$H.VIEW_NEXT] = referenceView;

		Dom.appendChild(this[$.ELEMENT_HANDLER_CONTAINER], handler[$H.ELEMENT]);
	}

	[$.APPEND_VIEW](view) {
		this[$.INSERT](view, this[$.VIEW_REAR]);
		Dom.appendChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT]);

		this[$.RESET]();
	}

	[$.REMOVE_VIEW](view) {
		const {
			[$V.HANDLER_PREVIOUS]: previousHandler,
			[$V.HANDLER_NEXT]: nextHandler,
			[$V.PREVIOUS]: previousView,
			[$V.NEXT]: nextView
		} = view;

		previousView[$V.NEXT] = nextView;
		nextView[$V.PREVIOUS] = previousView;
		previousHandler[$H.VIEW_NEXT] = nextHandler;
		nextView[$V.HANDLER_PREVIOUS] = previousHandler;

		nextHandler[$H.VIEW_PREVIOUS] = nextHandler[$H.VIEW_NEXT] =
			view[$V.PREVIOUS] = view[$V.NEXT] =
			view[$V.HANDLER_PREVIOUS] = view[$V.HANDLER_NEXT] = null;

		Dom.removeChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT]);
		Dom.removeChild(this[$.ELEMENT_HANDLER_CONTAINER], nextHandler[$H.ELEMENT]);

		this[$.RESET]();
	}

	[$.INSERT_BEFORE](newView, referenceView) {
		this[$.INSERT](newView, referenceView);

		Dom.insertBefore(
			this[$.ELEMENT_VIEW_CONTAINER],
			newView[$V.ELEMENT],
			referenceView[$V.ELEMENT]
		);

		this[$.RESET]();
	}

	[$.SET_VIEW_FINAL_STYLE](view, size, offset) {
		const viewElement = view[$V.ELEMENT];
		const axis = this[$.AXIS];

		utils.setStyle(viewElement, axis[$A.STYLE_SIZE], `${size}px`);
		utils.setStyle(viewElement, axis[$A.STYLE_OFFSET], `${offset}px`);
	}

	[$.UPDATE_HANDLERS_RESIZABLE](forceAllNot = false) {
		const headView = this[$.VIEW_HEAD];
		const rearView = this[$.VIEW_REAR];
		const headHandler = headView[$V.HANDLER_NEXT];
		const rearHandler = rearView[$V.HANDLER_PREVIOUS];

		if (forceAllNot) {
			for (const handler of headHandler[$H.SIBLINGS]()) {
				handler[$H.SET_RESIZABLE](false);
			}
		} else {
			const handlerList = Array.from(headHandler[$H.SIBLINGS]());
			const record = new Map(handlerList.map(view => [view, true]));

			for (const [views, handlerSide] of [
				[headView[$V.SIBLINGS]($V.NEXT), $V.HANDLER_NEXT],
				[rearView[$V.SIBLINGS]($V.PREVIOUS), $V.HANDLER_PREVIOUS],
			]) {
				let min = 0, max = 0;

				for (const view of views) {
					const handler = view[handlerSide];

					min += view[$V.MIN];
					max += view[$V.MAX];
					record.set(handler, record.get(handler) && min !== max);
				}
			}

			for (const [handler, resizable] of record) {
				handler[$H.SET_RESIZABLE](resizable);
			}
		}

		headHandler[$H.SET_RESIZABLE](false);
		rearHandler[$H.SET_RESIZABLE](false);
	}

	[$.UPDATE_HANDLERS_OFFSET]() {
		const offsetProperty = this[$.AXIS][$A.STYLE_OFFSET];
		let offset = 0;

		for (const handler of this[$.VIEW_HEAD][$V.HANDLER_NEXT][$H.SIBLINGS]()) {
			offset += handler[$H.VIEW_PREVIOUS][$V.SIZE];
			utils.setStyle(handler[$H.ELEMENT], offsetProperty, `${offset}px`);
		}
	}

	[$.GET_RECORD]() {
		const record = new Map();

		for (const view of this[$.VIEW_HEAD][$V.SIBLINGS]()) {
			record.set(view, view[$V.SIZE]);
		}

		return record;
	}

	[$.RESET]() {
		if (Type.isNull(this[$.ELEMENT_VIEW_CONTAINER].parentElement)) {
			return;
		}

		const totalSize = this[$.SIZE];
		const record = [];

		let minSize = 0, totalWeight = TAIL;

		for (const view of this[$.VIEW_HEAD][$V.SIBLINGS]()) {
			const min = view[$V.MIN];
			const weight = view[$V.MAX] - min;

			record.push([view, weight, min]);
			minSize += min;
			totalWeight += weight;
		}

		let freeSize = totalSize - minSize, offset = 0;

		if (freeSize > 0) {
			for (const [view, weight, size] of record) {
				const delta = Math.round((weight + TAIL) / totalWeight * freeSize);
				const finalSize = utils.clip(view[$V.MIN], view[$V.MAX], size + delta);
				const finalDelta = finalSize - size;

				freeSize -= finalDelta;
				totalWeight -= weight;
				this[$.SET_VIEW_FINAL_STYLE](view, finalSize, offset);
				offset += finalSize;
			}
		}

		this[$.UPDATE_HANDLERS_OFFSET]();
		this[$.UPDATE_HANDLERS_RESIZABLE](minSize > totalSize || freeSize > 0);

		if (freeSize > 0) {
			Console.warn(`Free ${freeSize}.`);
		}
	}
}