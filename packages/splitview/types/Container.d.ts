import { View } from './View';

export interface Container {
	/**
	 * The direction of this splitview container. Can be `row` or `column`.
	 * @defalut `row`
	 */
	direction: string;

	/**
	 * The dom of this split view, an element class is `sv-container`.
	 */
	readonly element: HTMLDivElement;

	/**
	 * The first view of this container.
	 */
	readonly firstView: View;

	/**
	 * The last view of this container.
	 */
	readonly lastView: View;

	/**
	 * Getting a new array of views from first to last.
	 */
	readonly views: Generator<View, void>;

	/**
	 * Creating a new view of this container.
	 *
	 * @param options view options. `min === max` means unresizable.
	 * @returns the created view
	 */
	createView(): View;

	/**
	 * Putting an owned view to the end of this container.
	 *
	 * @param view - a split view
	 * @returns the new view
	 */
	appendView(view: View): View;

	/**
	 * Removing an owned view in the container.
	 *
	 * @param view - a split view
	 * @returns the new view
	 */
	removeView(view: View): View;

	/**
	 * It inserts a view before a reference view as a child of this container.
	 *
	 * @param newView - the view to be inserted
	 * @param referenceView - The view before which newView is inserted.If this is
	 * null, then newView is inserted at the end of this container.
	 * @returns the new view
	 */
	insertBefore(newView: View, referenceView: View): View;

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
}
