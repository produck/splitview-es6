import * as $V from '../symbol';
import * as $F from './symbol';

/**
 * @param {import('../Context').SplitviewViewContext} view
 */
const GET_SIZE = view => view[$V.SIZE];

/**
 * @param {import('../Context').SplitviewViewContext} view
 */
const GET_MIN = view => view[$V.MIN];

/**
 * @param {import('../Context').SplitviewViewContext} view
 * @param {PREVIOUS | NEXT} side
 * @param {(viewContext: import('../Context').SplitviewViewContext) => number} getter
 */
function SUM(view, side, getter) {
	let sum = 0;

	view[$V.FOR_EACH](sibling => sum += getter(sibling), side);

	return sum;
}

/**
 * @param {import('../Context').SplitviewViewContext} view
 * @param {NEXT | PREVIOUS} side
 */
export const ResizingField = (view, side) => {
	const pulledView = {
		[$V.PREVIOUS]: view,
		[$V.NEXT]: view[$V.PREVIOUS]
	}[side];

	return {
		[$F.SIDE]: side,
		[$F.PULLED_VIEW]: pulledView,
		[$F.LIMIT_PULLING_MAX]: pulledView[$V.MAX],
		[$F.LIMIT_PUSHING_MIN]: SUM(pulledView, side, GET_MIN),
		[$F.ORIGINAL_PULLIND_SIZE]: pulledView[$V.SIZE],
		[$F.ORIGINAL_PUSHING_SIZE]: SUM(pulledView, side, GET_SIZE)
	};
};
