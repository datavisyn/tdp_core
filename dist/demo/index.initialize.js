import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { VisynAppProvider } from 'visyn_core';
import { MainApp } from './MainApp';
createRoot(document.getElementById('main')).render(React.createElement(VisynAppProvider, { appName: "Demo App" },
    React.createElement(MainApp, null)));
//# sourceMappingURL=index.initialize.js.map