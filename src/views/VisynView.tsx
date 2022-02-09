import {IServerColumn, IVisynViewPlugin} from '../base';

export interface IVisynViewProps<Desc extends IVisynViewPlugin, Param extends Record<string, any>> {
    desc: Desc;
    data: Record<string, any>;
    //TODO:: Type to IReprovisynServerColumn when we merge that into tdp_core
    dataDesc: IServerColumn[] | any[];
    selection: string[];
    idFilter: string[];
    parameters: Param;
    onSelectionChanged: (selection: string[]) => void;
    onIdFilterChanged: (idFilter: string[]) => void;
    onParametersChanged: (parameters: Param) => void;
}
