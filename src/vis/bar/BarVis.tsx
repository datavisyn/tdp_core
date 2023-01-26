import * as React from 'react';
import d3 from 'd3v3';
import { merge, uniqueId, difference } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Container, Space, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Layout } from 'plotly.js-dist-min';
import { Scales, VisColumn, IVisConfig, IBarConfig, EBarGroupingType } from '../interfaces';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { useAsync } from '../../hooks';
import { createBarTraces } from './utils';
import { BarVisSidebar } from './BarVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { I18nextManager } from '../../i18n';

interface BarVisProps {
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
  closeButtonCallback?: () => void;
  showCloseButton?: boolean;
  selectionCallback?: (ids: string[]) => void;
  selectedMap?: { [key: string]: boolean };
  selectedList: string[];
  setConfig: (config: IVisConfig) => void;
  scales: Scales;
  hideSidebar?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function BarVis({
  config,
  optionsConfig,
  extensions,
  columns,
  setConfig,
  scales,
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  hideSidebar = false,
  showCloseButton = false,
  closeButtonCallback = () => null,
}: BarVisProps) {
  const mergedExtensions = React.useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createBarTraces, [columns, config, scales]);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Make sure selected values is right for each plot.
  const finalTraces = useMemo(() => {
    if (!traces) {
      return null;
    }

    let isTraceSelected = false;

    const editedTraces = { ...traces };

    editedTraces?.plots.forEach((plot) => {
      // custom data on each trace is the ids of every element in that section of the bar.
      const tracePoints: string[][] = plot.data.customdata as string[][];

      const selectedIndices = [];
      tracePoints.forEach((points, index) => {
        if (points.length === 0 || selectedList.length < points.length) {
          return;
        }
        for (const point of points) {
          if (!selectedMap[point]) {
            return;
          }
        }

        selectedIndices.push(index);
        isTraceSelected = true;
      });

      if (selectedIndices.length > 0) {
        plot.data.selectedpoints = selectedIndices;
      } else {
        plot.data.selectedpoints = null;
      }
    });

    if (isTraceSelected) {
      editedTraces?.plots.forEach((plot) => {
        if (plot.data.selectedpoints === null) {
          plot.data.selectedpoints = [];
        }
      });
    }

    return editedTraces;
  }, [traces, selectedMap, selectedList]);

  const id = React.useMemo(() => uniqueId('BarVis'), []);

  const plotlyDivRef = React.useRef(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });

    if (plotlyDivRef) {
      ro.observe(plotlyDivRef.current);
    }
  }, [id, plotlyDivRef]);

  const layout = React.useMemo(() => {
    if (!finalTraces) {
      return null;
    }

    const innerLayout: Partial<Plotly.Layout> = {
      showlegend: true,
      legend: {
        // @ts-ignore
        itemclick: false,
        itemdoubleclick: false,
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
      grid: { rows: finalTraces.rows, columns: finalTraces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group',
      dragmode: false,
    };

    return beautifyLayout(finalTraces, innerLayout);
  }, [finalTraces, config.groupType]);

  const traceData = useMemo(() => {
    if (!finalTraces) {
      return null;
    }

    return [...finalTraces.plots.map((p) => p.data), ...finalTraces.legendPlots.map((p) => p.data)];
  }, [finalTraces]);

  return (
    <Container fluid sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }} ref={plotlyDivRef}>
      {showCloseButton ? <CloseButton closeCallback={closeButtonCallback} /> : null}

      {mergedExtensions.prePlot}
      <Space h="xl" />
      <Tooltip withinPortal label={I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings')}>
        <ActionIcon sx={{ zIndex: 10, position: 'absolute', top: '10px', right: '10px' }} onClick={() => setSidebarOpen(true)}>
          <FontAwesomeIcon icon={faGear} />
        </ActionIcon>
      </Tooltip>
      {traceStatus === 'success' && finalTraces?.plots.length > 0 ? (
        <PlotlyComponent
          divId={`plotlyDiv${id}`}
          data={traceData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          className="tdpCoreVis"
          onClick={(e) => {
            // plotly types here are just wrong. So have to convert to unknown first.
            const selectedPoints: string[] = e.points[0].customdata as unknown as string[];

            let removeSelectionFlag = true;

            for (const pointId of selectedPoints) {
              if (!selectedMap[pointId]) {
                removeSelectionFlag = false;
                break;
              }
            }

            if (removeSelectionFlag) {
              const newList = difference(selectedList, selectedPoints);
              selectionCallback(newList);
            } else if (e.event.ctrlKey) {
              const newList = Array.from(new Set([...selectedList, ...selectedPoints]));
              selectionCallback(newList);
            } else {
              selectionCallback(selectedPoints);
            }
          }}
          // plotly redraws everything on updates, so you need to reappend title and
          onUpdate={() => {
            for (const p of finalTraces.plots) {
              d3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

              d3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
            }
          }}
        />
      ) : traceStatus !== 'pending' ? (
        <InvalidCols headerMessage={finalTraces?.errorMessageHeader} bodyMessage={traceError?.message || finalTraces?.errorMessage} />
      ) : null}
      {mergedExtensions.postPlot}
      {!hideSidebar ? (
        <VisSidebarWrapper id={id} target={plotlyDivRef.current} open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <BarVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Container>
  );
}
