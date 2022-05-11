/// <reference types="react" />
import { ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';
interface SankeyVisProps {
    config: ISankeyConfig;
    setConfig: (config: IVisConfig) => void;
    columns: VisColumn[];
}
export declare function fetchData(columns: VisColumn[], config: ISankeyConfig): Promise<{
    nodes: {
        labels: string[];
        color: string[];
        inverseLookup: any[];
    };
    links: {
        source: number[];
        target: number[];
        value: number[];
        color: string[];
        inverseLookup: any[];
    };
}>;
export declare function SankeyVis({ config, setConfig, columns }: SankeyVisProps): JSX.Element;
export {};
//# sourceMappingURL=SankeyVis.d.ts.map