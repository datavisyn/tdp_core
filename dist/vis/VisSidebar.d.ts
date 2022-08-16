/// <reference types="react" />
import { IVisConfig, VisColumn, ICommonVisSideBarProps } from './interfaces';
export declare type VisSidebarProps = {
    /**
     * Required data columns which are displayed.
     */
    columns: VisColumn[];
    /**
     * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired, either "Filter In", "Filter Out", or "Clear". This logic will be simplified in the future.
     */
    filterCallback?: (s: string) => void;
    externalConfig: IVisConfig;
    setExternalConfig: (c: IVisConfig) => void;
} & ICommonVisSideBarProps;
export declare function VisSidebar({ columns, filterCallback, externalConfig, setExternalConfig, className, style }: VisSidebarProps): JSX.Element;
//# sourceMappingURL=VisSidebar.d.ts.map