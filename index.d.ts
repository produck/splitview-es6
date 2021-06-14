
interface SplitviewViewViewOptions {
	resizable?: boolean;
	min?: number;
	max?: number;
}

interface SplitviewContainerHTMLDivElement extends HTMLDivElement {
	addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: 'container-size-change', event: UIEvent): void;
}

interface SplitviewViewHTMLDivElement extends HTMLDivElement {
	addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: 'view-size-change', event: UIEvent): void;
}

interface SplitviewView {
	readonly container: SplitviewContainer;
	readonly element: SplitviewViewHTMLDivElement;
	readonly nextSibling: SplitviewView;
	readonly previousSibling: SplitviewView;
	readonly size: number;
	setSize(value: number): number;
}

export interface SplitviewContainer {
	direction: string;
	readonly element: SplitviewContainerHTMLDivElement;
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

export function Splitview(): SplitviewContainer;
