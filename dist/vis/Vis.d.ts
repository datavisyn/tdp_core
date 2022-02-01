import { CategoricalColumn, NumericalColumn } from './interfaces';
export interface VisProps {
    /**
     * Required data columns which are displayed.
     */
    columns: (NumericalColumn | CategoricalColumn)[];
    /**
     * Optional Prop for identifying which points are selected. The keys of the map should be the same ids that are passed into the columns prop.
     */
    selected?: {
        [key: string]: boolean;
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
     * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired, either "Filter In", "Filter Out", or "Clear". This logic will be simplified in the future.
     */
    filterCallback?: (s: string) => void;
}
export declare function Vis({ columns, selected, colors, shapes, selectionCallback, filterCallback }: VisProps): JSX.Element;
//# sourceMappingURL=Vis.d.ts.map