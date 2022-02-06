import { CategoricalColumn, NumericalColumn, IVisConfig } from './interfaces';
export interface VisSidebarProps {
    /**
     * Required data columns which are displayed.
     */
    columns: (NumericalColumn | CategoricalColumn)[];
    /**
     * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired, either "Filter In", "Filter Out", or "Clear". This logic will be simplified in the future.
     */
    filterCallback?: (s: string) => void;
    externalConfig?: IVisConfig;
    setExternalConfig?: (c: IVisConfig) => void;
    width?: string;
}
export declare function VisSidebar({ columns, filterCallback, externalConfig, setExternalConfig, width }: VisSidebarProps): JSX.Element;
//# sourceMappingURL=VisSidebar.d.ts.map