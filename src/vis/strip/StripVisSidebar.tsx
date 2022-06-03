import * as React from 'react';
import { ColumnInfo, ESupportedPlotlyVis, IStripConfig, ICommonVisSideBarProps } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';

export function StripVisSidebar({
  config,
  columns,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: ICommonVisSideBarProps<IStripConfig>) {
  return (
    <div className={`container pb-3 pt-2 ${className}`} style={{ width, ...style }}>
      <WarningMessage />
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <hr />
      <NumericalColumnSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
      />
      <CategoricalColumnSelect
        callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
        columns={columns}
        currentSelected={config.catColumnsSelected || []}
      />
      <hr />
    </div>
  );
}
