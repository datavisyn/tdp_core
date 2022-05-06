import { ESupportedPlotlyVis, ISankeyConfig, IVisConfig } from '../interfaces';

export function isSankey(s: IVisConfig): s is ISankeyConfig {
  return s.type === ESupportedPlotlyVis.VIOLIN;
}
