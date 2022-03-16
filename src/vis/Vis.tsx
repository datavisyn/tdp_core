import * as React from 'react';
import d3 from 'd3';
import { useMemo, useEffect } from 'react';
import {
  ESupportedPlotlyVis,
  IVisConfig,
  Scales,
  VisColumn,
  EFilterOptions,
  ENumericalColorScaleType,
  EColumnTypes,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EScatterSelectSettings,
  EHexbinOptions,
} from './interfaces';
import { isScatter, scatterMergeDefaultConfig, ScatterVis } from './scatter';
import { barMergeDefaultConfig, isBar, BarVis } from './bar';
import { isViolin, violinMergeDefaultConfig, ViolinVis } from './violin';
import { isStrip, stripMergeDefaultConfig, StripVis } from './strip';
import { isPCP, pcpMergeDefaultConfig, PCPVis } from './pcp';
import { getCssValue } from '../utils';
import { densityMergeDefaultConfig, isDensity } from './density/utils';
import { DensityVis } from './density/DensityVis';

export function Vis({
  columns,
  selected = [],
  colors = [
    getCssValue('visyn-c1'),
    getCssValue('visyn-c2'),
    getCssValue('visyn-c3'),
    getCssValue('visyn-c4'),
    getCssValue('visyn-c5'),
    getCssValue('visyn-c6'),
    getCssValue('visyn-c7'),
    getCssValue('visyn-c8'),
    getCssValue('visyn-c9'),
    getCssValue('visyn-c10'),
  ],
  shapes = ['circle', 'square', 'triangle-up', 'star'],
  selectionCallback = () => null,
  filterCallback = () => null,
  externalConfig = null,
  hideSidebar = false,
}: {
  /**
   * Required data columns which are displayed.
   */
  columns: VisColumn[];
  /**
   * Optional Prop for identifying which points are selected. Any ids that are in this array will be considered selected.
   */
  selected?: string[];
  /**
   * Optional Prop for changing the colors that are used in color mapping. Defaults to the Datavisyn categorical color scheme
   */
  colors?: string[];
  /**
   * Optional Prop for changing the shapes that are used in shape mapping. Defaults to the circle, square, triangle, star.
   */
  shapes?: string[];
  /**
   * Optional Prop which is called when a selection is made in the scatterplot visualization. Passes in the selected points.
   */
  selectionCallback?: (s: string[]) => void;
  /**
   * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired. This logic will be simplified in the future.
   */
  filterCallback?: (s: EFilterOptions) => void;
  externalConfig?: IVisConfig;
  hideSidebar?: boolean;
}) {
  const [visConfig, setVisConfig] = React.useState<IVisConfig>(
    externalConfig || columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
      ? {
          type: ESupportedPlotlyVis.DENSITY,
          numColumnsSelected: [],
          color: null,
          isOpacityScale: true,
          isSizeScale: false,
          hexRadius: 16,
          hexbinOptions: EHexbinOptions.COLOR,
        }
      : {
          type: ESupportedPlotlyVis.BAR,
          multiples: null,
          group: null,
          direction: EBarDirection.VERTICAL,
          display: EBarDisplayType.ABSOLUTE,
          groupType: EBarGroupingType.STACK,
          numColumnsSelected: [],
          catColumnSelected: null,
        },
  );

  React.useEffect(() => {
    if (isScatter(visConfig)) {
      setVisConfig(scatterMergeDefaultConfig(columns, visConfig));
    }
    if (isViolin(visConfig)) {
      setVisConfig(violinMergeDefaultConfig(columns, visConfig));
    }
    if (isStrip(visConfig)) {
      setVisConfig(stripMergeDefaultConfig(columns, visConfig));
    }
    if (isPCP(visConfig)) {
      setVisConfig(pcpMergeDefaultConfig(columns, visConfig));
    }
    if (isBar(visConfig)) {
      setVisConfig(barMergeDefaultConfig(columns, visConfig));
    }
    if (isDensity(visConfig)) {
      setVisConfig(densityMergeDefaultConfig(columns, visConfig));
    }
    // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visConfig.type]);

  useEffect(() => {
    if (externalConfig) {
      setVisConfig(externalConfig);
    }
  }, [externalConfig]);

  const selectedMap = useMemo(() => {
    const currMap = {};

    selected.forEach((s) => {
      currMap[s] = true;
    });

    return currMap;
  }, [selected]);

  const scales: Scales = useMemo(() => {
    const colorScale = d3.scale.ordinal().range(colors);

    return {
      color: colorScale,
    };
  }, [colors]);

  return (
    <>
      {isScatter(visConfig) ? (
        <ScatterVis
          config={visConfig}
          optionsConfig={{
            color: {
              enable: true,
            },
          }}
          shapes={shapes}
          setConfig={setVisConfig}
          filterCallback={filterCallback}
          selectionCallback={selectionCallback}
          selected={selectedMap}
          columns={columns}
          scales={scales}
          hideSidebar={hideSidebar}
        />
      ) : null}

      {isDensity(visConfig) ? (
        <DensityVis
          config={visConfig}
          selectionCallback={selectionCallback}
          selected={selectedMap}
          setConfig={setVisConfig}
          columns={columns}
          hideSidebar={hideSidebar}
        />
      ) : null}

      {isViolin(visConfig) ? (
        <ViolinVis
          config={visConfig}
          optionsConfig={{
            overlay: {
              enable: true,
            },
          }}
          setConfig={setVisConfig}
          columns={columns}
          scales={scales}
          hideSidebar={hideSidebar}
        />
      ) : null}

      {isStrip(visConfig) ? (
        <StripVis
          config={visConfig}
          selectionCallback={selectionCallback}
          setConfig={setVisConfig}
          selected={selectedMap}
          columns={columns}
          scales={scales}
          hideSidebar={hideSidebar}
        />
      ) : null}

      {isPCP(visConfig) ? <PCPVis config={visConfig} selected={selectedMap} setConfig={setVisConfig} columns={columns} hideSidebar={hideSidebar} /> : null}

      {isBar(visConfig) ? <BarVis config={visConfig} setConfig={setVisConfig} columns={columns} scales={scales} hideSidebar={hideSidebar} /> : null}
    </>
  );
}
