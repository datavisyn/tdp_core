import { ITDPTourExtensionDesc, IStep } from './extensions';
import { AppHeader } from 'phovea_ui';
export interface ITourContext {
    app(): Promise<any>;
    header(): AppHeader;
    steps(count: number): void;
    show(stepNumber: number, step: IStep): void;
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
    static resolveTours(): Tour[];
}
