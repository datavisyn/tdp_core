import * as React from 'react';
import d3 from 'd3';
import { ESupportedPlotlyVis, IVisConfig, Scales, VisColumn, EFilterOptions, ENumericalColorScaleType } from './interfaces';
import { isScatter, scatterMergeDefaultConfig, ScatterVis } from './scatter';
import { barMergeDefaultConfig, isBar, BarVis } from './bar';
import { isViolin, violinMergeDefaultConfig, ViolinVis } from './violin';
import { isStrip, stripMergeDefaultConfig, StripVis } from './strip';
import { isPCP, pcpMergeDefaultConfig, PCPVis } from './pcp';
import { getCssValue } from '../utils';

export function Vis({
  columns,
  selected = {},
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
}: {
  /**
   * Required data columns which are displayed.
   */
  columns: VisColumn[];
  /**
   * Optional Prop for identifying which points are selected. The keys of the map should be the same ids that are passed into the columns prop.
   */
  selected?: { [id: string]: boolean };
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
}) {
  const [visConfig, setVisConfig] = React.useState<IVisConfig>({
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    isRectBrush: true,
    alphaSliderVal: 1,
  });

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
    // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visConfig.type]);

  const scales: Scales = React.useMemo(() => {
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
          selected={selected}
          columns={columns}
          scales={scales}
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
        />
      ) : null}

      {isStrip(visConfig) ? <StripVis config={visConfig} setConfig={setVisConfig} columns={columns} scales={scales} /> : null}

      {isPCP(visConfig) ? <PCPVis config={visConfig} setConfig={setVisConfig} columns={columns} /> : null}

      {isBar(visConfig) ? <BarVis config={visConfig} setConfig={setVisConfig} columns={columns} scales={scales} /> : null}
    </>
  );
}
