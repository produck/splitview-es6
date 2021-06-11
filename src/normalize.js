export function normalizeViewOptions(_options) {
	const options = {
		min: 0,
		max: Infinity,
		resizable: true
	};

	const {
		min: _min = options.min,
		max: _max = options.max,
		resizable: _resizable = options.resizable
	} = _options;

	if (_min < 0) {
		throw new TypeError('A min MUST be >= 0.');
	}

	if (_max < _min) {
		throw new TypeError('A max MUST > a min.');
	}

	if (typeof _resizable !== 'boolean') {
		throw new TypeError('A resizable MUST be a boolean');
	}

	options.resizable = _resizable;
	options.min = _min;
	options.max = _max;

	return options;
}