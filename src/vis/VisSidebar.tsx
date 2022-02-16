import * as React from 'react';
import { useEffect, useState } from 'react';
import { barMergeDefaultConfig, isBar } from './bar/utils';
import { isScatter, scatterMergeDefaultConfig } from './scatter/utils';
import { CategoricalColumn, NumericalColumn, ESupportedPlotlyVis, IVisConfig, ENumericalColorScaleType } from './interfaces';
import { isViolin, violinMergeDefaultConfig } from './violin/utils';
import { isStrip, stripMergeDefaultConfig } from './strip/utils';
import { isPCP, pcpMergeDefaultConfig } from './pcp/utils';
import { PCPVisSidebar } from './pcp/PCPVisSidebar';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { StripVisSidebar } from './strip/StripVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';

export interface VisSidebarProps {
  /**
   * Required data columns which are displayed.
   */
  columns: (NumericalColumn | CategoricalColumn)[];
  /**
   * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired, either "Filter In", "Filter Out", or "Clear". This logic will be simplified in the future.
   */
  filterCallback?: (s: string) => void;
  externalConfig?: IVisConfig;
  setExternalConfig?: (c: IVisConfig) => void;
  width?: string;
}

export function VisSidebar({ columns, filterCallback = () => null, externalConfig = null, setExternalConfig = null, width = '20rem' }: VisSidebarProps) {
  const [visConfig, setVisConfig] = useState<IVisConfig>(
    externalConfig || {
      type: ESupportedPlotlyVis.SCATTER,
      numColumnsSelected: [],
      color: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      isRectBrush: true,
      alphaSliderVal: 1,
    },
  );

  useEffect(() => {
    setExternalConfig(visConfig);
  }, [visConfig]);

  useEffect(() => {
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
  }, [visConfig.type]);
  return (
    <>
      {isScatter(visConfig) ? (
        <ScatterVisSidebar
          config={visConfig}
          optionsConfig={{
            color: {
              enable: true,
            },
          }}
          setConfig={setVisConfig}
          filterCallback={filterCallback}
          columns={columns}
          width={width}
        />
      ) : null}

      {isViolin(visConfig) ? (
        <ViolinVisSidebar
          config={visConfig}
          optionsConfig={{
            overlay: {
              enable: true,
            },
          }}
          setConfig={setVisConfig}
          columns={columns}
          width={width}
        />
      ) : null}

      {isStrip(visConfig) ? <StripVisSidebar config={visConfig} setConfig={setVisConfig} columns={columns} width={width} /> : null}

      {isPCP(visConfig) ? <PCPVisSidebar config={visConfig} setConfig={setVisConfig} columns={columns} width={width} /> : null}

      {isBar(visConfig) ? <BarVisSidebar config={visConfig} setConfig={setVisConfig} columns={columns} width={width} /> : null}
    </>
  );
}
