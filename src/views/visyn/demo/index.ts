import * as React from 'react';
import { IVisynViewPluginDefinition } from '../interfaces';

export function createLazyVisynDemoView(): IVisynViewPluginDefinition {
  return {
    viewType: 'simple',
    defaultParameters: {
      columns: null,
      dataLength: 100,
    },
    view: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoView }))),
    header: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoViewHeader }))),
    tab: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoViewSidebar }))),
  };
}
