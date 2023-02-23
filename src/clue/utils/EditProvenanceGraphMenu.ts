import { I18nextManager } from 'visyn_core';
import { IEvent, GlobalEventHandler } from 'visyn_core';
import { NotificationHandler } from '../../base/NotificationHandler';
import { ErrorAlertHandler } from '../../base/ErrorAlertHandler';
import { TemporarySessionList, PersistentSessionList } from './SessionList';
import { ProvenanceGraphMenuUtils } from './ProvenanceGraphMenuUtils';
import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { ProvenanceGraph } from '../provenance';
import { Dialog, PHOVEA_UI_FormDialog } from '../../components';

export class EditProvenanceGraphMenu {
  readonly node: HTMLLIElement;

  private graph: ProvenanceGraph = null;

  constructor(private readonly manager: CLUEGraphManager, parent: HTMLElement) {
    this.node = this.init(parent);
    parent.insertBefore(this.node, parent.firstChild);
  }

  updateGraphMetaData(graph: ProvenanceGraph) {
    this.node.querySelector('span.session-name').innerHTML = graph.desc.name;
    const syncIcon = this.node.querySelector('.sync-indicator');
    const persisted = ProvenanceGraphMenuUtils.isPersistent(graph.desc);
    const persistAction = <HTMLLinkElement>this.node.querySelector('a[data-action="persist"]').parentElement;
    if (persisted) {
      syncIcon.classList.remove('fa-clock-o');
      syncIcon.classList.add('fa-cloud');
      persistAction.classList.add('disabled');
    } else {
      syncIcon.classList.add('fa-clock-o');
      syncIcon.classList.remove('fa-cloud');
      persistAction.classList.remove('disabled');
    }
  }

  setGraph(graph: ProvenanceGraph) {
    this.updateGraphMetaData(graph);
    const syncIcon = this.node.querySelector('.sync-indicator');
    graph.on('sync_start,sync', (event: IEvent) => {
      const should = event.type !== 'sync';
      const has = syncIcon.classList.contains('active');
      if (should !== has) {
        if (should) {
          syncIcon.classList.add('active');
        } else {
          syncIcon.classList.remove('active');
        }
      }
    });

    this.graph = graph;
  }

  private init(parent: HTMLElement) {
    const { manager } = this;
    // add provenance graph management menu entry
    const li = parent.ownerDocument.createElement('li');
    li.classList.add('nav-item', 'dropdown');

    li.innerHTML = `
          <a href="#" class="nav-link dropdown-toggle" id="sessionDropdown" data-testid="session-dropdown-link" data-bs-toggle="dropdown" role="button" aria-haspopup="true"
             aria-expanded="false"><i class="fas fa-folder-open" aria-hidden="true"></i> <i class="fas fa-save sync-indicator" aria-hidden="true"></i> <span>${I18nextManager.getInstance().i18n.t(
               'tdp:core.EditProvenanceMenu.sessionHeader',
             )}</span></a>
          <div class="dropdown-menu" aria-labelledby="sessionDropdown" data-bs-popper="none">
            <div class="dropdown-label"><i class="fas fa-clock" aria-hidden="true"></i> <span class="session-name">${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.sessionName',
            )}</span></div>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" data-testid="edit-details-link" data-action="edit" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.editDetails',
            )}"><i class="fas fa-edit" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.editDetails')}</a>
            <a class="dropdown-item" href="#" data-testid="clone-session-link" data-action="clone" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.cloneTemporary',
            )}"><i class="fas fa-clone" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.cloneTemporary')}</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" data-testid="open-session-link" data-action="open" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.openSession',
            )}"><i class="fas fa-folder-open" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openExisting')}</a>
            <a class="dropdown-item" href="#" data-testid="save-session-link" data-action="persist" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.saveSession',
            )}"><i class="fas fa-save" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.saveSession')}</a>
            <a class="dropdown-item" href="#" data-testid="delete-link" data-action="delete" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.delete',
            )}"><i class="fas fa-trash" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.delete')}</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" data-testid="import-session-link" data-action="import" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.importGraph',
            )}"><i class="fas fa-upload" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.importSession')}</a>
            <a class="dropdown-item" href="#" data-testid="export-session-link" data-action="export" title="${I18nextManager.getInstance().i18n.t(
              'tdp:core.EditProvenanceMenu.exportGraph',
            )}"><i class="fas fa-download" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.exportSession')}</a>
          </div>`;

    (<HTMLLinkElement>li.querySelector('a[data-action="edit"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph) {
        return false;
      }
      ProvenanceGraphMenuUtils.editProvenanceGraphMetaData(this.graph.desc, { permission: ProvenanceGraphMenuUtils.isPersistent(this.graph.desc) }).then(
        (extras) => {
          if (extras !== null) {
            Promise.resolve(manager.editGraphMetaData(this.graph.desc, extras))
              .then((desc) => {
                // update the name
                this.node.querySelector('a span').innerHTML = desc.name;
                GlobalEventHandler.getInstance().fire(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED);
              })
              .catch(ErrorAlertHandler.getInstance().errorAlert);
          }
        },
      );
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="clone"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph) {
        return false;
      }
      this.manager.cloneLocal(this.graph.desc);
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="open"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const dialog = Dialog.generateDialog(I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openSession'));
      dialog.body.classList.add('tdp-session-dialog');
      dialog.body.innerHTML = `<div role="tab" data-menu="dashboards">
          <div role="tab" class="collapsed">
          <h4>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.temporarySessions')}</h4>
          <div role="tabpanel" data-session="t">
          </div>
        </div>
        <div role="tab" class="collapsed">
          <h4>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.savedSessions')}</h4>
          <div role="tabpanel" data-session="p">
          </div>
        </div>`;
      const t = new TemporarySessionList(<HTMLElement>dialog.body.querySelector('div[data-session=t]'), manager);
      const p = new PersistentSessionList(<HTMLElement>dialog.body.querySelector('div[data-session=p]'), manager);
      dialog.hideOnSubmit();
      dialog.onHide(() => {
        t.destroy();
        p.destroy();
      });
      dialog.show();
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="persist"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph || ProvenanceGraphMenuUtils.isPersistent(this.graph.desc)) {
        return false;
      }
      ProvenanceGraphMenuUtils.persistProvenanceGraphMetaData(this.graph.desc).then((extras: any) => {
        if (extras !== null) {
          Promise.resolve(manager.migrateGraph(this.graph, extras))
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .then(() => {
              this.updateGraphMetaData(this.graph);

              const url = manager.getCLUEGraphURL();

              NotificationHandler.pushNotification(
                'success',
                `${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.successNotification', { name: this.graph.desc.name })}
            <br>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.urlToShare')} <br>
            <a href="${url}" title="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.currentLink')}">${url}</a>`,
                -1,
              );
              GlobalEventHandler.getInstance().fire(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED);
            });
        }
      });
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="delete"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph) {
        return false;
      }
      PHOVEA_UI_FormDialog.areyousure(I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.areYouSure', { name: this.graph.desc.name })).then(
        (deleteIt) => {
          if (deleteIt) {
            Promise.resolve(this.manager.delete(this.graph.desc))
              .then((r) => {
                this.manager.startFromScratch();
              })
              .catch(ErrorAlertHandler.getInstance().errorAlert);
          }
        },
      );
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="export"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph) {
        return false;
      }

      const r = this.graph.persist();

      const str = JSON.stringify(r, null, '\t');
      // create blob and save it
      const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
      const a = new FileReader();
      a.onload = (e) => {
        const url = (<any>e.target).result;
        const helper = parent.ownerDocument.createElement('a');
        helper.setAttribute('href', url);
        helper.setAttribute('target', '_blank');
        helper.setAttribute('download', `${this.graph.desc.name}.json`);
        li.appendChild(helper);
        helper.click();
        helper.remove();
        NotificationHandler.pushNotification(
          'success',
          I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.successMessage', { name: this.graph.desc.name }),
          NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE,
        );
      };
      a.readAsDataURL(blob);
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="import"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      // import dialog
      const d = Dialog.generateDialog(
        I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.selectFile'),
        I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.upload'),
      );
      d.body.innerHTML = `<input type="file" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.fileToUpload')}">`;
      (<HTMLInputElement>d.body.querySelector('input')).addEventListener('change', function (evt) {
        const file = (<HTMLInputElement>evt.target).files[0];
        const reader = new FileReader();
        reader.onload = function (e: any) {
          const dataS = e.target.result;
          const dump = JSON.parse(dataS);
          manager.importGraph(dump);
        };
        // Read in the image file as a data URL.
        reader.readAsText(file);
      });
      d.show();
    });

    return li;
  }
}
