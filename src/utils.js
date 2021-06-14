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
		pointPos: 'clientX',
		crossStyleSize: 'height',
		crossStyleOffset: 'top',
		styleSize: 'width',
		styleOffset: 'left',
		offsetSize: 'offsetWidth',
		offset: 'offsetLeft',
		styleCursorValue: 'col-resize'
	},
	column: {
		pointPos: 'clientY',
		crossStyleSize: 'width',
		crossStyleOffset: 'left',
		styleSize: 'height',
		styleOffset: 'top',
		offsetSize: 'offsetHeight',
		offset: 'offsetTop',
		styleCursorValue: 'row-resize'
	},
};
