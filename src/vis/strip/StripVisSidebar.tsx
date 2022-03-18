import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { ColumnInfo, ESupportedPlotlyVis, IStripConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};
export function StripVisSidebar({
  config,
  extensions,
  columns,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
  config: IStripConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

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
      {mergedExtensions.preSidebar}
      {mergedExtensions.postSidebar}
    </div>
  );
}
