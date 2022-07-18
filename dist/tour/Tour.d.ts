import type { ITDPTourExtensionDesc, IStep } from './extensions';
import { AppHeader } from '../components/header';
export interface ITourContext {
    /**
     * The TDP application
     */
    app(): Promise<any>;
    /**
     * The application header
     */
    header(): AppHeader;
    /**
     * Set the number of steps
     * @param count Total number of steps
     */
    steps(count: number): void;
    /**
     * Show a given step
     * @param stepNumber The step number
     * @param step Step object
     */
    show(stepNumber: number, step: IStep): void;
    /**
     * Hide the tour
     * @param finished Flag whether the tour has finished
     */
    hide(finished?: boolean): void;
}
export declare class Tour {
    readonly desc: ITDPTourExtensionDesc;
    private current;
    private steps;
    constructor(desc: ITDPTourExtensionDesc);
    get multiPage(): boolean;
    get id(): string;
    get name(): string;
    get description(): string;
    canBeListed(): any;
    reset(): void;
    start(context: ITourContext): Promise<void>;
    private loadSteps;
    next(context: ITourContext): Promise<void>;
    jumpTo(step: number, context: ITourContext): Promise<void>;
    previous(context: ITourContext): Promise<void>;
    /**
     * Refresh current step, e.g., when resizing the browser window
     * @param context tour context
     */
    refreshCurrent(context: ITourContext): void;
    static resolveTours(): Tour[];
}
//# sourceMappingURL=Tour.d.ts.map