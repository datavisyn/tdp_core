import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { VisynAppProvider } from 'visyn_core/app';
import { MainApp } from './MainApp';
// create a new instance of the app
ReactDOM.render(React.createElement(VisynAppProvider, { appName: "Demo App" },
    React.createElement(MainApp, null)), document.getElementById('main'));
//# sourceMappingURL=index.initialize.js.map