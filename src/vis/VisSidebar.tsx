import * as React from 'react';
import { isBar } from './bar/utils';
import { isScatter } from './scatter/utils';
import { IVisConfig, ICommonVisSideBarProps } from './interfaces';
import { isViolin } from './violin/utils';
import { isStrip } from './strip/utils';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { StripVisSidebar } from './strip/StripVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { isSankey } from './sankey';
import { SankeyVisSidebar } from './sankey/SankeyVisSidebar';

export function VisSidebar({
  columns,
  filterCallback = () => null,
  externalConfig = null,
  setExternalConfig = null,
  className,
  style,
}: { externalConfig: any; setExternalConfig: any } & ICommonVisSideBarProps<IVisConfig>) {
  if (!externalConfig) {
    return null;
  }

  return (
    <>
      {isSankey(externalConfig) ? (
        <SankeyVisSidebar config={externalConfig} setConfig={setExternalConfig} className={className} style={style} columns={columns} />
      ) : null}

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

      {isBar(externalConfig) ? (
        <BarVisSidebar config={externalConfig} setConfig={setExternalConfig} columns={columns} className={className} style={style} />
      ) : null}
    </>
  );
}
