import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { ColumnInfo, ESupportedPlotlyVis, IPCPConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { AllColumnSelect } from '../sidebar';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function PCPVisSidebar({
  config,
  extensions,
  columns,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
  config: IPCPConfig;
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
      <AllColumnSelect
        callback={(allColumnsSelected: ColumnInfo[]) => setConfig({ ...config, allColumnsSelected })}
        columns={columns}
        currentSelected={config.allColumnsSelected || []}
      />
      <hr />
      {mergedExtensions.preSidebar}
      {mergedExtensions.postSidebar}
    </div>
  );
}
