import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import {
  ColumnInfo,
  EFilterOptions,
  ENumericalColorScaleType,
  ESupportedPlotlyVis,
  IScatterConfig,
  IVisConfig,
  VisColumn,
  ICommonVisSideBarProps,
  EColumnTypes,
} from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { OpacitySlider } from '../sidebar/OpacitySlider';

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

  console.log(config);

  return (
    <Container fluid sx={{ width: '100%' }} p={10}>
      <Stack spacing={0}>
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
        <Divider my="sm" />
        <NumericalColumnSelect
          callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
          columns={columns}
          currentSelected={config.numColumnsSelected || []}
        />
        <Divider my="sm" />
        {mergedExtensions.preSidebar}

        <Stack>
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
                <SingleColumnSelect
                  label="Shape"
                  type={[EColumnTypes.CATEGORICAL]}
                  callback={(shape: ColumnInfo) => setConfig({ ...config, shape })}
                  columns={columns}
                  currentSelected={config.shape}
                />
              )
            : null}
        </Stack>
        <Divider my="sm" />
        <Stack spacing={30}>
          <OpacitySlider
            callback={(e) => {
              console.log(e)
              if (config.alphaSliderVal !== e) {
                setConfig({ ...config, alphaSliderVal: e });
              }
            }}
            currentValue={config.alphaSliderVal}
          />
          {mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
        </Stack>
        {mergedExtensions.postSidebar}
      </Stack>
    </Container>
  );
}
