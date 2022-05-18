// Gets into the phovea.ts
import * as React from 'react';
import { useRef, useState } from 'react';

export interface IProxyViewProps {
  /**
   * Site that you want to view
   */
  site: string;
}

/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. Shows a loading icon while the website is loading.
 */

export function ProxyViewComponent({ site }: IProxyViewProps) {
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
  }, [loadingFrame, site]);

  return (
    <div className={`w-100 h-100 ${websiteLoading ? 'tdp-busy' : ''}`}>
      <iframe ref={loadingFrame} className="w-100 h-100" src={site} />
    </div>
  );
}
