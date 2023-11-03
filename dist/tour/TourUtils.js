import { GlobalEventHandler } from 'visyn_core/base';
import { BaseUtils } from '../base/BaseUtils';
export class TourUtils {
    /**
     * start a view help tour
     * @param tourId the tour id to start
     * @param context view context as extra tour context
     */
    static startViewTour(tourId, context) {
        TourUtils.startTour(tourId, context);
    }
    static startTour(tourId, context = {}) {
        GlobalEventHandler.getInstance().fire(TourUtils.GLOBAL_EVENT_START_TOUR, tourId, context);
    }
    static endTour(finished = false) {
        GlobalEventHandler.getInstance().fire(TourUtils.GLOBAL_EVENT_END_TOUR, finished);
    }
    /**
     * Wait for a given number of milliseconds, before resolving the promise and continuing.
     *
     * @param timeMs Waiting time in milliseconds
     */
    static wait(timeMs) {
        return BaseUtils.resolveIn(timeMs);
    }
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
    static waitFor(selector, maxWaitingTime = 5000, pollFrequencyMs = 500) {
        const s = typeof selector === 'function' ? selector : () => document.querySelector(selector);
        return new Promise((resolve) => {
            (async () => {
                let elem = s();
                if (s()) {
                    resolve(elem);
                    return;
                }
                for (let waited = 0; waited < maxWaitingTime; waited += pollFrequencyMs) {
                    // eslint-disable-next-line no-await-in-loop
                    await TourUtils.wait(pollFrequencyMs);
                    elem = s();
                    if (elem != null) {
                        resolve(elem);
                        return;
                    }
                }
                resolve(null);
            })();
        });
    }
    /**
     * Wait for the given selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this
     */
    static waitForSelector() {
        return !this.selector ? Promise.resolve() : TourUtils.waitFor(this.selector);
    }
    /**
     * Dispatches a click event on the given HTML element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML element.
     *
     * @param elem HTML element or DOM selector string
     */
    static click(elem) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return false;
        }
        e.click();
        return undefined;
    }
    /**
     * Dispatches a click event on the HTML element with the given DOM selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this Context containing the current selector of the step
     */
    static clickSelector() {
        return TourUtils.click(this.selector);
    }
    /**
     * Dispatches a double click event on the given HTML element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML element.
     *
     * @param elem HTML element or DOM selector string
     */
    static doubleClick(elem) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return false;
        }
        const evt = new Event('dblclick');
        e.dispatchEvent(evt);
        return undefined;
    }
    /**
     * Dispatches a double click event on the HTML element with the given DOM selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this Context containing the current selector of the step
     */
    static doubleClickSelector() {
        return TourUtils.doubleClick(this.selector);
    }
    /**
     * Dispatches a submit event on the given HTML form element.
     * In case of a string, the string is used as DOM selector to retrieve the HTML form element.
     *
     * @param elem HTML form element or DOM selector string
     */
    static submitForm(elem) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return false;
        }
        const event = new Event('submit', {
            bubbles: true,
            cancelable: true,
        });
        e.dispatchEvent(event);
        return undefined;
    }
    /**
     * Dispatches a submit event on the HTML form element with the given DOM selector.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param this Context containing the current selector of the step
     */
    static submitFormSelector() {
        return TourUtils.submitForm(this.selector);
    }
    /**
     * Dispatches a key down event with the Enter key on the HTML element with the given DOM selector.
     *
     * @param elem HTML input element or DOM selector string
     */
    static keyDownEnter(elem) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return;
        }
        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            code: 'Enter',
            which: 13,
            keyCode: 13,
        });
        e.dispatchEvent(event);
    }
    /**
     * Sets the value on the given HTML element and dispatches a `change` or `input` event.
     *
     * @param elem HTML input element or DOM selector string
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static setValueAndTrigger(elem, value, eventType = 'change') {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return undefined;
        }
        e.value = value;
        return e.dispatchEvent(new Event(eventType, {
            bubbles: true,
            cancelable: true,
        }));
    }
    /**
     * Sets the value on the given HTML element and dispatches a `change` or `input` event.
     * This function can be passed directly to `preAction` or `postAction` of the step.
     *
     * @param value Value that should be entered or selected
     * @param eventType Event type `change` or `input` that should be dispatched
     * @default eventType change
     */
    static setValueAndTriggerSelector(value, eventType = 'change') {
        return function () {
            TourUtils.setValueAndTrigger(this.selector, value, eventType);
        };
    }
    /**
     * Toggles a CSS class on the given HTML element.
     *
     * @param elem HTML input element or DOM selector string
     * @param clazz CSS class to toggle
     * @param forceToggle If present adds or removes the given CSS class
     */
    static toggleClass(elem, clazz, forceToggle) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return;
        }
        e.classList.toggle(clazz, forceToggle);
    }
    /**
     * Execute the callback function in the given interval until the function returns `true`.
     *
     * @param callback Function to execute. The polling is stopped once the function returns `true`.
     * @param interval Pause in milliseconds between each function call
     */
    static ensure(callback, interval = 250) {
        if (!callback() || !TourUtils.isTourVisible()) {
            return;
        }
        let id = -1;
        const w = () => {
            if (!callback() || !TourUtils.isTourVisible()) {
                clearInterval(id);
            }
        };
        id = window.setInterval(w, interval);
    }
    /**
     * Checks if a tour is visible. The visibility indicates whether the tour is active.
     */
    static isTourVisible() {
        const counter = document.querySelector('.tdp-tour-step-count');
        return counter && counter.style.display === 'flex'; // visible -> active
    }
}
TourUtils.GLOBAL_EVENT_START_TOUR = 'tdpStartTour';
TourUtils.GLOBAL_EVENT_END_TOUR = 'tdpEndTour';
TourUtils.EXTENSION_POINT_TDP_TOUR = 'tdpTour';
//# sourceMappingURL=TourUtils.js.map