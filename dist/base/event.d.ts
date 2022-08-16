export interface IEventHandler {
    on(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): void;
    off(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): void;
}
export interface IDataBinding {
    data(key: string): any;
    data(key: string, value: any): any;
}
/**
 * basic interface of an event
 */
export interface IEvent {
    /**
     * type of the event
     */
    readonly type: string;
    readonly currentTarget: IEventHandler;
    readonly target: IEventHandler;
    readonly delegateTarget: IEventHandler;
    /**
     * creation date
     */
    readonly timeStamp: Date;
    /**
     * additional arguments given to the event
     */
    readonly args: any[];
    isPropagationStopped(): boolean;
    stopPropagation(): void;
    isImmediatePropagationStopped(): boolean;
    stopImmediatePropagation(): void;
}
export interface IEventListener {
    (event: IEvent, ...args: any[]): void;
}
/**
 * EventHandler base class
 */
export declare class EventHandler implements IEventHandler {
    static readonly MULTI_EVENT_SEPARATOR = ",";
    private readonly handlers;
    private readonly propagationHandler;
    /**
     * register a global event handler
     * @param events either one event string (multiple are supported using , as separator) or a map of event handlers
     * @param handler the handler in case of a given string
     */
    on(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    /**
     * unregister a global event handler
     * @param events
     * @param handler
     */
    off(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    /**
     * list for each registered event the number of listeners
     */
    getRegisteredHandlerCount(): {
        [key: string]: number;
    };
    /**
     * fires an event
     * @param events name(s) of the event
     * @param args additional arguments
     */
    fire(events: string, ...args: any[]): this;
    private fireEvent;
    /**
     * registers on the given event handler and propagates the given events to itself
     * @param progatee
     * @param events
     */
    propagate(progatee: IEventHandler, ...events: string[]): void;
    stopPropagation(progatee: IEventHandler, ...events: string[]): void;
}
export declare class GlobalEventHandler extends EventHandler {
    private static instance;
    static getInstance(): GlobalEventHandler;
}
//# sourceMappingURL=event.d.ts.map