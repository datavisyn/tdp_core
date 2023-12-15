import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { VisynAppProvider } from 'visyn_core/app';
import { MainApp } from './MainApp';

createRoot(document.getElementById('main')).render(
  <VisynAppProvider disableMantine6 appName="Demo App">
    <MainApp />
  </VisynAppProvider>,
);
