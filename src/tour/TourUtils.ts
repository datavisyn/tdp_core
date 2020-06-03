import {BaseUtils, GlobalEventHandler} from 'phovea_core';
import {IViewTourContext} from './extensions';

export class TourUtils {

  public static readonly GLOBAL_EVENT_START_TOUR = 'tdpStartTour';
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

  /**
   * returns a promise waiting for X milliseconds
   * @param timeMs
   */
  static wait(timeMs: number): Promise<any> {
    return BaseUtils.resolveIn(timeMs);
  }

  /**
   * wait for at most maxWaitingTime till the selector is matched with a given polling frequency
   * @param selector
   * @param maxWaitingTime
   * @param pollFrequencyMs
   * @returns {Promise<HTMLElement | null>} the found element or null
   */
  static waitFor(selector: string | (() => HTMLElement | null), maxWaitingTime: number = 5000, pollFrequencyMs: number = 500): Promise<HTMLElement | null> {
    const s = typeof selector === 'function' ? selector : () =>  document.querySelector<HTMLElement>(selector);
    return new Promise<HTMLElement>(async (resolve) => {
      let elem: HTMLElement = s();
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

  static waitForSelector(this: { selector?: string}) {
    return !this.selector ? Promise.resolve() : TourUtils.waitFor(this.selector);
  }

  static click(elem: HTMLElement | string) {
    const e = typeof elem === 'string' ? document.querySelector<HTMLElement>(elem) : elem;
    if (!e) {
      return false;
    }
    e.click();
  }

  static clickSelector(this: { selector?: string}) {
    return TourUtils.click(this.selector);
  }

  /**
   * sets the value on the given element and also trigger a change event
   */
  static setValueAndTrigger(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string, value: string, eventType: 'change'|'input' = 'change') {
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
      keyCode: 13
    });
    e.dispatchEvent(event);
  }

  static setValueAndTriggerSelector(value: string, eventType: 'change'|'input' = 'change') {
    return function(this: {selector?: string}) {
      TourUtils.setValueAndTrigger(this.selector, value, eventType);
    };
  }

  static toggleClass(elem: HTMLElement | string, clazz: string, toggle?: boolean) {
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
  static ensure(callback: () => boolean, interval: number = 250) {
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
    const counter = document.querySelector<HTMLElement>('.tdp-tour-step-count')!;
    return counter.style.display === 'flex'; // visible -> active
  }
}