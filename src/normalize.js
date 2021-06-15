const MAX_WIDTH = window.screen.width * 4;

export function normalizeViewOptions(_options) {
	const options = {
		min: 50,
		max: MAX_WIDTH
	};

	const {
		min: _min = options.min,
		max: _max = options.max,
	} = _options;

	if (_min < 0 || !isFinite(_min)) {
		throw new Error('A min MUST be >= 0 and finity.');
	}

	if (_max < _min) {
		throw new Error('A max MUST >= the min and finity.');
	}

	options.min = _min;
	options.max = _max;

	return options;
}