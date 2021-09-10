export const
	WINDOW = window,
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
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} newChild
 * @param {HTMLElement} refChild
 */
export function insertBefore(parentElement, newChild, refChild) {
	parentElement.insertBefore(newChild, refChild);
}

/**
 * @param {HTMLElement} element
 */
export function hasParentElement(element) {
	return element.parentElement !== null;
}

/**
 * @param {HTMLElement} element
 * @param {string} name
 */
export const addClass = (element, name) => element.classList.add(name);

/**
 * @param {HTMLElement} element
 * @param {string} name
 */
export const removeClass = (element, name) => element.classList.remove(name);

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
