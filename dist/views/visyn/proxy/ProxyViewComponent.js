// Gets into the phovea.ts
import * as React from 'react';
import { useRef, useState } from 'react';
/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. Shows a loading icon while the website is loading.
 */
export function ProxyViewComponent({ site }) {
    const loadingFrame = useRef(null);
    const [websiteLoading, setWebsiteLoading] = useState(true);
    React.useEffect(() => {
        const listener = () => {
            setWebsiteLoading(false);
        };
        const currentNode = loadingFrame.current;
        if (currentNode) {
            setWebsiteLoading(true);
            currentNode.addEventListener('load', listener);
            currentNode.addEventListener('loadstart', listener);
        }
        return () => currentNode === null || currentNode === void 0 ? void 0 : currentNode.removeEventListener('load', listener);
    }, [loadingFrame, site]);
    return (React.createElement("div", { className: `w-100 h-100 ${websiteLoading ? 'tdp-busy' : ''}` },
        React.createElement("iframe", { ref: loadingFrame, className: "w-100 h-100", src: site })));
}
//# sourceMappingURL=ProxyViewComponent.js.map