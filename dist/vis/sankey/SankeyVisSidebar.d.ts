/// <reference types="react" />
import { ICommonVisSideBarProps, ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';
export declare function SankeyVisSidebar({ config, setConfig, className, columns, style: { width, ...style }, }: {
    config: ISankeyConfig;
    setConfig: (config: IVisConfig) => void;
    columns: VisColumn[];
} & ICommonVisSideBarProps): JSX.Element;
//# sourceMappingURL=SankeyVisSidebar.d.ts.map