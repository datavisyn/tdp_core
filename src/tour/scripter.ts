import {resolveIn} from 'phovea_core/src';

/**
 * Wait for a given number of milliseconds, before resolving the promise and continuing.
 *
 * @param timeMs Waiting time in milliseconds
 */
export function wait(timeMs: number): Promise<any> {
  return resolveIn(timeMs);
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
export function waitFor(selector: string | (() => HTMLElement | null), maxWaitingTime: number = 5000, pollFrequencyMs: number = 500): Promise<HTMLElement | null> {
  const s = typeof selector === 'function' ? selector : () =>  document.querySelector<HTMLElement>(selector);
  return new Promise<HTMLElement>(async (resolve) => {
    let elem: HTMLElement = s();
    if (s()) {
      return resolve(elem);
    }
    for (let waited = 0; waited < maxWaitingTime; waited += pollFrequencyMs) {
      await wait(pollFrequencyMs);
      elem = s();
      if (elem != null) {
        return resolve(elem);
      }
    }
    resolve(null);
  });
}

/**
 * Wait for the given selector.
 * This function can be passed directly to `preAction` or `postAction` of the step.
 *
 * @param this
 */
export function waitForSelector(this: { selector?: string }) {
  return !this.selector ? Promise.resolve() : waitFor(this.selector);
}

/**
 * Dispatches a click event on the given HTML element.
 * In case of a string, the string is used as DOM selector to retrieve the HTML element.
 *
 * @param elem HTML element or DOM selector string
 */
export function click(elem: HTMLElement | string) {
  const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
  if (!e) {
    return false;
  }
  e.click();
}

/**
 * Dispatches a click event on the HTML element with the given DOM selector.
 * This function can be passed directly to `preAction` or `postAction` of the step.
 *
 * @param this Context containing the current selector of the step
 */
export function clickSelector(this: { selector?: string}) {
  return click(this.selector);
}

/**
 * Dispatches a double click event on the given HTML element.
 * In case of a string, the string is used as DOM selector to retrieve the HTML element.
 *
 * @param elem HTML element or DOM selector string
 */
export function doubleClick(elem: HTMLElement | string) {
  const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
  if (!e) {
    return false;
  }
  const evt = new Event('dblclick');
  e.dispatchEvent(evt);
}

/**
 * Dispatches a double click event on the HTML element with the given DOM selector.
 * This function can be passed directly to `preAction` or `postAction` of the step.
 *
 * @param this Context containing the current selector of the step
 */
export function doubleClickSelector(this: { selector?: string}) {
  return doubleClick(this.selector);
}

/**
 * Dispatches a submit event on the given HTML form element.
 * In case of a string, the string is used as DOM selector to retrieve the HTML form element.
 *
 * @param elem HTML form element or DOM selector string
 */
export function submitForm(elem: HTMLFormElement | string) {
  const e = typeof elem === 'string' ? document.querySelector<HTMLFormElement>(elem) : elem;
  if (!e) {
    return false;
  }
  const event = new Event('submit', <any>{
    bubbles: true,
    cancelable: true
  });
  e.dispatchEvent(event);
}

/**
 * Dispatches a submit event on the HTML form element with the given DOM selector.
 * This function can be passed directly to `preAction` or `postAction` of the step.
 *
 * @param this Context containing the current selector of the step
 */
export function submitFormSelector(this: { selector?: string}) {
  return submitForm(this.selector);
}

/**
 * Dispatches a key down event with the Enter key on the HTML element with the given DOM selector.
 *
 * @param elem HTML input element or DOM selector string
 */
export function keyDownEnter(elem: HTMLElement | string) {
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
    keyCode: 13
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
export function setValueAndTrigger(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string, value: string, eventType: 'change'|'input' = 'change') {
  const e = typeof elem === 'string' ? document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(elem) : elem;
  if (!e) {
    return;
  }
  e.value = value;
  return e.dispatchEvent(new Event(eventType, {
    bubbles: true,
    cancelable: true
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
export function setValueAndTriggerSelector(value: string, eventType: 'change'|'input' = 'change') {
  return function(this: {selector?: string}) {
    setValueAndTrigger(this.selector, value, eventType);
  };
}

/**
 * Toggles a CSS class on the given HTML element.
 *
 * @param elem HTML input element or DOM selector string
 * @param clazz CSS class to toggle
 * @param forceToggle If present adds or removes the given CSS class
 */
export function toggleClass(elem: HTMLElement | string, clazz: string, forceToggle?: boolean) {
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
export function ensure(callback: () => boolean, interval: number = 250) {
  if (!callback() || !isTourVisible()) {
    return;
  }
  let id = -1;
  const w = () => {
    if (!callback() || !isTourVisible()) {
      clearInterval(id);
    }
  };
  id = self.setInterval(w, interval);
}

/**
 * Checks if a tour is visible. The visibility indicates whether the tour is active.
 */
export function isTourVisible(): boolean {
  const counter = document.querySelector<HTMLElement>('.tdp-tour-step-count')!;
  return counter.style.display === 'flex'; // visible -> active
}
