import { BaseConfig, ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';
export declare function isSankey(s: IVisConfig): s is ISankeyConfig;
/**const defaultConfig: ISankeyConfig = {
  type: 'Sankey',
  catColumnsSelected: [],
};**/
export declare function sankeyMergeDefaultConfig(columns: VisColumn[], config: ISankeyConfig, defaultConfig: ISankeyConfig): BaseConfig<'Sankey'>;
//# sourceMappingURL=utils.d.ts.map