const FIXED_CONTAINER_STYLE = {
	'display': 'block',
	'top': '0',
	'left': '0',
	'position': 'relative',
	'width': '100%',
	'height': '100%',
	'overflow': 'hidden',
	'border': 'none',
	'padding': '0',
	'margin': '0'
};

const FIXED_VIEW_OUTER_STYLE = {
	'display': 'block',
	'position': 'absolute',
	'overflow': 'hidden'
};

const FIXED_HANDLER_CONTAINER_STYLE = {
	'display': 'block',
	'overflow': 'visible',
	'top': '0',
	'left': '0',
	'position': 'absolute',
	'z-index': '1'
};

export const FIXED_HANDLER_STYLE = {
	'display': 'block',
	'position': 'absolute',
	'transition-property': 'background-color',
	'transition-duration': '0.2s',
	'transition-delay': '0.1s',
	'user-select': 'none'
};

export const win = window;
export const doc = document;

export function createDivElement() {
	return doc.createElement('div');
}

export function setClassName(element, value) {
	element.className = value;
}

export function addEventListener(element, eventType, listener) {
	element.addEventListener(eventType, listener);
}

export function removeEventListener(element, eventType, listener) {
	element.removeEventListener(eventType, listener);
}

export function SplitviewEvent(type, data) {
	const event = new Event(type, { bubbles: true });

	event.data = data;

	return event;
}

/**
 * @param {HTMLDivElement} element
 */
export function setStyle(element, style) {
	for (const property in style) {
		element.style.setProperty(property, style[property], 'important');
	}
}

export function setContainerStyle(element) {
	setStyle(element, FIXED_CONTAINER_STYLE);
}

export function setViewOuterStyle(element) {
	setStyle(element, FIXED_VIEW_OUTER_STYLE);
}

export function setHandlerContainerStyle(element) {
	setStyle(element, FIXED_HANDLER_CONTAINER_STYLE);
}

export function setHandlerStyle(element) {
	setStyle(element, FIXED_HANDLER_STYLE);
}

export const AXIS_MAP = {
	row: {
		p: 'clientX', // position
		cSS: 'height', // cross-style-size
		cSO: 'top', // cross-style-offset
		sS: 'width', // style-size
		sO: 'left', // style-offset
		oS: 'offsetWidth', // offset-size
		o: 'offsetLeft', // offset
		sCV: 'col-resize' // style-cursor-value
	},
	column: {
		p: 'clientY',
		cSS: 'width',
		cSO: 'left',
		sS: 'height',
		sO: 'top',
		oS: 'offsetHeight',
		o: 'offsetTop',
		sCV: 'row-resize'
	},
};
