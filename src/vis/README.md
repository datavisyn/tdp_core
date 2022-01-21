## 'Vis'

This package is primarily a react component that allows for the viewing of a number of different types of visualizations. Currently that includes Scatterplots, Bar plots, Strip plots, violin plots, and limited support of parallel coordinate plots. All plots include additional options that are a part of the UI of this component, and are built on top of plotly. 

### 'Props'
Using this component in react is designed to be simple, with the only necessary prop being the data. The data must be an array of columns, with each column being either a NumericalColumn or a CategoricalColumn, with those definitions being 

```javascript
export interface NumericalColumn {
    info: ColumnInfo;
    values: {id: number, val: number}[];
    type: EColumnTypes.NUMERICAL;
}

export interface CategoricalColumn {
    info: ColumnInfo;
    colors: string[];
    values: {id: number, val: string}[];
    type: EColumnTypes.CATEGORICAL;
}

export type ColumnInfo = {
    name: string,
    id: string
    description: string,
};
```

The rest of the props are optional. The props are

```javascript
export interface VisProps {
    /**
     * Required data columns which are displayed.
     */
    columns: (NumericalColumn | CategoricalColumn)[];
    /**
     * Optional Prop for identifying which points are selected. The keys of the map should be the same ids that are passed into the columns prop.
     */
    selected?: {[key: number]: boolean};
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
    selectionCallback?: (s: number[]) => void;
    /**
     * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired. This logic will be simplified in the future.
     */
    filterCallback?: (s: EFilterOptions) => void;
}
```

Currently, there is no way to limit or edit the options that are presented within the Vis package from outside of the package. This should be changed in the future to allow simplifying, for example to only show the scatterplot component.

### 'Known Problems'

A Few of the known problems/limitations. 

1. Labels are not always properly truncated, and if too many small multiples are created at once, this can cause problems. 
2. Scatterplots numerical color scale does not have a legend
3. Scatterplots shape mapping has too few shapes, quickly runs into duplicates. 
4. Only one filter can be applied at a time. Applying a second one simply erases the first. This is due to a limitation in how the LineupDataProvider creates global filters. will be solved in Ordino 2.0
5. Adding extra categorical Columns to the Bar chart does nothing. Should instead be a single select dropdown. This is an easy fix but I just noticed it. 
6. Parallel Coordinates are overall useless as they don't have any opacity applied to them, cant select. 
7. Changing Opacity can get slow in the scatterplot if you have many points/plots. 
8. Closing/opening the sidebar has a small delay before resizing the plotly canvas. 
9. Should include an error boundary on the component, so that it doesnt unmount when an error is thrown. 