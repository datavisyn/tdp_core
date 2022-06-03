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

export function VisSidebar({ columns, filterCallback = () => null, config = null, setConfig = null, className, style }: ICommonVisSideBarProps<IVisConfig>) {
  if (!config) {
    return null;
  }

  return (
    <>
      {isSankey(config) ? <SankeyVisSidebar config={config} setConfig={setConfig} className={className} style={style} columns={columns} /> : null}

      {isScatter(config) ? (
        <ScatterVisSidebar
          config={config}
          optionsConfig={{
            color: {
              enable: true,
            },
          }}
          setConfig={setConfig}
          filterCallback={filterCallback}
          columns={columns}
          className={className}
          style={style}
        />
      ) : null}

      {isViolin(config) ? (
        <ViolinVisSidebar
          config={config}
          optionsConfig={{
            overlay: {
              enable: true,
            },
          }}
          setConfig={setConfig}
          columns={columns}
          className={className}
          style={style}
        />
      ) : null}

      {isStrip(config) ? <StripVisSidebar config={config} setConfig={setConfig} columns={columns} className={className} style={style} /> : null}

      {isBar(config) ? <BarVisSidebar config={config} setConfig={setConfig} columns={columns} className={className} style={style} /> : null}
    </>
  );
}
