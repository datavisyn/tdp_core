import * as React from 'react';
import { DemoVisynViewPluginType } from './interfaces';

export function createLazyVisynDemoView(): DemoVisynViewPluginType['definition'] {
  return {
    viewType: 'simple',
    defaultParameters: {
      columns: null,
      config: null,
      dataLength: 100,
    },
    view: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoView }))),
    header: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoViewHeader }))),
    tab: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoViewSidebar }))),
  };
}
