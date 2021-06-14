
interface SplitviewViewViewOptions {
	resizable?: boolean;
	min?: number;
	max?: number;
}

interface SplitviewView {
	readonly container: SplitviewContainer;
	readonly element: HTMLDivElement;
	readonly nextSibling: SplitviewView;
	readonly previousSibling: SplitviewView;
	readonly size: number;
	setSize(value: number): number;
}

export interface SplitviewContainer {
	(): SplitviewContainer;
	direction: string;
	readonly firstView: SplitviewView;
	readonly lastView: SplitviewView;
	readonly viewList: SplitviewView[];

	createView(options: SplitviewViewViewOptions): SplitviewView;
	appendView(view: SplitviewView): SplitviewView;
	removeView(view: SplitviewView): SplitviewView;
	insertBefore(newView: SplitviewView, referenceView: SplitviewView): SplitviewView;

	mount(element: HTMLElement): void;
	relayout(): void;
	destroy(): void;
}
