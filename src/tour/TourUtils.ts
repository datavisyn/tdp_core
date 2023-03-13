import { GlobalEventHandler } from 'visyn_core';
import { BaseUtils } from '../base/BaseUtils';
import type { IViewTourContext } from './extensions';

export class TourUtils {
  public static readonly GLOBAL_EVENT_START_TOUR = 'tdpStartTour';

  public static readonly GLOBAL_EVENT_END_TOUR = 'tdpEndTour';

  public static readonly EXTENSION_POINT_TDP_TOUR = 'tdpTour';

  /**
   * start a view help tour
   * @param tourId the tour id to start
   * @param context view context as extra tour context
   */
  static startViewTour(tourId: string, context: IViewTourContext) {
    TourUtils.startTour(tourId, context);
  }

  static startTour(tourId: string, context: any = {}) {
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
  static wait(timeMs: number): Promise<any> {
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
  static waitFor(selector: string | (() => HTMLElement | null), maxWaitingTime = 5000, pollFrequencyMs = 500): Promise<HTMLElement | null> {
    const s = typeof selector === 'function' ? selector : () => document.querySelector<HTMLElement>(selector);
    return new Promise<HTMLElement>((resolve) => {
      (async () => {
        let elem: HTMLElement = s();
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
  static waitForSelector(this: { selector?: string }) {
    return !this.selector ? Promise.resolve() : TourUtils.waitFor(this.selector);
  }

  /**
   * Dispatches a click event on the given HTML element.
   * In case of a string, the string is used as DOM selector to retrieve the HTML element.
   *
   * @param elem HTML element or DOM selector string
   */
  static click(elem: HTMLElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
    if (!e) {
      return false;
    }
    e.click();
    return undefined;
  }

  /**
   * Dispatches a click event on the given HTML element.
   * In case of a string, the string is used as DOM selector to retrieve the HTML element.
   *
   * @param elem HTML element or DOM selector string
   */
  static focus(elem: HTMLElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
    if (!e) {
      return false;
    }
    e.focus();
    return undefined;
  }

  /**
   * ??? - TEMPORARY: Dispatches a click event on the given HTML element.
   * In case of a string, the string is used as DOM selector to retrieve the HTML element.
   *
   * @param elem HTML element or DOM selector string
   */
  static removeBlocker(elem: HTMLElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
    if (!e) {
      return false;
    }
    e.style.display = 'none';
    return undefined;
  }

  /**
   * Dispatches a click event on the HTML element with the given DOM selector.
   * This function can be passed directly to `preAction` or `postAction` of the step.
   *
   * @param this Context containing the current selector of the step
   */
  static clickSelector(this: { selector?: string }) {
    return TourUtils.click(this.selector);
  }

  /**
   * Dispatches a double click event on the given HTML element.
   * In case of a string, the string is used as DOM selector to retrieve the HTML element.
   *
   * @param elem HTML element or DOM selector string
   */
  static doubleClick(elem: HTMLElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
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
  static doubleClickSelector(this: { selector?: string }) {
    return TourUtils.doubleClick(this.selector);
  }

  /**
   * Dispatches a submit event on the given HTML form element.
   * In case of a string, the string is used as DOM selector to retrieve the HTML form element.
   *
   * @param elem HTML form element or DOM selector string
   */
  static submitForm(elem: HTMLFormElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLFormElement>(elem) : elem;
    if (!e) {
      return false;
    }
    const event = new Event('submit', <any>{
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
  static submitFormSelector(this: { selector?: string }) {
    return TourUtils.submitForm(this.selector);
  }

  /**
   * Dispatches a key down event with the Enter key on the HTML element with the given DOM selector.
   *
   * @param elem HTML input element or DOM selector string
   */
  static keyDownEnter(elem: HTMLElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
    if (!e) {
      return;
    }
    const event = new KeyboardEvent('keydown', <any>{
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
  static setValueAndTrigger(
    elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string,
    value: string,
    eventType: 'change' | 'input' = 'change',
  ) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(elem) : elem;
    if (!e) {
      return undefined;
    }
    e.value = value;
    return e.dispatchEvent(
      new Event(eventType, {
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /**
   * ??? - TEMPORARY: Sets the value on the given HTML element and dispatches a `change` or `input` event.
   *
   * @param elem HTML input element or DOM selector string
   * @param value Value that should be entered or selected
   * @param eventType Event type `change` or `input` that should be dispatched
   * @default eventType change
   */
  static setValueWithoutTrigger(
    elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string,
    value: string,
    // eventType: 'change' | 'input' = 'change',
  ) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(elem) : elem;
    if (!e) {
      return undefined;
    }
    e.value = value;
    return undefined;
    // return e.dispatchEvent(
    //   new Event(eventType, {
    //     bubbles: true,
    //     cancelable: true,
    //   }),
    // );
  }

  /**
   * ??? - TEMPORARY: Sets the value on the given HTML element and dispatches a `change` or `input` event.
   *
   * @param elem HTML input element or DOM selector string
   * @param value Value that should be entered or selected
   * @param eventType Event type `change` or `input` that should be dispatched
   * @default eventType change
   */
  // eslint-disable-next-line @typescript-eslint/no-dupe-class-members
  static fireMouseDown(
    elem: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string,
    // value: string,
    // eventType: 'change' | 'input' = 'change',
  ) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(elem) : elem;
    if (!e) {
      return undefined;
    }
    // e.value = value;
    // return undefined;
    return e.dispatchEvent(
      new Event('mousedown', {
        // bubbles: true,
        // cancelable: true,
      }),
    );
  }

  /**
   * ??? - TEMPORARY: Sets the value on the given HTML element and dispatches a `change` or `input` event.
   *
   * @param elem HTML input element or DOM selector string
   * @param value Value that should be entered or selected
   * @param eventType Event type `change` or `input` that should be dispatched
   * @default eventType change
   */
  // eslint-disable-next-line @typescript-eslint/no-dupe-class-members
  static fireKeyPress(
    elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string,
    value: string,
    // eventType: 'change' | 'input' = 'change',
  ) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(elem) : elem;
    if (!e) {
      return undefined;
    }
    // e.value = value;
    // return undefined;
    return e.dispatchEvent(new KeyboardEvent('keydown', { key: value }));
  }

  /**
   * Sets the value on the given HTML element and dispatches a `change` or `input` event.
   * This function can be passed directly to `preAction` or `postAction` of the step.
   *
   * @param value Value that should be entered or selected
   * @param eventType Event type `change` or `input` that should be dispatched
   * @default eventType change
   */
  static setValueAndTriggerSelector(value: string, eventType: 'change' | 'input' = 'change') {
    return function (this: { selector?: string }) {
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
  static toggleClass(elem: HTMLElement | string, clazz: string, forceToggle?: boolean) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
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
  static ensure(callback: () => boolean, interval = 250) {
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
  static isTourVisible(): boolean {
    const counter = document.querySelector<HTMLElement>('.tdp-tour-step-count')!;
    return counter && counter.style.display === 'flex'; // visible -> active
  }
}
