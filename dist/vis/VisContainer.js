import React from 'react';
export function VisContainer({ visualization, sidebar }) {
    return (React.createElement("div", { style: { minHeight: '0px', display: 'flex', flexDirection: 'row', width: '100%', height: '100%' } },
        React.createElement("div", { style: {
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
            } },
            visualization,
            sidebar)));
}
//# sourceMappingURL=VisContainer.js.map