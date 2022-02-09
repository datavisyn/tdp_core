import { IColumnConstructor, IColumnDesc, IDataProviderOptions, ILocalDataProviderOptions, ITypeFactory, LocalDataProvider } from 'lineupjs';
/**
 * A data provider which changes the default column width from LineUp
 */
export default class TDPLocalDataProvider extends LocalDataProvider {
    constructor(_data: any[], columns?: IColumnDesc[], options?: Partial<ILocalDataProviderOptions & IDataProviderOptions>);
    protected instantiateColumn(type: IColumnConstructor, id: string, desc: IColumnDesc, typeFactory: ITypeFactory): import("lineupjs").Column;
}
//# sourceMappingURL=TDPLocalDataProvider.d.ts.map