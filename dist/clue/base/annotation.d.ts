import * as d3 from 'd3';
import { SlideNode, ProvenanceGraph } from '../provenance';
export declare class Renderer {
    private $main;
    private graph;
    private options;
    private prev;
    private l;
    private updateAnnotations;
    private rerender;
    private act;
    private renderer;
    private anchorWatcher;
    constructor($main: d3.Selection<any>, graph: ProvenanceGraph, options?: {});
    /**
     * renders the given text by replacing variables and rendering markdown, then return the HTML code to display
     *
     * variables: usage: `${variable_name}`
     *  * name ... current slide name
     *  * description ... current slide description
     *  * duration ... current slide duration
     *  * slide_number ... current slide Index
     *  * state_name ... if the slide is associated with a state: its name
     *  * state_notes ... if the slide is associated with a state: its notes
     *  * action_name ... if the state was created by some action, its name
     *  * action_category ... the category of the action (data, vis,...)
     *  * action_operation ... the operation (create, update, delete)
     *  * action_user ... the user performed the operation
     *  * action_ts .. the date when the action was executed
     *
     * @param d the text to render
     * @returns {String}
     */
    private rendererImpl;
    private replaceVariables;
    private destroy;
    render(state: SlideNode, withTransition?: boolean, waitBetweenTakeDown?: boolean): Promise<any>;
    /**
     * renders anchor hits
     * @param bounds the parent bounds where the anchors are rendered into
     */
    private renderAnchors;
    /**
     * updates all anchors by computing the one with the minimal distance and highlight it
     * @param pos current position
     * @param bounds bounds of the parent element containing the anchors
     * @returns {any}
     */
    private updateAnchor;
    private removeAnchors;
    private renderAnnotationsImpl;
    renderAnnotations(state: SlideNode): Promise<unknown>;
    hideOld(): Promise<void>;
    renderSubtitle(overlay: SlideNode): Promise<unknown>;
    renderText(overlay: SlideNode): Promise<Node>;
    static createAnnotation(main: HTMLElement, graph: ProvenanceGraph): {
        render: any;
    };
}
//# sourceMappingURL=annotation.d.ts.map