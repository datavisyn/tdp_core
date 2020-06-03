import { BaseUtils, GlobalEventHandler } from 'phovea_core';
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
    /**
     * returns a promise waiting for X milliseconds
     * @param timeMs
     */
    static wait(timeMs) {
        return BaseUtils.resolveIn(timeMs);
    }
    /**
     * wait for at most maxWaitingTime till the selector is matched with a given polling frequency
     * @param selector
     * @param maxWaitingTime
     * @param pollFrequencyMs
     * @returns {Promise<HTMLElement | null>} the found element or null
     */
    static waitFor(selector, maxWaitingTime = 5000, pollFrequencyMs = 500) {
        const s = typeof selector === 'function' ? selector : () => document.querySelector(selector);
        return new Promise(async (resolve) => {
            let elem = s();
            if (s()) {
                return resolve(elem);
            }
            for (let waited = 0; waited < maxWaitingTime; waited += pollFrequencyMs) {
                await TourUtils.wait(pollFrequencyMs);
                elem = s();
                if (elem != null) {
                    return resolve(elem);
                }
            }
            resolve(null);
        });
    }
    static waitForSelector() {
        return !this.selector ? Promise.resolve() : TourUtils.waitFor(this.selector);
    }
    static click(elem) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return false;
        }
        e.click();
    }
    static clickSelector() {
        return TourUtils.click(this.selector);
    }
    /**
     * sets the value on the given element and also trigger a change event
     */
    static setValueAndTrigger(elem, value, eventType = 'change') {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return;
        }
        e.value = value;
        return e.dispatchEvent(new Event(eventType, {
            bubbles: true,
            cancelable: true
        }));
    }
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
            keyCode: 13
        });
        e.dispatchEvent(event);
    }
    static setValueAndTriggerSelector(value, eventType = 'change') {
        return function () {
            TourUtils.setValueAndTrigger(this.selector, value, eventType);
        };
    }
    static toggleClass(elem, clazz, toggle) {
        const e = typeof elem === 'string' ? document.querySelector(elem) : elem;
        if (!e) {
            return;
        }
        e.classList.toggle(clazz, toggle);
    }
    /**
     * intervall execute things will callback returns true
     * @param callback
     * @param interval
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
        id = self.setInterval(w, interval);
    }
    static isTourVisible() {
        const counter = document.querySelector('.tdp-tour-step-count');
        return counter.style.display === 'flex'; // visible -> active
    }
}
TourUtils.GLOBAL_EVENT_START_TOUR = 'tdpStartTour';
TourUtils.EXTENSION_POINT_TDP_TOUR = 'tdpTour';
//# sourceMappingURL=TourUtils.js.map