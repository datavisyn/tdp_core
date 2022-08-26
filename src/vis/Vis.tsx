import * as React from 'react';
import d3v3 from 'd3v3';
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
  EAggregateTypes,
} from './interfaces';
import { isScatter, scatterMergeDefaultConfig, ScatterVis } from './scatter';
import { barMergeDefaultConfig, isBar, BarVis } from './bar';
import { isViolin, violinMergeDefaultConfig, ViolinVis } from './violin';
import { isStrip, stripMergeDefaultConfig, StripVis } from './strip';
import { isPCP, pcpMergeDefaultConfig, PCPVis } from './pcp';
import { getCssValue } from '../utils';
import { useSyncedRef } from '../hooks/useSyncedRef';

const DEFAULT_COLORS = [
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
];

const DEFAULT_SHAPES = ['circle', 'square', 'triangle-up', 'star'];

export function Vis({
  columns,
  selected = [],
  colors = DEFAULT_COLORS,
  shapes = DEFAULT_SHAPES,
  selectionCallback = () => null,
  filterCallback = () => null,
  setExternalConfig = () => null,
  closeCallback = () => null,
  showCloseButton = false,
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
  setExternalConfig?: (config: IVisConfig) => void;
  closeCallback?: () => void;
  showCloseButton?: boolean;
  externalConfig?: IVisConfig;
  hideSidebar?: boolean;
}) {
  // Each time you switch between vis config types, there is one render where the config is inconsistent with the type before the merge functions in the useEffect below can be called.
  // To ensure that we never render an incosistent config, keep a consistent and a current in the config. Always render the consistent.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [{ consistent: visConfig, current: inconsistentVisConfig }, _setVisConfig] = React.useState<{
    consistent: IVisConfig;
    current: IVisConfig;
  }>(
    externalConfig
      ? { consistent: null, current: externalConfig }
      : columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
      ? {
          consistent: null,
          current: {
            type: ESupportedPlotlyVis.SCATTER,
            numColumnsSelected: [],
            color: null,
            numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
            shape: null,
            dragMode: EScatterSelectSettings.RECTANGLE,
            alphaSliderVal: 0.5,
          },
        }
      : {
          consistent: null,
          current: {
            type: ESupportedPlotlyVis.BAR,
            multiples: null,
            group: null,
            direction: EBarDirection.HORIZONTAL,
            display: EBarDisplayType.ABSOLUTE,
            groupType: EBarGroupingType.STACK,
            numColumnsSelected: [],
            catColumnSelected: null,
            aggregateColumn: null,
            aggregateType: EAggregateTypes.COUNT,
          },
        },
  );

  const setExternalConfigRef = useSyncedRef(setExternalConfig);
  useEffect(() => {
    setExternalConfigRef.current?.(visConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visConfig, setExternalConfigRef]);

  const setVisConfig = React.useCallback((newConfig: IVisConfig) => {
    _setVisConfig((oldConfig) => {
      return {
        current: newConfig,
        consistent: oldConfig.current.type !== newConfig.type ? oldConfig.consistent : newConfig,
      };
    });
  }, []);

  React.useEffect(() => {
    if (isScatter(inconsistentVisConfig)) {
      const newConfig = scatterMergeDefaultConfig(columns, inconsistentVisConfig);
      _setVisConfig({ current: newConfig, consistent: newConfig });
    }
    if (isViolin(inconsistentVisConfig)) {
      const newConfig = violinMergeDefaultConfig(columns, inconsistentVisConfig);
      _setVisConfig({ current: newConfig, consistent: newConfig });
    }
    if (isStrip(inconsistentVisConfig)) {
      const newConfig = stripMergeDefaultConfig(columns, inconsistentVisConfig);
      _setVisConfig({ current: newConfig, consistent: newConfig });
    }
    if (isPCP(inconsistentVisConfig)) {
      const newConfig = pcpMergeDefaultConfig(columns, inconsistentVisConfig);
      _setVisConfig({ current: newConfig, consistent: newConfig });
    }
    if (isBar(inconsistentVisConfig)) {
      const newConfig = barMergeDefaultConfig(columns, inconsistentVisConfig);
      _setVisConfig({ current: newConfig, consistent: newConfig });
    }
    // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inconsistentVisConfig.type]);

  useEffect(() => {
    if (externalConfig) {
      setVisConfig(externalConfig);
    }
  }, [externalConfig, setVisConfig]);

  // Converting the selected list into a map, since searching through the list to find an item is common in the vis components.
  const selectedMap: { [key: string]: boolean } = useMemo(() => {
    const currMap: { [key: string]: boolean } = {};

    selected.forEach((s) => {
      currMap[s] = true;
    });

    return currMap;
  }, [selected]);

  const scales: Scales = useMemo(() => {
    const colorScale = d3v3.scale.ordinal().range(colors);

    return {
      color: colorScale,
    };
  }, [colors]);

  if (!visConfig) {
    return <div className="tdp-busy" />;
  }

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
          selectedMap={selectedMap}
          selectedList={selected}
          columns={columns}
          scales={scales}
          hideSidebar={hideSidebar}
          showCloseButton={showCloseButton}
          closeButtonCallback={closeCallback}
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
          showCloseButton={showCloseButton}
          closeButtonCallback={closeCallback}
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
          showCloseButton={showCloseButton}
          closeButtonCallback={closeCallback}
        />
      ) : null}

      {isPCP(visConfig) ? (
        <PCPVis
          config={visConfig}
          selected={selectedMap}
          setConfig={setVisConfig}
          columns={columns}
          hideSidebar={hideSidebar}
          showCloseButton={showCloseButton}
          closeButtonCallback={closeCallback}
        />
      ) : null}

      {isBar(visConfig) ? (
        <BarVis
          config={visConfig}
          setConfig={setVisConfig}
          selectionCallback={selectionCallback}
          selectedMap={selectedMap}
          selectedList={selected}
          columns={columns}
          scales={scales}
          hideSidebar={hideSidebar}
          showCloseButton={showCloseButton}
          closeButtonCallback={closeCallback}
        />
      ) : null}
    </>
  );
}
