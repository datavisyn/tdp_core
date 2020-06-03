/**
 * Created by Samuel Gratzl on 28.02.2017.
 */
import { PropertyHandler, GlobalEventHandler, I18nextManager } from 'phovea_core';
import { NotificationHandler } from '../base/NotificationHandler';
import { ErrorAlertHandler } from '../base/ErrorAlertHandler';
import { TemporarySessionList, PersistentSessionList } from './SessionList';
import { ProvenanceGraphMenuUtils } from './ProvenanceGraphMenuUtils';
export class EditProvenanceGraphMenu {
    constructor(manager, parent) {
        this.manager = manager;
        this.graph = null;
        this.node = this.init(parent);
        parent.insertBefore(this.node, parent.firstChild);
    }
    updateGraphMetaData(graph) {
        this.node.querySelector('span.session-name').innerHTML = graph.desc.name;
        const syncIcon = this.node.querySelector('.sync-indicator');
        const persisted = ProvenanceGraphMenuUtils.isPersistent(graph.desc);
        const persistAction = this.node.querySelector('a[data-action="persist"]').parentElement;
        if (persisted) {
            syncIcon.classList.remove('fa-clock-o');
            syncIcon.classList.add('fa-cloud');
            persistAction.classList.add('disabled');
        }
        else {
            syncIcon.classList.add('fa-clock-o');
            syncIcon.classList.remove('fa-cloud');
            persistAction.classList.remove('disabled');
        }
    }
    setGraph(graph) {
        this.updateGraphMetaData(graph);
        const syncIcon = this.node.querySelector('.sync-indicator');
        graph.on('sync_start,sync', (event) => {
            const should = event.type !== 'sync';
            const has = syncIcon.classList.contains('active');
            if (should !== has) {
                if (should) {
                    syncIcon.classList.add('active');
                }
                else {
                    syncIcon.classList.remove('active');
                }
            }
        });
        this.graph = graph;
    }
    init(parent) {
        const manager = this.manager;
        //add provenance graph management menu entry
        const li = parent.ownerDocument.createElement('li');
        li.classList.add('dropdown');
        li.innerHTML = `
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
             aria-expanded="false"><i class="fa fa-folder-open-o" aria-hidden="true"></i> <i class="fa fa-save sync-indicator" aria-hidden="true"></i> <span>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.sessionHeader')}</span></a>
          <ul class="dropdown-menu">
            <li class="dropdown-label"><i class="fa fa-clock-o" aria-hidden="true"></i> <span class="session-name">${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.sessionName')}</span></li>
            <li class="divider"></li>
            <li><a href="#" data-action="edit" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.editDetails')}"><i class="fa fa-edit" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.editDetails')}</a></li>
            <li><a href="#" data-action="clone" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.cloneTemporary')}"><i class="fa fa-clone" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.cloneTemporary')}</a></li>
            <li class="divider"></li>
            <li><a href="#" data-action="open" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openSession')}"><i class="fa fa-folder-open-o" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openExisting')}</a></li>
            <li><a href="#" data-action="persist" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.saveSession')}"><i class="fa fa-save" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.saveSession')}</a></li>
            <li><a href="#" data-action="delete" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.delete')}"><i class="fa fa-trash" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.delete')}</a></li>
            <li class="divider"></li>
            <li><a href="#" data-action="import" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.importGraph')}"><i class="fa fa-upload" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.importSession')}</a></li>
            <li><a href="#" data-action="export" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.exportGraph')}"><i class="fa fa-download" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.exportSession')}</a></li>
          </ul>`;
        li.querySelector('a[data-action="edit"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.graph) {
                return false;
            }
            ProvenanceGraphMenuUtils.editProvenanceGraphMetaData(this.graph.desc, { permission: ProvenanceGraphMenuUtils.isPersistent(this.graph.desc) }).then((extras) => {
                if (extras !== null) {
                    Promise.resolve(manager.editGraphMetaData(this.graph.desc, extras))
                        .then((desc) => {
                        //update the name
                        this.node.querySelector('a span').innerHTML = desc.name;
                        GlobalEventHandler.getInstance().fire(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED);
                    })
                        .catch(ErrorAlertHandler.getInstance().errorAlert);
                }
            });
            return false;
        });
        li.querySelector('a[data-action="clone"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.graph) {
                return false;
            }
            this.manager.cloneLocal(this.graph.desc);
            return false;
        });
        li.querySelector('a[data-action="open"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            import('phovea_ui/src/components/dialogs').then(({ Dialog }) => {
                const dialog = Dialog.generateDialog(I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openSession'), I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.open'));
                dialog.body.classList.add('tdp-session-dialog');
                dialog.body.innerHTML = `<div role="tab" data-menu="dashboards">
            <div role="tab" class="collapsed">
            <h4>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.temporarySessions')}</h4>
            <div role="tabpanel" data-session="t">
            </div>
          </div>
          <div role="tab" class="collapsed">
            <h4>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.persistentSessions')}</h4>
            <div role="tabpanel" data-session="p">
            </div>
          </div>`;
                const t = new TemporarySessionList(dialog.body.querySelector('div[data-session=t]'), manager);
                const p = new PersistentSessionList(dialog.body.querySelector('div[data-session=p]'), manager);
                dialog.hideOnSubmit();
                dialog.onHide(() => {
                    t.destroy();
                    p.destroy();
                });
                dialog.show();
            });
            return false;
        });
        li.querySelector('a[data-action="persist"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.graph || ProvenanceGraphMenuUtils.isPersistent(this.graph.desc)) {
                return false;
            }
            ProvenanceGraphMenuUtils.persistProvenanceGraphMetaData(this.graph.desc).then((extras) => {
                if (extras !== null) {
                    Promise.resolve(manager.migrateGraph(this.graph, extras)).catch(ErrorAlertHandler.getInstance().errorAlert).then(() => {
                        this.updateGraphMetaData(this.graph);
                        const p = new PropertyHandler(location.hash);
                        const hash = new Map();
                        p.forEach((key, value) => {
                            hash.set(key, `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                        });
                        hash.set('clue_graph', `clue_graph=${encodeURIComponent(this.graph.desc.id)}`);
                        hash.set('clue_state', `clue_state=${this.graph.act.id}`);
                        const url = `${location.href.replace(location.hash, '')}#${Array.from(hash.values()).join('&')}`;
                        NotificationHandler.pushNotification('success', `${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.successNotification', { name: this.graph.desc.name })}
            <br>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.urlToShare')} <br>
            <a href="${url}" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.currentLink')}">${url}</a>`, -1);
                        GlobalEventHandler.getInstance().fire(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED);
                    });
                }
            });
            return false;
        });
        li.querySelector('a[data-action="delete"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.graph) {
                return false;
            }
            import('phovea_ui/src/components/dialogs')
                .then(({ FormDialog }) => FormDialog.areyousure(I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.areYouSure', { name: this.graph.desc.name })))
                .then((deleteIt) => {
                if (deleteIt) {
                    Promise.resolve(this.manager.delete(this.graph.desc)).then((r) => {
                        this.manager.startFromScratch();
                    }).catch(ErrorAlertHandler.getInstance().errorAlert);
                }
            });
            return false;
        });
        li.querySelector('a[data-action="export"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.graph) {
                return false;
            }
            console.log(this.graph);
            const r = this.graph.persist();
            console.log(r);
            const str = JSON.stringify(r, null, '\t');
            //create blob and save it
            const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
            const a = new FileReader();
            a.onload = (e) => {
                const url = e.target.result;
                const helper = parent.ownerDocument.createElement('a');
                helper.setAttribute('href', url);
                helper.setAttribute('target', '_blank');
                helper.setAttribute('download', `${this.graph.desc.name}.json`);
                li.appendChild(helper);
                helper.click();
                helper.remove();
                NotificationHandler.pushNotification('success', I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.successMessage', { name: this.graph.desc.name }), NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE);
            };
            a.readAsDataURL(blob);
            return false;
        });
        li.querySelector('a[data-action="import"]').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            //import dialog
            import('phovea_ui/src/components/dialogs').then(({ Dialog }) => {
                const d = Dialog.generateDialog(I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.selectFile'), I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.upload'));
                d.body.innerHTML = `<input type="file" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.fileToUpload')}">`;
                d.body.querySelector('input').addEventListener('change', function (evt) {
                    const file = evt.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const dataS = e.target.result;
                        const dump = JSON.parse(dataS);
                        manager.importGraph(dump);
                    };
                    // Read in the image file as a data URL.
                    reader.readAsText(file);
                });
                d.show();
            });
        });
        return li;
    }
}
//# sourceMappingURL=EditProvenanceGraphMenu.js.map