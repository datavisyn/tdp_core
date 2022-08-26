import * as React from 'react';
import { useAsync } from '../hooks';
import { initializeLibrary } from '../initialize';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { Vis } from '../vis/Vis';
const irisData = fetchIrisData();
export function MainApp() {
    const { status } = useAsync(initializeLibrary, []);
    return React.createElement("div", { style: { width: '100vw', height: '100vh', overflow: 'auto' } }, status === 'success' ? React.createElement(Vis, { columns: irisData }) : null);
}
//# sourceMappingURL=MainApp.js.map