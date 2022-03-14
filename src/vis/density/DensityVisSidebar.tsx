import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { ColumnInfo, ESupportedPlotlyVis, IDensityConfig, IPCPConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { AllColumnSelect, CategoricalColumnSelect, NumericalColumnSelect } from '../sidebar';
import { CategoricalColumnSingleSelect } from '../sidebar/CategoricalColumnSingleSelect';

interface DensityVisSidebarProps {
  config: IDensityConfig;
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

export function DensityVisSidebar({ config, extensions, columns, setConfig, width = '20rem' }: DensityVisSidebarProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <div className="container pb-3 pt-2" style={{ width }}>
      <WarningMessage />
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <hr />
      <NumericalColumnSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
      />
      <CategoricalColumnSingleSelect callback={(color: ColumnInfo) => setConfig({ ...config, color })} columns={columns} currentSelected={config.color} />
      <hr />
      {mergedExtensions.preSidebar}
      {mergedExtensions.postSidebar}
    </div>
  );
}
