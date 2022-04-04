import * as $ from './symbol';

export const AXIS = {
	row: {
		[$.NAME]: 'row',
		[$.PROPERTY_POSITION]: 'clientX',
		[$.PROPERTY_SIZE]: 'offsetWidth',
		[$.PROPERTY_OFFSET]: 'offsetLeft',
		[$.STYLE_SIZE]: 'width',
		[$.STYLE_OFFSET]: 'left'
	},
	column: {
		[$.NAME]: 'column',
		[$.PROPERTY_POSITION]: 'clientY',
		[$.PROPERTY_SIZE]: 'offsetHeight',
		[$.PROPERTY_OFFSET]: 'offsetTop',
		[$.STYLE_SIZE]: 'height',
		[$.STYLE_OFFSET]: 'top'
	}
};

export const NULL_AXIS = {};