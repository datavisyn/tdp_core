import * as React from 'react';
import { useAsync } from 'visyn_core';
import { IInstanceViewExtensionDesc, IInstanceViewExtension, IInstantView, ISelection } from '../base';
import { ViewUtils } from '../views';

const loadInstantView = (view: IInstanceViewExtensionDesc, selection: ISelection) =>
  view.load().then((r: IInstanceViewExtension) => r.factory(selection, { document }));

/**
 * Component rendering a navigation of all registered Instant-Views for the given selection idtype.
 */
export function InstantViewWrapper({
  selection,
  style,
}: {
  /**
   * Current selection passed to the InstantView.
   */
  selection: ISelection;
  /**
   * Optional style for the root element.
   */
  style?: React.CSSProperties;
}) {
  const { value: views } = useAsync(
    selection?.idtype ? ViewUtils.findInstantViews : () => [] as IInstanceViewExtensionDesc[],
    selection?.idtype ? [selection.idtype] : undefined,
  );
  const [activeView, setActiveView] = React.useState<IInstanceViewExtensionDesc | null>(null);

  const hasViewAndSelection = activeView && selection;
  const { value: activeViewNode, status } = useAsync(
    hasViewAndSelection ? loadInstantView : () => null as IInstantView,
    hasViewAndSelection ? [activeView, selection] : undefined,
  );
  const viewWrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (viewWrapperRef.current) {
      // After the view is loaded, clear the existing content and add the new view node.
      viewWrapperRef.current.innerHTML = '';
      if (activeViewNode) {
        viewWrapperRef.current.appendChild(activeViewNode.node);
      }
    }
  }, [activeViewNode]);

  React.useEffect(() => {
    // Preselect the first one if possible
    setActiveView(views?.[0]);
  }, [views]);

  return views && views.length > 0 ? (
    <section className="tdp-instant-views m-1 p-1 position-relative overflow-auto d-flex flex-column" hidden={!views || views.length === 0} style={style}>
      <ul className="nav nav-tabs mb-1" role="tablist" hidden={views.length === 1}>
        {views.map((view) => (
          <li key={view.id} className="nav-item">
            <button
              type="button"
              className={`nav-link ${view.id === activeView?.id ? 'active' : ''}`}
              role="tab"
              onClick={(e) => {
                e.preventDefault();
                setActiveView(view);
              }}
            >
              {view.name}
            </button>
          </li>
        ))}
      </ul>
      <div className={`tab-content ${status === 'pending' ? 'tdp-busy' : ''}`} ref={viewWrapperRef} />
    </section>
  ) : null;
}
