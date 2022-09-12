import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import { ColumnInfo, ESupportedPlotlyVis, IStripConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};
export function StripVisSidebar({
  config,
  extensions,
  columns,
  setConfig,
}: {
  config: IStripConfig;
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
    <Container p={10} fluid sx={{ width: '100%' }}>
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
      {mergedExtensions.preSidebar}
      {mergedExtensions.postSidebar}
    </Container>
  );
}
