const MAX_WIDTH = window.screen.width;

export function normalizeViewOptions(_options) {
	const options = {
		min: 0,
		max: MAX_WIDTH,
		resizable: true
	};

	const {
		min: _min = options.min,
		max: _max = options.max,
		resizable: _resizable = options.resizable
	} = _options;

	if (_min < 0 || !isFinite(_min)) {
		throw new Error('A min MUST be >= 0 and finity.');
	}

	if (_max < _min) {
		throw new Error('A max MUST > the min and finity.');
	}

	if (typeof _resizable !== 'boolean') {
		throw new Error('A resizable MUST be a boolean');
	}

	options.resizable = _resizable;
	options.min = _min;
	options.max = _max;

	return options;
}