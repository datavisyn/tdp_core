import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Center, Container, Group, Stack } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { EFilterOptions, IVisConfig, Scales, IScatterConfig, VisColumn, EScatterSelectSettings } from '../interfaces';
import { InvalidCols } from '../general/InvalidCols';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../general/layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { ScatterVisSidebar } from './ScatterVisSidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { useAsync } from '../../hooks';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function ScatterVis({
  config,
  optionsConfig,
  extensions,
  columns,
  shapes = ['circle', 'square', 'triangle-up', 'star'],
  filterCallback = () => null,
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  setConfig,
  hideSidebar = false,
  showCloseButton = false,
  closeButtonCallback = () => null,
  scales,
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
  shapes?: string[];
  columns: VisColumn[];
  filterCallback?: (s: EFilterOptions) => void;
  selectionCallback?: (ids: string[]) => void;
  closeButtonCallback?: () => void;
  selectedMap?: { [key: string]: boolean };
  selectedList: string[];
  setConfig: (config: IVisConfig) => void;
  scales: Scales;
  hideSidebar?: boolean;
  showCloseButton?: boolean;
}) {
  const id = React.useMemo(() => uniqueId('ScatterVis'), []);
  const plotlyDivRef = React.useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  console.log('re rendering');

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const plotDiv = document.getElementById(`plotlyDiv${id}`);
      if (plotDiv) {
        Plotly.Plots.resize(plotDiv);
      }
    });

    if (plotlyDivRef) {
      ro.observe(plotlyDivRef.current);
    }
  }, [id, hideSidebar, plotlyDivRef]);

  const mergedExtensions = React.useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const {
    value: traces,
    status: traceStatus,
    error: traceError,
  } = useAsync(createScatterTraces, [
    columns,
    config.numColumnsSelected,
    config.shape,
    config.color,
    config.alphaSliderVal,
    config.numColorScaleType,
    scales,
    shapes,
  ]);

  const layout = React.useMemo(() => {
    if (!traces) {
      return null;
    }

    const innerLayout: Plotly.Layout = {
      showlegend: true,
      legend: {
        // @ts-ignore
        itemclick: false,
        itemdoubleclick: false,
        font: {
          // same as default label font size in the sidebar
          size: 13.4,
        },
      },
      font: {
        family: 'Roboto, sans-serif',
      },
      margin: {
        t: 25,
        r: 25,
        l: 25,
        b: 25,
      },
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      violingap: 0,
      dragmode: config.dragMode,
    };

    return beautifyLayout(traces, innerLayout);
  }, [traces, config.dragMode]);

  const plotsWithSelectedPoints = useMemo(() => {
    if (traces) {
      const allPlots = traces.plots;
      allPlots
        .filter((trace) => trace.data.type === 'scattergl')
        .forEach((p) => {
          const temp = [];

          (p.data.ids as any).forEach((currId, index) => {
            if (selectedMap[currId]) {
              temp.push(index);
            }
          });

          p.data.selectedpoints = temp;
        });

      return allPlots;
    }

    return [];
  }, [selectedMap, traces]);

  const plotlyData = useMemo(() => {
    return [...plotsWithSelectedPoints.map((p) => p.data), ...plotsWithSelectedPoints.map((p) => p.data)];
  }, [plotsWithSelectedPoints]);

  const plotly = useMemo(() => {
    if (traces?.plots && plotsWithSelectedPoints) {
      return (
        <PlotlyComponent
          divId={`plotlyDiv${id}`}
          data={plotlyData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          onClick={(event) => {
            const clickedId = (event.points[0] as any).id;
            if (selectedMap[clickedId]) {
              selectionCallback(selectedList.filter((s) => s !== clickedId));
            } else {
              selectionCallback([...selectedList, clickedId]);
            }
          }}
          className="tdpCoreVis"
          onSelected={(sel) => {
            selectionCallback(sel ? sel.points.map((d) => (d as any).id) : []);
          }}
        />
      );
    }
    return null;
  }, [id, plotsWithSelectedPoints, layout, selectedMap, selectionCallback, selectedList, traces?.plots, plotlyData]);

  return (
    <Container fluid sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }} ref={plotlyDivRef}>
      <ActionIcon sx={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => setSidebarOpen(true)}>
        <FontAwesomeIcon icon={faGear} />
      </ActionIcon>
      <Stack spacing={0} sx={{ height: '100%' }}>
        <Center>
          <Group mt="lg">
            <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
          </Group>
        </Center>
        {mergedExtensions.prePlot}
        {traceStatus === 'success' && plotsWithSelectedPoints.length > 0 ? (
          plotly
        ) : traceStatus !== 'pending' ? (
          <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
        ) : null}

        {mergedExtensions.postPlot}
        {showCloseButton ? <CloseButton closeCallback={closeButtonCallback} /> : null}
      </Stack>
      {!hideSidebar ? (
        <VisSidebarWrapper id={id} target={plotlyDivRef.current} open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <ScatterVisSidebar
            config={config}
            optionsConfig={optionsConfig}
            extensions={extensions}
            columns={columns}
            filterCallback={filterCallback}
            setConfig={setConfig}
          />
        </VisSidebarWrapper>
      ) : null}
    </Container>
  );
}
