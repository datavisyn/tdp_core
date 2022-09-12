import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import { ColumnInfo, ESupportedPlotlyVis, EViolinOverlay, IViolinConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { ViolinOverlayButtons } from '../sidebar/ViolinOverlayButtons';

const defaultConfig = {
  overlay: {
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
export function ViolinVisSidebar({
  config,
  optionsConfig,
  extensions,
  columns,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
  config: IViolinConfig;
  optionsConfig?: {
    overlay?: {
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
} & ICommonVisSideBarProps) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <Container fluid sx={{ width: '100%' }} p={10}>
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <Divider my="sm" />
      <Stack spacing="sm">
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
      </Stack>
      <Divider my="sm" />
      {mergedExtensions.preSidebar}

      {mergedOptionsConfig.overlay.enable
        ? mergedOptionsConfig.overlay.customComponent || (
            <ViolinOverlayButtons
              callback={(violinOverlay: EViolinOverlay) => setConfig({ ...config, violinOverlay })}
              currentSelected={config.violinOverlay}
            />
          )
        : null}

      {mergedExtensions.postSidebar}
    </Container>
  );
}
