export const
	WINDOW = window,
	DOCUMENT = document;

export const
	BODY = DOCUMENT.body;

/**
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} childElement
 */
export const appendChild = (parentElement, childElement) => {
	parentElement.appendChild(childElement);
};

/**
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} childElement
 */
export const removeChild = (parentElement, childElement) => {
	parentElement.removeChild(childElement);
};

/**
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} newChild
 * @param {HTMLElement} refChild
 */
export const insertBefore = (parentElement, newChild, refChild) => {
	parentElement.insertBefore(newChild, refChild);
};

/**
 * @param {HTMLElement} element
 */
export const getParentElement = (element) => element.parentElement;

/**
 * @param {HTMLElement} element
 */
export const hasParentElement = (element) => getParentElement(element) !== null;

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

export const createDivElement = () => DOCUMENT.createElement('div');

export const setClassName = (element, value) => {
	element.className = value;
};

export const addEventListener = (element, eventType, listener) => {
	element.addEventListener(eventType, listener);
};

export const removeEventListener = (element, eventType, listener) => {
	element.removeEventListener(eventType, listener);
};

/**
 * @param {HTMLDivElement} element
 */
export const setStyle = (element, style) => {
	for (const property in style) {
		element.style.setProperty(property, style[property], 'important');
	}
};
