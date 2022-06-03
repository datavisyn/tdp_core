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

export function ScatterVisSidebar({
  config,
  optionsConfig,
  columns,
  filterCallback = () => null,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
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
} & ICommonVisSideBarProps<IScatterConfig>) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

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
    </div>
  );
}
