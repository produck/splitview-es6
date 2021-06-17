/**
 * Special event exnteding from `DOM Event` for splitview.
 */
interface SplitviewEvent extends Event {
	bubbles: true;
	data: SplitviewContainer | SplitviewView;
}

interface SplitviewContainerHTMLDivElement extends HTMLDivElement {
	addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: 'container-size-change', event: SplitviewEvent): void;
}

interface SplitviewViewHTMLDivElement extends HTMLDivElement {
	addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: 'view-size-change', event: SplitviewEvent): void;
	addEventListener(type: 'request-reset', event: SplitviewEvent): void;
}
interface SplitviewViewViewOptions {
	/**
	 * The minimum size of a view.
	 * @default 0
	 */
	min?: number;

	/**
	 * The minimum size of a view.
	 * @default screenWidth*4
	 */
	max?: number;
}

interface SplitviewView {
	/**
	 * A getter to access splitview container of this view.
	 */
	readonly container: SplitviewContainer;

	/**
	 * The dom of this split view, an element class is `sv-view`.
	 */
	readonly element: SplitviewViewHTMLDivElement;

	/**
	 * The next view of this view.
	 */
	readonly nextSibling: SplitviewView;

	/**
	 * The previous view of this view.
	 */
	readonly previousSibling: SplitviewView;

	/**
	 * The size of view.
	 *   - When direction === 'row' it is width.
	 *   - When direction === 'column' it is height.
	 */
	readonly size: number;

	/**
	 * @param value The size for trying to set.
	 * @returns is the difference between the actual value and the expected value.
	 *   - === 0 means an actual size set.
	 *   - !== 0 means some free space.
	 */
	setSize(value: number): number;
}

export interface SplitviewContainer {
	/**
	 * The direction of this splitview container. Can be `row` or `column`.
	 * @defalut `row`
	 */
	direction: string;

	/**
	 * The dom of this split view, an element class is `sv-container`.
	 */
	readonly element: SplitviewContainerHTMLDivElement;

	/**
	 * The first view of this container.
	 */
	readonly firstView: SplitviewView;

	/**
	 * The last view of this container.
	 */
	readonly lastView: SplitviewView;

	/**
	 * Getting a new array of views from first to last.
	 */
	readonly viewList: SplitviewView[];

	/**
	 * Creating a new view of this container.
	 *
	 * @param options view options. `min === max` means unresizable.
	 * @returns the created view
	 */
	createView(options?: SplitviewViewViewOptions): SplitviewView;

	/**
	 * Putting an owned view to the end of this container.
	 *
	 * @param view a split view
	 * @returns the new view
	 */
	appendView(view: SplitviewView): SplitviewView;

	/**
	 * Removing an owned view in the container.
	 *
	 * @param view a split view
	 * @returns the new view
	 */
	removeView(view: SplitviewView): SplitviewView;

	/**
	 * It inserts a view before a reference view as a child of this container.
	 *
	 * @param newView the view to be inserted
	 * @param referenceView The view before which newView is inserted.If this is
	 * null, then newView is inserted at the end of this container.
	 * @returns the new view
	 */
	insertBefore(newView: SplitviewView, referenceView: SplitviewView): SplitviewView;

	/**
	 * Appending the dom of this container to a specific element.
	 * It is neccessary to use this method to put a splitview container into page.
	 * It alse start an observer for container size changing.
	 *
	 * @param element
	 */
	mount(element: HTMLElement): void;

	/**
	 * Removing from parent element and stoping container size observer.
	 */
	destroy(): void;

	/**
	 * The final way for manually resetting the layout. Not recommanded.
	 */
	relayout(): void;
}

export function Container(): SplitviewContainer;
