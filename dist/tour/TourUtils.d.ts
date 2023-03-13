import type { IViewTourContext } from './extensions';
export declare class TourUtils {
    static readonly GLOBAL_EVENT_START_TOUR = "tdpStartTour";
    static readonly GLOBAL_EVENT_END_TOUR = "tdpEndTour";
    static readonly EXTENSION_POINT_TDP_TOUR = "tdpTour";
    /**
     * start a view help tour
     * @param tourId the tour id to start
     * @param context view context as extra tour context
     */
    static startViewTour(tourId: string, context: IViewTourContext): void;
    static startTour(tourId: string, context?: any): void;
    static endTour(finished?: boolean): void;
    /**
     * Wait for a given number of milliseconds, before resolving the promise and continuing.
     *
     * @param timeMs Waiting time in milliseconds
     */
    static wait(timeMs: number): Promise<any>;
    /**
     * Wait for a DOM element to appear, before resolving the promise and continuing.
     * The function will poll at most for `maxWaitingTime` with a `polling` frequency until the `selector` is matched.
     *
     * @param selector DOM selector
     * @param maxWaitingTime Maximum waiting time in milliseconds
     * @default maxWaitingTime 5000
     * @param pollFrequencyMs Poll frequency in milliseconds
     * @default pollFrequencyMs 500
     * @returns {Promise<HTMLElement | null>} Resolves with the found element or `null`
     */
    static waitFor(selector: string | (() => HTMLElement | null), maxWaitingTime?: number, pollFrequencyMs?: number): Promise<HTMLElement | null>;
    /**
     * Wait for the given selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this
     */
    static waitForSelector(this: {
        selector?: string;
    }): Promise<void> | Promise<HTMLElement>;
    /**
     * Dispatches a click event on the given HTML element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML element.
     *
     * @param elem HTML element or DOM selector string
     */
    static click(elem: HTMLElement | string): boolean;
    /**
     * Dispatches a click event on the given HTML element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML element.
     *
     * @param elem HTML element or DOM selector string
     */
    static focus(elem: HTMLElement | string): boolean;
    /**
     * ??? - TEMPORARY: Dispatches a click event on the given HTML element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML element.
     *
     * @param elem HTML element or DOM selector string
     */
    static removeBlocker(elem: HTMLElement | string): boolean;
    /**
     * Dispatches a click event on the HTML element with the given DOM selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this Context containing the current selector of the step
     */
    static clickSelector(this: {
        selector?: string;
    }): boolean;
    /**
     * Dispatches a double click event on the given HTML element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML element.
     *
     * @param elem HTML element or DOM selector string
     */
    static doubleClick(elem: HTMLElement | string): boolean;
    /**
     * Dispatches a double click event on the HTML element with the given DOM selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this Context containing the current selector of the step
     */
    static doubleClickSelector(this: {
        selector?: string;
    }): boolean;
    /**
     * Dispatches a submit event on the given HTML form element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML form element.
     *
     * @param elem HTML form element or DOM selector string
     */
    static submitForm(elem: HTMLFormElement | string): boolean;
    /**
     * Dispatches a submit event on the HTML form element with the given DOM selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this Context containing the current selector of the step
     */
    static submitFormSelector(this: {
        selector?: string;
    }): boolean;
    /**
     * Dispatches a key down event with the Enter key on the HTML element with the given DOM selector.
     *
     * @param elem HTML input element or DOM selector string
     */
    static keyDownEnter(elem: HTMLElement | string): void;
    /**
     * Sets the value on the given HTML element and dispatches a `change` or `input` event.
     *
     * @param elem HTML input element or DOM selector string
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static setValueAndTrigger(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string, value: string, eventType?: 'change' | 'input'): boolean;
    /**
     * ??? - TEMPORARY: Sets the value on the given HTML element and dispatches a `change` or `input` event.
     *
     * @param elem HTML input element or DOM selector string
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static setValueWithoutTrigger(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string, value: string): any;
    /**
     * ??? - TEMPORARY: Sets the value on the given HTML element and dispatches a `change` or `input` event.
     *
     * @param elem HTML input element or DOM selector string
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static fireMouseDown(elem: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string): boolean;
    /**
     * ??? - TEMPORARY: Sets the value on the given HTML element and dispatches a `change` or `input` event.
     *
     * @param elem HTML input element or DOM selector string
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static fireKeyPress(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string, value: string): boolean;
    /**
     * Sets the value on the given HTML element and dispatches a `change` or `input` event.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static setValueAndTriggerSelector(value: string, eventType?: 'change' | 'input'): (this: {
        selector?: string;
    }) => void;
    /**
     * Toggles a CSS class on the given HTML element.
     *
     * @param elem HTML input element or DOM selector string
     * @param clazz CSS class to toggle
     * @param forceToggle If present adds or removes the given CSS class
     */
    static toggleClass(elem: HTMLElement | string, clazz: string, forceToggle?: boolean): void;
    /**
     * Execute the callback function in the given interval until the function returns `true`.
     *
     * @param callback Function to execute. The polling is stopped once the function returns `true`.
     * @param interval Pause in milliseconds between each function call
     */
    static ensure(callback: () => boolean, interval?: number): void;
    /**
     * Checks if a tour is visible. The visibility indicates whether the tour is active.
     */
    static isTourVisible(): boolean;
}
//# sourceMappingURL=TourUtils.d.ts.map