import React, { useCallback, useMemo, useState } from 'react';
import { isEqual } from 'lodash';
import type { IRankingProps } from './Ranking';
// eslint-disable-next-line import/no-cycle
import { Ranking } from './Ranking';
import { ISelection } from '../base/interfaces';
import { IContext, ISelectionAdapter } from './selection/ISelectionAdapter';
import { ERenderAuthorizationStatus, IAuthorizationConfiguration } from '../auth/interfaces';
import { TDPTokenManager, TokenManager } from '../auth/TokenManager';
import { I18nextManager } from '../i18n/I18nextManager';
import { AView } from '../views/AView';
import { useAsync } from '../hooks/useAsync';
import { ViewUtils } from '../views/ViewUtils';

/**
 *
 */
export interface IRankingViewComponentProps extends IRankingProps {
  /**
   * Selection of the previous view
   */
  selection?: ISelection;
  parameters: any[];
  selectionAdapter?: ISelectionAdapter;
  authorization?: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null;
}

export function RankingViewComponent({
  data = [],
  selection: inputSelection,
  itemSelection = { idtype: null, ids: [] },
  columnDesc = [],
  parameters = null,
  selectionAdapter = null,
  options = {},
  authorization = null,
  onItemSelect,
  onItemSelectionChanged,
  onCustomizeRanking,
  onBuiltLineUp,
  onUpdateEntryPoint,
  /**
   * Maybe refactor this when using the native lineup implementation of scores
   */
  onAddScoreColumn,
}: IRankingViewComponentProps) {
  const selections = useMemo(() => {
    return new Map<string, ISelection>();
  }, []);

  const [prevParameters, setPrevParameters] = useState<any>(null);

  const [selectionAdapterContext, setSelectionAdapterContext] = React.useState<Omit<IContext, 'selection'>>(null);
  const viewRef = React.useRef<HTMLDivElement | null>(null);

  const runAuthorizations = useCallback(async (): Promise<void> => {
    await TDPTokenManager.runAuthorizations(authorization, {
      render: ({ authConfiguration, status, error, trigger }) => {
        // Fetch or create the authorization overlay
        let overlay = viewRef.current.querySelector<HTMLDivElement>('.tdp-authorization-overlay');
        if (!overlay) {
          overlay = viewRef.current.ownerDocument.createElement('div');
          overlay.className = 'tdp-authorization-overlay';
          // Add element at the very bottom to avoid using z-index
          viewRef.current.appendChild(overlay);
        }

        if (status === ERenderAuthorizationStatus.SUCCESS) {
          overlay.remove();
        } else {
          overlay.innerHTML = `
                    ${
                      error
                        ? `<div class="alert alert-info" role="alert">${I18nextManager.getInstance().i18n.t(
                            'tdp:core.views.authorizationFailed',
                          )} ${error.toString()}</div>`
                        : ''
                    }
                      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                          <p class="lead">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationRequired', { name: authConfiguration.name })}</p>
                          <button class="btn btn-primary" ${status === 'pending' ? `disabled` : ''}>${
            status === 'pending'
              ? I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButtonLoading')
              : I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButton')
          }</button>
                      </div>`;

          overlay.querySelector('button').onclick = async () => {
            trigger();
          };
        }
      },
    });
  }, [authorization]);

  React.useEffect(() => {
    // set input and item selections
    selections.set(AView.DEFAULT_SELECTION_NAME, inputSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = useCallback(async () => {
    TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_REMOVED, async () => {
      // If a authorization is removed, rerun the registered authorizations
      await runAuthorizations();
    });

    // First, run all required authorizations
    await runAuthorizations();

    // Register listener after the authorizations are run to avoid double-initializations
    TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_STORED, async (_, id, token) => {
      // TODO: Enabling this leads to the taggle view being loaded twice
      // await this.initImpl();
    });
  }, [runAuthorizations]);
  const { status } = useAsync(init, []);

  const onContextChangedCallback = useCallback((newContext: Omit<IContext, 'selection'>) => {
    setSelectionAdapterContext(newContext);
  }, []);

  /**
   * onInputSelectionChanged
   */
  React.useEffect(() => {
    if (status === 'success') {
      const name = AView.DEFAULT_SELECTION_NAME;
      const current = selections.get(name);
      if (current && ViewUtils.isSameSelection(current, inputSelection)) {
        return;
      }
      selections.set(name, inputSelection);
      if (name === AView.DEFAULT_SELECTION_NAME) {
        if (selectionAdapter) {
          selectionAdapter.selectionChanged({ ...selectionAdapterContext, selection: inputSelection }, onContextChangedCallback);
        }
      }
    }
  }, [status, inputSelection, selectionAdapterContext, selections, selectionAdapter, onContextChangedCallback]);

  /**
   * onParametersChanged
   */
  React.useEffect(() => {
    if (isEqual(parameters, prevParameters)) {
      return;
    }

    if (status === 'success') {
      if (selectionAdapter) {
        selectionAdapter.parameterChanged({ ...selectionAdapterContext, selection: inputSelection }, onContextChangedCallback);
        setPrevParameters(parameters);
      }
    }
  }, [status, selectionAdapter, selectionAdapterContext, inputSelection, selections, parameters, prevParameters, onContextChangedCallback]);

  return (
    <div ref={viewRef} className={`h-100 ${status !== 'success' && 'tdp-busy'}`}>
      <Ranking
        data={data}
        columnDesc={columnDesc}
        itemSelection={itemSelection}
        options={options}
        onItemSelect={onItemSelect}
        onContextChanged={onContextChangedCallback}
        onAddScoreColumn={onAddScoreColumn}
        onBuiltLineUp={onBuiltLineUp}
        onItemSelectionChanged={onItemSelectionChanged}
        onCustomizeRanking={onCustomizeRanking}
        onUpdateEntryPoint={onUpdateEntryPoint}
      />
    </div>
  );
}
