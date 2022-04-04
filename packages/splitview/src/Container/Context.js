import { Console, Math, Type } from '@produck/charon';
import { Dom } from '@produck/charon-browser';

import * as View from './View/index.js';
import { AXIS, NULL_AXIS } from './Axis/index.js';
import * as utils from './utils.js';

import * as $ from './symbol.js';
import * as $V from './View/symbol.js';
import * as $A from './Axis/symbol.js';

const TAIL = 0.000001;

export class ContainerContext {
	constructor(proxy) {
		this.$ = proxy;

		const viewSlot = utils.createDivWithClassName('sv-container');
		const handlerSlot = utils.createDivWithClassName('sv-handler-container');

		Dom.appendChild(viewSlot, handlerSlot);

		this[$.ELEMENT_VIEW_CONTAINER] = viewSlot;
		this[$.ELEMENT_HANDLER_CONTAINER] = handlerSlot;

		const headView = this[$.VIEW_HEAD] = new View.BaseContext(this);
		const rearView = this[$.VIEW_REAR] = new View.BaseContext(this);

		headView[$V.NEXT] = rearView;
		rearView[$V.PREVIOUS] = headView;

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
		Dom.appendChild(element, this[$.ELEMENT_VIEW_CONTAINER]);
		this[$.RESET]();
	}

	[$.UNMOUNT]() {
		const element = this[$.ELEMENT_VIEW_CONTAINER];
		const { parentElement } = element;

		if (Type.Not.Null(parentElement)) {
			Dom.removeChild(parentElement, element);
		}
	}

	[$.APPEND_VIEW](view) {
		view[$V.PREVIOUS] = this[$.VIEW_REAR][$V.PREVIOUS];
		view[$V.NEXT] = this[$.VIEW_REAR];
		this[$.VIEW_REAR][$V.PREVIOUS][$V.NEXT] = view;
		this[$.VIEW_REAR][$V.PREVIOUS] = view;
		Dom.appendChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT_VIEW]);
		Dom.appendChild(this[$.ELEMENT_HANDLER_CONTAINER], view[$V.ELEMENT_HANDLER]);
	}

	[$.REMOVE_VIEW](view) {
		view[$V.PREVIOUS][$V.NEXT] = view[$V.NEXT];
		view[$V.NEXT][$V.PREVIOUS] = view[$V.PREVIOUS];
		view[$V.PREVIOUS] = view[$V.NEXT] = null;
		Dom.removeChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT_VIEW]);
		Dom.removeChild(this[$.ELEMENT_HANDLER_CONTAINER], view[$V.ELEMENT_HANDLER]);
	}

	[$.INSERT_BEFORE](newView, referenceView) {
		newView[$V.NEXT] = referenceView;
		newView[$V.PREVIOUS] = referenceView[$V.PREVIOUS];
		referenceView[$V.PREVIOUS][$V.NEXT] = newView;
		referenceView[$V.PREVIOUS] = newView;

		Dom.insertBefore(
			this[$.ELEMENT_VIEW_CONTAINER],
			newView[$V.ELEMENT_VIEW],
			referenceView[$V.ELEMENT_VIEW]
		);

		Dom.insertBefore(
			this[$.ELEMENT_HANDLER_CONTAINER],
			newView[$V.ELEMENT_HANDLER],
			referenceView[$V.ELEMENT_HANDLER]
		);
	}

	[$.SET_VIEW_FINAL_STYLE](view, size, offset) {
		const viewElement = view[$V.ELEMENT_VIEW];
		const handlerElement = view[$V.ELEMENT_HANDLER];
		const axis = this[$.AXIS];

		viewElement.style.setProperty(axis[$A.STYLE_SIZE], `${size}px`);
		viewElement.style.setProperty(axis[$A.STYLE_OFFSET], `${offset}px`);
		handlerElement.style.setProperty(axis[$A.STYLE_OFFSET], `${offset}px`);
	}

	[$.RESET]() {
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

		if (freeSize > 0) {
			Console.warn(`Free ${freeSize}.`);
		}
	}
}