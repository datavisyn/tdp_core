import { Tour } from './Tour';
import { AppHeader } from '../components/header';
export interface ITourManagerContext {
    doc: Document;
    app(): Promise<any>;
    header(): AppHeader;
}
export declare class TourManager {
    private readonly keyListener;
    private readonly resizeListener;
    private readonly backdrop;
    private readonly backdropBlocker;
    private readonly step;
    private readonly stepCount;
    private stepPopper;
    readonly chooser: HTMLElement;
    private readonly tours;
    private readonly tourContext;
    private activeTour;
    private activeTourContext;
    constructor(context: ITourManagerContext);
    hasTours(): boolean;
    getTours(): Readonly<Tour[]>;
    private setHighlight;
    private clearHighlight;
    private setFocusElement;
    private setSteps;
    private selectHighlight;
    private showStep;
    private setUp;
    private takeDown;
    showTour(tour: Tour, context?: any): void;
    hideTour(finished?: boolean): void;
    private rememberFinished;
    private getRememberedFinishedTours;
    private memorizeActiveStep;
    private clearStepMemorize;
    private continueTour;
}
//# sourceMappingURL=TourManager.d.ts.map