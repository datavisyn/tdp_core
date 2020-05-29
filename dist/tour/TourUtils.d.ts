import { IViewTourContext } from './extensions';
export declare class TourUtils {
    static readonly GLOBAL_EVENT_START_TOUR = "tdpStartTour";
    static readonly EXTENSION_POINT_TDP_TOUR = "tdpTour";
    /**
     * start a view help tour
     * @param tourId the tour id to start
     * @param context view context as extra tour context
     */
    static startViewTour(tourId: string, context: IViewTourContext): void;
    static startTour(tourId: string, context?: any): void;
    /**
     * returns a promise waiting for X milliseconds
     * @param timeMs
     */
    static wait(timeMs: number): Promise<any>;
    /**
     * wait for at most maxWaitingTime till the selector is matched with a given polling frequency
     * @param selector
     * @param maxWaitingTime
     * @param pollFrequencyMs
     * @returns {Promise<HTMLElement | null>} the found element or null
     */
    static waitFor(selector: string | (() => HTMLElement | null), maxWaitingTime?: number, pollFrequencyMs?: number): Promise<HTMLElement | null>;
    static waitForSelector(this: {
        selector?: string;
    }): Promise<void> | Promise<HTMLElement>;
    static click(elem: HTMLElement | string): boolean;
    static clickSelector(this: {
        selector?: string;
    }): boolean;
    /**
     * sets the value on the given element and also trigger a change event
     */
    static setValueAndTrigger(elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string, value: string, eventType?: 'change' | 'input'): boolean;
    static keyDownEnter(elem: HTMLElement | string): void;
    static setValueAndTriggerSelector(value: string, eventType?: 'change' | 'input'): (this: {
        selector?: string;
    }) => void;
    static toggleClass(elem: HTMLElement | string, clazz: string, toggle?: boolean): void;
    /**
     * intervall execute things will callback returns true
     * @param callback
     * @param interval
     */
    static ensure(callback: () => boolean, interval?: number): void;
    static isTourVisible(): boolean;
}
