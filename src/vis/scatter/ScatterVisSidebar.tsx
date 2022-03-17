import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import {
  ColumnInfo,
  EFilterOptions,
  ENumericalColorScaleType,
  ESupportedPlotlyVis,
  IScatterConfig,
  IVisConfig,
  VisColumn,
  ICommonVisSideBarProps,
} from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';
import { ShapeSelect } from '../sidebar/ShapeSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { WarningMessage } from '../sidebar/WarningMessage';

const defaultConfig = {
  color: {
    enable: true,
    customComponent: null,
  },
  shape: {
    enable: true,
    customComponent: null,
  },
  filter: {
    enable: true,
    customComponent: null,
  },
};

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function ScatterVisSidebar({
  config,
  optionsConfig,
  extensions,
  columns,
  filterCallback = () => null,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
  config: IScatterConfig;
  optionsConfig?: {
    color?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    shape?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    filter?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
  };
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  filterCallback?: (s: EFilterOptions) => void;
  setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

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
      <hr />
      {mergedExtensions.preSidebar}

      {mergedOptionsConfig.color.enable
        ? mergedOptionsConfig.color.customComponent || (
            <ColorSelect
              callback={(color: ColumnInfo) => setConfig({ ...config, color })}
              numTypeCallback={(numColorScaleType: ENumericalColorScaleType) => setConfig({ ...config, numColorScaleType })}
              currentNumType={config.numColorScaleType}
              columns={columns}
              currentSelected={config.color}
            />
          )
        : null}
      {mergedOptionsConfig.shape.enable
        ? mergedOptionsConfig.shape.customComponent || (
            <ShapeSelect callback={(shape: ColumnInfo) => setConfig({ ...config, shape })} columns={columns} currentSelected={config.shape} />
          )
        : null}
      <hr />
      {mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}

      {mergedExtensions.postSidebar}
    </div>
  );
}
