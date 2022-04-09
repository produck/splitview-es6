import { Container } from './Container';

export interface View {
	/**
	 * A getter to access splitview container of this view.
	 */
	readonly container: Container;

	/**
	 * The dom of this split view, an element class is `sv-view`.
	 */
	readonly element: HTMLDivElement;

	/**
	 * The next view of this view.
	 */
	readonly nextSibling: View | null;

	/**
	 * The previous view of this view.
	 */
	readonly previousSibling: View | null;

	/**
	 * The size of view.
	 *   - When direction === 'row' it is width.
	 *   - When direction === 'column' it is height.
	 */
	readonly size: number;

	/**
	 * The minimum size of a view.
	 * @default 0
	 */
	min: number;

	/**
	 * The minimum size of a view.
	 * @default screenWidth*4
	 */
	max: number;

	/**
	 * @param value - The size for trying to set.
	 * @param side - Which handler to move.
	 * @returns The final size
	 */
	setSize(value: number, side?: 'next' | 'previous'): number;
}
