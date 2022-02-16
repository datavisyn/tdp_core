import { IServerColumn, IVisynViewPlugin } from '../base';
export interface IVisynViewProps<Desc extends IVisynViewPlugin, Param extends Record<string, any>> {
    desc: Desc;
    data: Record<string, any>;
    dataDesc: IServerColumn[] | any[];
    selection: string[];
    idFilter: string[];
    parameters: Param;
    onSelectionChanged: (selection: string[]) => void;
    onIdFilterChanged: (idFilter: string[]) => void;
    onParametersChanged: (parameters: Param) => void;
}
//# sourceMappingURL=interfaces.d.ts.map