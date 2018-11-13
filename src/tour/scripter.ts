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
export function waitFor(selector: string, maxWaitingTime: number = 5000, pollFrequencyMs: number = 500): Promise<HTMLElement | null> {
  return new Promise<HTMLElement>(async (resolve) => {
    let elem: HTMLElement = document.querySelector<HTMLElement>(selector);
    if (elem != null) {
      return resolve(elem);
    }
    for (let waited = 0; waited < maxWaitingTime; waited += pollFrequencyMs) {
      await wait(pollFrequencyMs);
      elem = document.querySelector<HTMLElement>(selector);
      if (elem != null) {
        return resolve(elem);
      }
    }
    resolve(null);
  });
}

/**
 * sets the value on the given element and also trigger a change event
 */
export function setValueAndTrigger(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  elem.value = value;
  return elem.dispatchEvent(new Event('change'));
}


/**
 * intervall execute things will callback returns true
 * @param callback
 * @param interval
 */
export function ensure(callback: () => boolean, interval: number = 500) {
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
