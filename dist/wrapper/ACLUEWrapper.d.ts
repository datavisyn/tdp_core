import { LayoutedProvVis } from '../vis/provvis';
import { VerticalStoryVis } from '../vis/storyvis';
import { ProvenanceGraph, SlideNode } from '../provenance';
import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { EventHandler } from '../base';
export interface IACLUEWrapperOptions {
    replaceBody?: boolean;
}
export declare abstract class ACLUEWrapper extends EventHandler {
    static readonly EVENT_MODE_CHANGED = "modeChanged";
    static readonly EVENT_JUMPED_TO = "jumped_to";
    clueManager: CLUEGraphManager;
    graph: Promise<ProvenanceGraph>;
    private storyVis;
    private provVis;
    private urlTracking;
    protected build(body: HTMLElement, options: IACLUEWrapperOptions): Promise<void>;
    protected abstract buildImpl(body: HTMLElement): {
        graph: Promise<ProvenanceGraph>;
        storyVis: () => Promise<VerticalStoryVis>;
        provVis: () => Promise<LayoutedProvVis>;
        manager: CLUEGraphManager;
    };
    private handleModeChange;
    nextSlide(): Promise<SlideNode>;
    previousSlide(): Promise<SlideNode>;
    jumpToStory(story: number, autoPlay?: boolean): Promise<this>;
    jumpToState(state: number): Promise<this>;
    jumpToStored(): PromiseLike<this>;
    jumpToStoredOrLastState(): Promise<this>;
}
