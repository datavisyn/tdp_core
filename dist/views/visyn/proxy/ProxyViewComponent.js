// Gets into the phovea.ts
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { I18nextManager } from '../../../i18n/I18nextManager';
/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. See {link} for an example.
 */
export function ProxyViewComponent({ site, argument, currentId }) {
    const editedSite = useMemo(() => {
        return site.replace(`\${${argument}}`, currentId);
    }, [argument, site, currentId]);
    const loadingFrame = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    React.useEffect(() => {
        const listener = () => {
            setIsLoading(false);
        };
        const currentNode = loadingFrame.current;
        if (currentNode) {
            setIsLoading(true);
            currentNode.addEventListener('load', listener);
            currentNode.addEventListener('loadstart', listener);
        }
        return () => currentNode === null || currentNode === void 0 ? void 0 : currentNode.removeEventListener('load', listener);
    }, [loadingFrame, site, argument, currentId]);
    return currentId ? (React.createElement("div", { className: `w-100 h-100 ${isLoading ? 'tdp-busy' : ''}` },
        React.createElement("iframe", { ref: loadingFrame, className: "w-100 h-100", src: editedSite }))) : (React.createElement("div", { className: "d-flex justify-content-center align-items-center  w-100 h-100" },
        React.createElement("div", { className: "flex-grow-1 text-center emptyViewText" }, I18nextManager.getInstance().i18n.t('tdp:core.views.emptyProxyView'))));
}
//# sourceMappingURL=ProxyViewComponent.js.map