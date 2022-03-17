import { VisynSimpleViewPluginType } from '../interfaces';
import { VisColumn, IVisConfig } from '../../../vis/interfaces';

export type DemoVisynViewPluginType = VisynSimpleViewPluginType<{
  columns: VisColumn[] | null;
  config: IVisConfig | null;
  dataLength: number;
}>;
