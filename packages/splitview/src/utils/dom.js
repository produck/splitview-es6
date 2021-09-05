const
	DOCUMENT = document;

/**
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} childElement
 */
export function appendChild(parentElement, childElement) {
	parentElement.appendChild(childElement);
}

/**
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} childElement
 */
export function removeChild(parentElement, childElement) {
	parentElement.removeChild(childElement);
}

/**
 * @param {HTMLElement} element
 */
export function hasParentElement(element) {
	return element.parentElement !== null;
}

export function createDivElement() {
	return DOCUMENT.createElement('div');
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

/**
 * @param {HTMLDivElement} element
 */
export function setStyle(element, style) {
	for (const property in style) {
		element.style.setProperty(property, style[property], 'important');
	}
}
