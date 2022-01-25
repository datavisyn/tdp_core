import { IColumnDesc } from 'lineupjs';
import { IViewPluginDesc } from '..';
export interface IVisynViewPluginDesc extends Pick<IViewPluginDesc, 'selection'> {
    rankingOptions?: {
        columns: IColumnDesc[];
    };
}
export interface IRankingVisynViewPluginDesc extends IVisynViewPluginDesc {
    rankingOptions?: {
        columns: IColumnDesc[];
    };
}
export interface IVisynViewProps<C extends IVisynViewPluginDesc, P> {
    desc: C;
    data: {
        [key: string]: any;
    };
    dataDesc: any[];
    selection: string[];
    filters: string[];
    parameters: P;
    onSelectionChanged: (selection: string[]) => void;
    onFiltersChanged: (newFilter: string[]) => void;
    onParametersChanged: (parameters: P) => void;
}
//# sourceMappingURL=VisynView.d.ts.map