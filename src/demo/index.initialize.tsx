import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { VisynAppProvider } from 'visyn_core/app';
import { MainApp } from './MainApp';

// create a new instance of the app
ReactDOM.render(
  <VisynAppProvider appName="Demo App">
    <MainApp />
  </VisynAppProvider>,
  document.getElementById('main'),
);
