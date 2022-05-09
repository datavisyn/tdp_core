import * as React from 'react';
import { isBar } from './bar/utils';
import { isScatter } from './scatter/utils';
import { IVisConfig, VisColumn, ICommonVisSideBarProps } from './interfaces';
import { isViolin } from './violin/utils';
import { isStrip } from './strip/utils';
import { isPCP } from './pcp/utils';
import { PCPVisSidebar } from './pcp/PCPVisSidebar';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { StripVisSidebar } from './strip/StripVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { isHeat } from './heat';
import { HeatVisSidebar } from './heat/HeatVisSidebar';

export type VisSidebarProps = {
  /**
   * Required data columns which are displayed.
   */
  columns: VisColumn[];
  /**
   * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired, either "Filter In", "Filter Out", or "Clear". This logic will be simplified in the future.
   */
  filterCallback?: (s: string) => void;
  externalConfig: IVisConfig;
  setExternalConfig: (c: IVisConfig) => void;
} & ICommonVisSideBarProps;

export function VisSidebar({ columns, filterCallback = () => null, externalConfig = null, setExternalConfig = null, className, style }: VisSidebarProps) {
  if (!externalConfig) {
    return null;
  }

  return (
    <>
      {isScatter(externalConfig) ? (
        <ScatterVisSidebar
          config={externalConfig}
          optionsConfig={{
            color: {
              enable: true,
            },
          }}
          setConfig={setExternalConfig}
          filterCallback={filterCallback}
          columns={columns}
          className={className}
          style={style}
        />
      ) : null}

      {isHeat(externalConfig) ? (
        <HeatVisSidebar
          config={externalConfig}
          optionsConfig={{
            color: {
              enable: true,
            },
          }}
          setConfig={setExternalConfig}
          filterCallback={filterCallback}
          columns={columns}
          className={className}
          style={style}
        />
      ) : null}

      {isViolin(externalConfig) ? (
        <ViolinVisSidebar
          config={externalConfig}
          optionsConfig={{
            overlay: {
              enable: true,
            },
          }}
          setConfig={setExternalConfig}
          columns={columns}
          className={className}
          style={style}
        />
      ) : null}

      {isStrip(externalConfig) ? (
        <StripVisSidebar config={externalConfig} setConfig={setExternalConfig} columns={columns} className={className} style={style} />
      ) : null}

      {isPCP(externalConfig) ? (
        <PCPVisSidebar config={externalConfig} setConfig={setExternalConfig} columns={columns} className={className} style={style} />
      ) : null}

      {isBar(externalConfig) ? (
        <BarVisSidebar config={externalConfig} setConfig={setExternalConfig} columns={columns} className={className} style={style} />
      ) : null}
    </>
  );
}
