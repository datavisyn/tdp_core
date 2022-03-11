import { DefineVisynViewPlugin } from '../interfaces';
import { IServerColumn } from '../../../base/rest';
/**
 * Plugin type for all data backed visyn views. Extends the visyn view props with data and their description.
 */
export declare type VisynDataViewPluginType<Param extends Record<string, unknown> = Record<string, unknown>, Desc extends Record<string, unknown> = Record<string, unknown>> = DefineVisynViewPlugin<'data', Param, {
    /**
     * Data array matching the columns defined in the `dataDesc`.
     */
    data: Record<string, unknown>[];
    /**
     * Data column description describing the given `data`.
     * TODO:: Type to IReprovisynServerColumn when we merge that into tdp_core
     */
    dataDesc: IServerColumn[] | any[];
}, Desc>;
//# sourceMappingURL=DataVisynView.d.ts.map