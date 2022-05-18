// Gets into the phovea.ts
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { I18nextManager } from '../../../i18n/I18nextManager';

export interface IProxyViewProps {
  /**
   * Selection of the previous view
   */
  site: string;
  argument: string;
  currentId: string;
}

/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. See {link} for an example.
 */

export function ProxyViewComponent({ site, argument, currentId }: IProxyViewProps) {
  const editedSite = useMemo(() => {
    return site.replace(`\${${argument}}`, currentId);
  }, [argument, site, currentId]);

  const loadingFrame = useRef<HTMLIFrameElement>(null);
  const [websiteLoading, setWebsiteLoading] = useState<boolean>(true);

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

    return () => currentNode?.removeEventListener('load', listener);
  }, [loadingFrame, site, argument, currentId]);

  return currentId ? (
    <div className={`w-100 h-100 ${websiteLoading ? 'tdp-busy' : ''}`}>
      <iframe ref={loadingFrame} className="w-100 h-100" src={editedSite} />
    </div>
  ) : (
    // This error message is really just here for developers. currentId being null should be caught before this component is rendered in a production application.
    <div className="d-flex justify-content-center align-items-center  w-100 h-100">
      <div className="flex-grow-1 text-center emptyViewText">{I18nextManager.getInstance().i18n.t('tdp:core.views.emptyProxyView')}</div>
    </div>
  );
}
