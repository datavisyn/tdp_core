import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import {
  CategoricalColumn,
  ColumnInfo,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EFilterOptions,
  ESupportedPlotlyVis,
  IBarConfig,
  NumericalColumn,
  IVisConfig,
} from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { BarDirectionButtons, BarDisplayButtons, BarGroupTypeButtons, CategoricalColumnSelect, GroupSelect, MultiplesSelect } from '..';

interface BarVisSidebarProps {
  config: IBarConfig;
  optionsConfig?: {
    group?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    multiples?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    direction?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    groupingType?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    display?: {
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
  columns: (NumericalColumn | CategoricalColumn)[];
  setConfig: (config: IVisConfig) => void;
  width?: string;
}

const defaultConfig = {
  group: {
    enable: true,
    customComponent: null,
  },
  multiples: {
    enable: true,
    customComponent: null,
  },
  direction: {
    enable: true,
    customComponent: null,
  },
  groupType: {
    enable: true,
    customComponent: null,
  },
  display: {
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

export function BarVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width = '20rem' }: BarVisSidebarProps) {
  const uniqueId = useMemo(() => {
    return Math.random().toString(36).substr(2, 5);
  }, []);

  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, []);

  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, []);

  return (
    <div className="container pb-3 pt-2" style={{ width }}>
      <WarningMessage />
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <hr />
      <CategoricalColumnSelect
        callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
        columns={columns}
        currentSelected={config.catColumnsSelected || []}
      />
      <hr />
      {mergedExtensions.preSidebar}

      {mergedOptionsConfig.group.enable
        ? mergedOptionsConfig.group.customComponent || (
            <GroupSelect callback={(group: ColumnInfo) => setConfig({ ...config, group })} columns={columns} currentSelected={config.group} />
          )
        : null}
      {mergedOptionsConfig.multiples.enable
        ? mergedOptionsConfig.multiples.customComponent || (
            <MultiplesSelect callback={(multiples: ColumnInfo) => setConfig({ ...config, multiples })} columns={columns} currentSelected={config.multiples} />
          )
        : null}
      <hr />
      {mergedOptionsConfig.direction.enable
        ? mergedOptionsConfig.direction.customComponent || (
            <BarDirectionButtons callback={(direction: EBarDirection) => setConfig({ ...config, direction })} currentSelected={config.direction} />
          )
        : null}

      {mergedOptionsConfig.groupType.enable
        ? mergedOptionsConfig.groupType.customComponent || (
            <BarGroupTypeButtons callback={(groupType: EBarGroupingType) => setConfig({ ...config, groupType })} currentSelected={config.groupType} />
          )
        : null}

      {mergedOptionsConfig.display.enable
        ? mergedOptionsConfig.display.customComponent || (
            <BarDisplayButtons callback={(display: EBarDisplayType) => setConfig({ ...config, display })} currentSelected={config.display} />
          )
        : null}

      {mergedExtensions.postSidebar}
    </div>
  );
}
