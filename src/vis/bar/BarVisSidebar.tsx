import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import {
  ColumnInfo,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  ESupportedPlotlyVis,
  IBarConfig,
  IVisConfig,
  VisColumn,
  ICommonVisSideBarProps,
  EAggregateTypes,
  EColumnTypes,
} from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { GroupSelect } from '../sidebar/GroupSelect';
import { MultiplesSelect } from '../sidebar/MultiplesSelect';
import { BarDirectionButtons } from '../sidebar/BarDirectionButtons';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';

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

export function BarVisSidebar({
  config,
  optionsConfig,
  columns,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
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
} & ICommonVisSideBarProps<IBarConfig>) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  return (
    <div className={`container pb-3 pt-2 ${className}`} style={{ width, ...style }}>
      <WarningMessage />
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <hr />
      <SingleColumnSelect
        callback={(catColumnSelected: ColumnInfo) =>
          setConfig({
            ...config,
            catColumnSelected,
            multiples: config.multiples && config.multiples.id === catColumnSelected.id ? null : config.multiples,
            group: config.group && config.group.id === catColumnSelected.id ? null : config.group,
          })
        }
        columns={columns}
        currentSelected={config.catColumnSelected}
        type={[EColumnTypes.CATEGORICAL]}
        label="Categorical Column"
      />
      <AggregateTypeSelect
        aggregateTypeSelectCallback={(aggregateType: EAggregateTypes) => {
          if (config.aggregateColumn === null) {
            setConfig({ ...config, aggregateType, aggregateColumn: columns.find((col) => col.type === EColumnTypes.NUMERICAL).info });
          } else {
            setConfig({ ...config, aggregateType });
          }
        }}
        aggregateColumnSelectCallback={(aggregateColumn: ColumnInfo) => setConfig({ ...config, aggregateColumn })}
        columns={columns}
        currentSelected={config.aggregateType}
        aggregateColumn={config.aggregateColumn}
      />
      <hr />

      {mergedOptionsConfig.group.enable
        ? mergedOptionsConfig.group.customComponent || (
            <GroupSelect
              groupColumnSelectCallback={(group: ColumnInfo) => setConfig({ ...config, group })}
              groupTypeSelectCallback={(groupType: EBarGroupingType) => setConfig({ ...config, groupType })}
              groupDisplaySelectCallback={(display: EBarDisplayType) => setConfig({ ...config, display })}
              displayType={config.display}
              groupType={config.groupType}
              columns={columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id)}
              currentSelected={config.group}
            />
          )
        : null}
      {mergedOptionsConfig.multiples.enable
        ? mergedOptionsConfig.multiples.customComponent || (
            <MultiplesSelect
              callback={(multiples: ColumnInfo) => setConfig({ ...config, multiples })}
              columns={columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id)}
              currentSelected={config.multiples}
            />
          )
        : null}
      <hr />
      {mergedOptionsConfig.direction.enable
        ? mergedOptionsConfig.direction.customComponent || (
            <BarDirectionButtons callback={(direction: EBarDirection) => setConfig({ ...config, direction })} currentSelected={config.direction} />
          )
        : null}
    </div>
  );
}
