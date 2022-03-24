// Gets into the phovea.ts
import * as React from 'react';
import { useEffect } from 'react';
import Select from 'react-select';
export function ProxyView({ parameters, onParametersChanged, desc }) {
    useEffect(() => {
        if (!parameters) {
            onParametersChanged({ currentId: '' });
        }
    });
    return React.createElement("iframe", { className: "w-100 h-100", src: desc.url });
}
// Toolbar ?
export function ProxyViewHeader({ selection, onParametersChanged }) {
    const options = selection.map((s) => {
        return { value: s, label: s };
    });
    return (React.createElement("div", { style: { width: '200px' } },
        React.createElement(Select, { options: options, onChange: (e) => {
                onParametersChanged({ currentId: e.value });
            } })));
}
export const create = () => {
    return {
        viewType: 'simple',
        defaultParameters: {
            currentId: '',
        },
        view: ProxyView,
        tab: null,
        header: ProxyViewHeader,
    };
};
//# sourceMappingURL=VisynProxyView.js.map