import { IVisConfig, VisColumn, EFilterOptions } from './interfaces';
export declare function Vis({ columns, selected, colors, shapes, selectionCallback, filterCallback, externalConfig, hideSidebar, }: {
    /**
     * Required data columns which are displayed.
     */
    columns: VisColumn[];
    /**
     * Optional Prop for identifying which points are selected. The keys of the map should be the same ids that are passed into the columns prop.
     */
    selected?: {
        [id: string]: boolean;
    };
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
    externalConfig?: IVisConfig;
    hideSidebar?: boolean;
}): JSX.Element;
//# sourceMappingURL=Vis.d.ts.map