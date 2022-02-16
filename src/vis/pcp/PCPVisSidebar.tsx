import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { ColumnInfo, ESupportedPlotlyVis, IPCPConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { AllColumnSelect } from '../sidebar';

interface PCPVisSidebarProps {
  config: IPCPConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  width?: string;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};
export function PCPVisSidebar({ config, extensions, columns, setConfig, width = '20rem' }: PCPVisSidebarProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <div className="container pb-3 pt-2" style={{ width }}>
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
