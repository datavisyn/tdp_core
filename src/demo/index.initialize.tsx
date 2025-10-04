import * as React from 'react';

import { createRoot } from 'react-dom/client';
import { VisynAppProvider } from 'visyn_pro/app';

import { MainApp } from './MainApp';

createRoot(document.getElementById('main')).render(
  <VisynAppProvider appName="Demo App">
    <MainApp />
  </VisynAppProvider>,
);
