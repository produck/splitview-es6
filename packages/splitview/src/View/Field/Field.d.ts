import { SplitviewViewContext } from '../Context';
import { PREVIOUS, NEXT } from '../symbol';

export const
	SIDE = 's',
	PULLED_VIEW = 'p',
	LIMIT_PULLING_MAX = 'a',
	LIMIT_PUSHING_MIN = 'i',
	ORIGIN_PULLIND_SIZE = 'l',
	ORIGIN_PUSHING_SIZE = 'h';

type Side = typeof PREVIOUS | typeof NEXT;

export interface Field {
	[SIDE]: Side;
	[PULLED_VIEW]: SplitviewViewContext;
	[LIMIT_PULLING_MAX]: number;
	[LIMIT_PUSHING_MIN]: number;
	[ORIGIN_PULLIND_SIZE]: number;
	[ORIGIN_PUSHING_SIZE]: number;
}