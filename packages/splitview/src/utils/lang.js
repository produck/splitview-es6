export const
	OBJECT = Object,
	OBJECT_SEAL = OBJECT.seal;

export const
	WEAKMAP = () => new WeakMap();

export const
	MATH = Math,
	MATH_MIN = MATH.min,
	MATH_MAX = MATH.max,
	MATH_TRUNC = MATH.trunc,
	MATH_ABS = MATH.abs,
	MATH_ROUND = MATH.round;

/**
 * @param {number} min
 * @param {number} max
 * @param {number} value
 * @returns {number}
 */
export const MATH_CLIP = (min, max, value) => MATH_MAX(MATH_MIN(value, max), min);

export const
	THROW = msg => {
		throw new Error(msg);
	};