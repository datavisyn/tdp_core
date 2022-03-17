/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useCallback, useRef } from 'react';
import { Ranking } from './Ranking';
import { ERenderAuthorizationStatus } from '../auth/interfaces';
import { TDPTokenManager, TokenManager } from '../auth/TokenManager';
import { I18nextManager } from '../i18n/I18nextManager';
import { AView } from '../views/AView';
import { useAsync } from '../hooks/useAsync';
import { ViewUtils } from '../views/ViewUtils';
export function RankingViewComponent({ data = [], selection: inputSelection, itemSelection = { idtype: null, ids: [] }, columnDesc = [], parameters = false, selectionAdapter = null, options = {}, authorization = null, onItemSelect, onItemSelectionChanged, onCustomizeRanking, onBuiltLineUp, onUpdateEntryPoint, 
/**
 * Maybe refactor this when using the native lineup implementation of scores
 */
onAddScoreColumn, }) {
    const isMounted = useRef(false);
    const selections = new Map();
    const [context, setContext] = React.useState(null);
    const viewRef = React.useRef(null);
    const runAuthorizations = useCallback(async () => {
        await TDPTokenManager.runAuthorizations(authorization, {
            render: ({ authConfiguration, status, error, trigger }) => {
                // Fetch or create the authorization overlay
                let overlay = viewRef.current.querySelector('.tdp-authorization-overlay');
                if (!overlay) {
                    overlay = viewRef.current.ownerDocument.createElement('div');
                    overlay.className = 'tdp-authorization-overlay';
                    // Add element at the very bottom to avoid using z-index
                    viewRef.current.appendChild(overlay);
                }
                if (status === ERenderAuthorizationStatus.SUCCESS) {
                    overlay.remove();
                }
                else {
                    overlay.innerHTML = `
                    ${error
                        ? `<div class="alert alert-info" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationFailed')} ${error.toString()}</div>`
                        : ''}
                      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                          <p class="lead">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationRequired', { name: authConfiguration.name })}</p>
                          <button class="btn btn-primary" ${status === 'pending' ? `disabled` : ''}>${status === 'pending'
                        ? I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButtonLoading')
                        : I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButton')}</button>
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
                    selectionAdapter.selectionChanged(null, () => context);
                }
            }
        }
    }, [status, inputSelection, context]);
    /**
     * onParametersChanged
     */
    React.useEffect(() => {
        // ignore first time parameter are passed since there is no change
        if (status === 'success' && parameters && isMounted.current) {
            if (selectionAdapter) {
                selectionAdapter.parameterChanged(null, () => context);
            }
        }
        isMounted.current = true;
    }, [status, parameters, context]);
    return (React.createElement("div", { ref: viewRef, className: `tdp-view lineup lu-taggle lu ${status !== 'success' && 'tdp-busy'}` },
        React.createElement(Ranking, { data: data, columnDesc: columnDesc, itemSelection: itemSelection, options: options, onItemSelect: onItemSelect, onContextChanged: (context) => setContext({ ...context, selection: inputSelection }), onAddScoreColumn: onAddScoreColumn, onBuiltLineUp: onBuiltLineUp, onItemSelectionChanged: onItemSelectionChanged, onCustomizeRanking: onCustomizeRanking, onUpdateEntryPoint: onUpdateEntryPoint })));
}
//# sourceMappingURL=RankingViewComponent.js.map