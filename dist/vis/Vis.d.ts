/// <reference types="react" />
import { IVisConfig, VisColumn, EFilterOptions } from './interfaces';
export declare function Vis({ columns, selected, colors, shapes, selectionCallback, filterCallback, setExternalConfig, closeCallback, showCloseButton, externalConfig, enableSidebar, showSidebar: internalShowSidebar, setShowSidebar: internalSetShowSidebar, showSidebarDefault, }: {
    /**
     * Required data columns which are displayed.
     */
    columns: VisColumn[];
    /**
     * Optional Prop for identifying which points are selected. Any ids that are in this array will be considered selected.
     */
    selected?: string[];
    /**
     * Optional Prop for changing the colors that are used in color mapping. Defaults to the Datavisyn categorical color scheme
     */
    colors?: string[];
    /**
     * Optional Prop for changing the shapes that are used in shape mapping. Defaults to the circle, square, triangle, star.
     */
    shapes?: string[];
    /**
     * Optional Prop which is called when a selection is made in the scatterplot visualization. Passes in the selected points.
     */
    selectionCallback?: (s: string[]) => void;
    /**
     * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired. This logic will be simplified in the future.
     */
    filterCallback?: (s: EFilterOptions) => void;
    setExternalConfig?: (config: IVisConfig) => void;
    closeCallback?: () => void;
    showCloseButton?: boolean;
    externalConfig?: IVisConfig;
    enableSidebar?: boolean;
    showSidebar?: boolean;
    setShowSidebar?(show: boolean): void;
    showSidebarDefault?: boolean;
}): JSX.Element;
//# sourceMappingURL=Vis.d.ts.map