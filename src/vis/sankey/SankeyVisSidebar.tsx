import * as React from 'react';
import { ColumnInfo, ESupportedPlotlyVis, ICommonVisSideBarProps, ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';

export function SankeyVisSidebar({
  config,
  setConfig,
  className = '',
  columns,
  style: { width = '20em', ...style } = {},
}: { config: ISankeyConfig; setConfig: (config: IVisConfig) => void; columns: VisColumn[] } & ICommonVisSideBarProps) {
  console.log(config);

  return (
    <div className={`container pb-3 pt-2 ${className}`} style={{ width, ...style }}>
      <WarningMessage />
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />

      <CategoricalColumnSelect
        callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
        columns={columns}
        currentSelected={config.catColumnsSelected || []}
      />
    </div>
  );
}
