import {resolveIn} from 'phovea_core/src';

/**
 * returns a promise waiting for X milliseconds
 * @param timeMs
 */
export function wait(timeMs: number): Promise<any> {
  return resolveIn(timeMs);
}

/**
 * wait for at most maxWaitingTime till the selector is matched with a given polling frequency
 * @param selector
 * @param maxWaitingTime
 * @param pollFrequencyMs
 * @returns {Promise<HTMLElement | null>} the found element or null
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

export function waitForSelector(this: { selector?: string}) {
  return !this.selector ? Promise.resolve() : waitFor(this.selector);
}

export function click(elem: HTMLElement | string) {
  const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
  if (!e) {
    return false;
  }
  e.click();
}

export function clickSelector(this: { selector?: string}) {
  return click(this.selector);
}

/**
 * sets the value on the given element and also trigger a change event
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

export function setValueAndTriggerSelector(value: string, eventType: 'change'|'input' = 'change') {
  return function(this: {selector?: string}) {
    setValueAndTrigger(this.selector, value, eventType);
  };
}

export function toggleClass(elem: HTMLElement | string, clazz: string, toggle?: boolean) {
  const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
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

export function isTourVisible() {
  const counter = document.querySelector<HTMLElement>('.tdp-tour-step-count')!;
  return counter.style.display === 'flex'; // visible -> active
}
