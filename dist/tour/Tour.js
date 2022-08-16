import { PluginRegistry } from '../app';
import { TourUtils } from './TourUtils';
export class Tour {
    constructor(desc) {
        this.desc = desc;
        this.current = -1;
        this.steps = [];
    }
    get multiPage() {
        return this.desc.multiPage === true;
    }
    get id() {
        return this.desc.id;
    }
    get name() {
        return this.desc.name;
    }
    get description() {
        return this.desc.description;
    }
    canBeListed() {
        if (this.desc.level === 'manual') {
            return false;
        }
        if (typeof this.desc.availableIf === 'string') {
            return document.querySelector(this.desc.availableIf) != null;
        }
        if (typeof this.desc.availableIf === 'function') {
            return this.desc.availableIf.call(this.desc);
        }
        return true;
    }
    reset() {
        this.current = -1;
    }
    async start(context) {
        return this.jumpTo(0, context);
    }
    loadSteps() {
        return this.desc.load().then((p) => {
            this.steps = p.factory();
        });
    }
    next(context) {
        return this.jumpTo(this.current + 1, context);
    }
    async jumpTo(step, context) {
        if (this.steps.length === 0) {
            await this.loadSteps();
            context.steps(this.steps.length);
        }
        if (step === this.current) {
            return;
        }
        if (this.current >= 0) {
            const before = this.steps[this.current];
            if (before.postAction) {
                await before.postAction.call(before, context);
            }
        }
        if (step < 0 || step >= this.steps.length) {
            this.current = -1;
            context.hide(step >= this.steps.length);
            return;
        }
        this.current = step;
        const next = this.steps[this.current];
        if (next.preAction) {
            await next.preAction.call(next, context);
        }
        context.show(this.current, next);
    }
    previous(context) {
        return this.jumpTo(this.current - 1, context);
    }
    /**
     * Refresh current step, e.g., when resizing the browser window
     * @param context tour context
     */
    refreshCurrent(context) {
        return context.show(this.current, this.steps[this.current]);
    }
    static resolveTours() {
        const tours = PluginRegistry.getInstance().listPlugins(TourUtils.EXTENSION_POINT_TDP_TOUR);
        return tours.map((d) => new Tour(d));
    }
}
//# sourceMappingURL=Tour.js.map