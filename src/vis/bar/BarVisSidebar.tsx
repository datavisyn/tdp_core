import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { ColumnInfo, EBarDirection, EBarDisplayType, EBarGroupingType, ESupportedPlotlyVis, IBarConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { GroupSelect } from '../sidebar/GroupSelect';
import { MultiplesSelect } from '../sidebar/MultiplesSelect';
import { BarDirectionButtons } from '../sidebar/BarDirectionButtons';
import { BarGroupTypeButtons } from '../sidebar/BarGroupTypeButtons';
import { BarDisplayButtons } from '../sidebar/BarDisplayTypeButtons';
import { CategoricalColumnSingleSelect } from '../sidebar/CategoricalColumnSingleSelect';

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
  columns: VisColumn[];
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
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <div className="container pb-3 pt-2" style={{ width }}>
      <WarningMessage />
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <hr />
      <CategoricalColumnSingleSelect
        callback={(catColumnSelected: ColumnInfo) => setConfig({ ...config, catColumnSelected })}
        columns={columns}
        currentSelected={config.catColumnSelected}
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
