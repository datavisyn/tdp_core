/// <amd-dependency path="font-awesome" />
/// <amd-dependency path="bootstrap" />
import * as d3v3 from 'd3v3';
import { IObjectRef, ProvenanceGraph } from '../provenance';
import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { ACLUEWrapper, IACLUEWrapperOptions } from './ACLUEWrapper';
import { AppHeader, IAppHeaderOptions, IHeaderLink } from '../../components';
export interface ICLUEWrapperOptions extends IACLUEWrapperOptions {
    /**
     * the name of the application
     */
    app?: string;
    /**
     * the URL of the application, used e.g., for generating screenshots
     */
    application?: string;
    /**
     * the id of the application, for differentiating provenance graphs
     */
    id?: string;
    /**
     * the selection type to record
     */
    recordSelectionTypes?: string;
    /**
     * whether selection replays should be animated
     */
    animatedSelections?: boolean;
    /**
     * whether thumbnails should be shown in the provenance or story vis
     */
    thumbnails?: boolean;
    /**
     * App Header Link
     */
    appLink?: IHeaderLink;
    /**
     * Should the provenance graph layout be collapsed by default?
     */
    provVisCollapsed?: boolean;
    /**
     * Options that will be passed to the header
     */
    headerOptions?: IAppHeaderOptions;
    /**
     * formular used for the login dialog
     */
    loginForm?: string;
}
export declare class CLUEWrapper extends ACLUEWrapper {
    private options;
    header: AppHeader;
    $main: d3v3.Selection<any>;
    $mainRef: IObjectRef<d3v3.Selection<any>>;
    constructor(body: HTMLElement, options?: ICLUEWrapperOptions);
    protected buildImpl(body: HTMLElement): {
        graph: Promise<ProvenanceGraph>;
        manager: CLUEGraphManager;
        storyVis: () => Promise<import("..").VerticalStoryVis>;
        provVis: () => Promise<import("..").LayoutedProvVis>;
    };
    reset(): void;
    /**
     * factory method creating a CLUEWrapper instance
     * @param body
     * @param options
     * @returns {CLUEWrapper}
     */
    static createCLUEWrapper(body: HTMLElement, options?: any): CLUEWrapper;
    /**
     * factory method creating a CLUEWrapper instance
     * @param body
     * @param options
     * @returns {CLUEWrapper}
     */
    static createWrapperFactory(body: HTMLElement, options?: any): {
        on: (...args: any[]) => number;
        $main: d3v3.Selection<any>;
        graph: Promise<ProvenanceGraph>;
        jumpToStored: () => number;
    };
}
//# sourceMappingURL=CLUEWrapper.d.ts.map