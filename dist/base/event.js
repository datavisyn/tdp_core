class Event {
    constructor(type, args, target, delegateTarget) {
        this.type = type;
        this.args = args;
        this.target = target;
        this.delegateTarget = delegateTarget;
        this.timeStamp = new Date();
        this.stopped = false;
        this.stopedPropagation = false;
    }
    get currentTarget() {
        return this.target;
    }
    isImmediatePropagationStopped() {
        return this.stopped;
    }
    stopImmediatePropagation() {
        this.stopped = true;
    }
    isPropagationStopped() {
        return this.stopedPropagation;
    }
    stopPropagation() {
        this.stopedPropagation = true;
    }
}
class SingleEventHandler {
    constructor(type) {
        this.type = type;
        this.listeners = [];
        // nothing else to do
    }
    push(listener) {
        this.listeners.push(listener);
    }
    remove(listener) {
        const i = this.listeners.indexOf(listener);
        if (i >= 0) {
            this.listeners.splice(i, 1);
            return true;
        }
        return false;
    }
    fire(event) {
        if (this.listeners.length === 0) {
            return false;
        }
        const largs = [event].concat(event.args);
        if (this.listeners.length === 1) {
            this.listeners[0].apply(event, largs);
        }
        else {
            // work on a copy in case the number changes
            const l = this.listeners.slice();
            const ll = l.length;
            for (let i = 0; i < ll && !event.isImmediatePropagationStopped(); ++i) {
                l[i].apply(event, largs);
            }
        }
        return true;
    }
    get length() {
        return this.listeners.length;
    }
}
function createEvent(event, args, target) {
    return new Event(event, args, target, target);
}
function propagateEvent(event, target) {
    return new Event(event.type, event.args, target, event.target);
}
/**
 * EventHandler base class
 */
export class EventHandler {
    constructor() {
        this.handlers = new Map();
        this.propagationHandler = (event) => {
            if (!event.isPropagationStopped()) {
                this.fireEvent(propagateEvent(event, this));
            }
        };
    }
    /**
     * register a global event handler
     * @param events either one event string (multiple are supported using , as separator) or a map of event handlers
     * @param handler the handler in case of a given string
     */
    on(events, handler) {
        if (typeof events === 'string') {
            events.split(EventHandler.MULTI_EVENT_SEPARATOR).forEach((event) => {
                if (!this.handlers.has(event)) {
                    this.handlers.set(event, new SingleEventHandler(event));
                }
                this.handlers.get(event).push(handler);
            });
        }
        else {
            Object.keys(events).forEach((event) => {
                const h = events[event];
                this.on(event, h);
            });
        }
        return this;
    }
    /**
     * unregister a global event handler
     * @param events
     * @param handler
     */
    off(events, handler) {
        if (typeof events === 'string') {
            events.split(EventHandler.MULTI_EVENT_SEPARATOR).forEach((event) => {
                if (this.handlers.has(event)) {
                    const h = this.handlers.get(event);
                    h.remove(handler);
                    if (h.length === 0) {
                        this.handlers.delete(event);
                    }
                }
            });
        }
        else {
            Object.keys(events).forEach((event) => {
                const h = events[event];
                this.off(event, h);
            });
        }
        return this;
    }
    /**
     * list for each registered event the number of listeners
     */
    getRegisteredHandlerCount() {
        const r = {};
        this.handlers.forEach((handler, type) => {
            r[type] = handler.length;
        });
        return r;
    }
    /**
     * fires an event
     * @param events name(s) of the event
     * @param args additional arguments
     */
    fire(events, ...args) {
        events.split(EventHandler.MULTI_EVENT_SEPARATOR).forEach((event) => {
            this.fireEvent(createEvent(event, args, this));
        });
        return this;
    }
    fireEvent(event) {
        if (this.handlers.has(event.type)) {
            const h = this.handlers.get(event.type);
            return h.fire(event);
        }
        return false;
    }
    /**
     * registers on the given event handler and propagates the given events to itself
     * @param progatee
     * @param events
     */
    propagate(progatee, ...events) {
        progatee.on(events.join(EventHandler.MULTI_EVENT_SEPARATOR), this.propagationHandler);
    }
    stopPropagation(progatee, ...events) {
        progatee.off(events.join(EventHandler.MULTI_EVENT_SEPARATOR), this.propagationHandler);
    }
}
EventHandler.MULTI_EVENT_SEPARATOR = ',';
export class GlobalEventHandler extends EventHandler {
    static getInstance() {
        if (!GlobalEventHandler.instance) {
            GlobalEventHandler.instance = new GlobalEventHandler();
        }
        return GlobalEventHandler.instance;
    }
}
//# sourceMappingURL=event.js.map