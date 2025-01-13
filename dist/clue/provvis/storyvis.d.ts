import { IStateAnnotation, ProvenanceGraph, SlideNode } from '../provenance';
import { AVisInstance, IVisInstance } from './visInstance';
import { Player } from '../base/Player';
export declare class VerticalStoryVis extends AVisInstance implements IVisInstance {
    data: ProvenanceGraph;
    parent: Element;
    private $node;
    private trigger;
    private onSelectionChanged;
    private onStateSelectionChanged;
    private options;
    static MIN_HEIGHT: number;
    private duration2pixel;
    story: SlideNode;
    player: Player;
    constructor(data: ProvenanceGraph, parent: Element, options?: any);
    private findSlideForState;
    private bind;
    destroy(): void;
    get rawSize(): [number, number];
    get node(): Element;
    option(name: string, val?: any): any;
    transform(scale?: [number, number], rotate?: number): {
        scale: [number, number];
        rotate: number;
    };
    switchTo(story: SlideNode): void;
    private build;
    private updateInfo;
    pushAnnotation(ann: IStateAnnotation): void;
    onSlideClick(d: SlideNode): void;
    private dndSupport;
    private changeDuration;
    private changeTransition;
    private storyInteraction;
    private createToolbar;
    private createLastPlaceholder;
    private updateSelection;
    update(): void;
    private updateTimeIndicator;
    static createVerticalStoryVis(data: ProvenanceGraph, parent: Element, options?: {}): VerticalStoryVis;
    static createStoryVis(graph: ProvenanceGraph, parent: HTMLElement, main: HTMLElement, options: {
        thumbnails: boolean;
    }): VerticalStoryVis;
    static to_duration(d: number): string;
    static to_starting_time(d: SlideNode, story: SlideNode[]): number;
}
//# sourceMappingURL=storyvis.d.ts.map