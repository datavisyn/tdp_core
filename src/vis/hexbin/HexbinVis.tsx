import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import { ActionIcon, Center, Container, Group, SimpleGrid, Stack } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { VisColumn, IVisConfig, IHexbinConfig, EScatterSelectSettings } from '../interfaces';
import { InvalidCols } from '../general';
import { I18nextManager } from '../../i18n/I18nextManager';
import { Hexplot } from './Hexplot';
import { HexbinVisSidebar } from './HexbinVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { BrushOptionButtons } from '../sidebar';

interface DensityVisProps {
  config: IHexbinConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  hideSidebar?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function HexbinVis({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, hideSidebar = false }: DensityVisProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const ref = useRef();

  const id = React.useMemo(() => uniqueId('PCPVis'), []);

  return (
    <Container p={0} fluid sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }} ref={ref}>
      <ActionIcon sx={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => setSidebarOpen(true)}>
        <FontAwesomeIcon icon={faGear} />
      </ActionIcon>
      <Stack spacing={0} sx={{ height: '100%' }}>
        <Center>
          <Group mt="lg">
            <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
          </Group>
        </Center>
        <SimpleGrid style={{ height: '100%' }}>
          {config.numColumnsSelected.length < 2 ? (
            <InvalidCols
              headerMessage={I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader')}
              bodyMessage={I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError')}
            />
          ) : (
            <>
              {config.numColumnsSelected.length > 2 ? (
                config.numColumnsSelected.map((xCol) => {
                  return config.numColumnsSelected.map((yCol) => {
                    if (xCol.id !== yCol.id) {
                      return (
                        <Hexplot
                          key={yCol.id + xCol.id}
                          selectionCallback={selectionCallback}
                          selected={selected}
                          config={config}
                          columns={columns.filter((col) => col.info.id === xCol.id || col.info.id === yCol.id || col.info.id === config.color?.id)}
                        />
                      );
                    }

                    return <div key={`${xCol.id}hist`} />;
                  });
                })
              ) : (
                <Hexplot selectionCallback={selectionCallback} selected={selected} config={config} columns={columns} />
              )}
              {mergedExtensions.postPlot}
            </>
          )}
        </SimpleGrid>
      </Stack>
      {!hideSidebar ? (
        <VisSidebarWrapper id={id} target={ref.current} open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <HexbinVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Container>
  );
}
