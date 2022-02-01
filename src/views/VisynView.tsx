import {IColumnDesc} from 'lineupjs';
import {IViewPluginDesc} from '..';

export interface IVisynViewProps<C, P> {
    desc: C;
    entityId: string;
    data: {[key: string]: any};
    // better way of saving this??
    dataDesc: any[];
    selection: string[];
    filters: string[];
    parameters: P;
    onSelectionChanged: (selection: string[]) => void;
    onFiltersChanged: (newFilter: string[]) => void;
    onParametersChanged: (parameters: P) => void;
}
