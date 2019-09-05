/**
 * Created by Samuel Gratzl on 28.02.2017.
 */

import ProvenanceGraph from 'phovea_core/src/provenance/ProvenanceGraph';
import CLUEGraphManager from 'phovea_clue/src/CLUEGraphManager';
import {PropertyHandler} from 'phovea_core/src';
import {showErrorModalDialog, lazyDialogModule} from '../dialogs';
import {IProvenanceGraphDataDescription} from 'phovea_core/src/provenance';
import {mixin, randomId} from 'phovea_core/src';
import {ALL_READ_NONE, ALL_READ_READ, EEntity, hasPermission, ISecureItem} from 'phovea_core/src/security';
import {IEvent, fire as globalFire} from 'phovea_core/src/event';
import {DEFAULT_SUCCESS_AUTO_HIDE, pushNotification} from '../notifications';
import {TemporarySessionList, PersistentSessionList} from '../SessionList';
import {permissionForm} from './utils';

declare const __DEBUG__;
export const GLOBAL_EVENT_MANIPULATED = 'provenanceGraphMenuManipulated';

export default class EditProvenanceGraphMenu {
  readonly node: HTMLLIElement;
  private graph: ProvenanceGraph = null;

  constructor(private readonly manager: CLUEGraphManager, parent: HTMLElement) {
    this.node = this.init(parent);
    parent.insertBefore(this.node, parent.firstChild);
  }

  updateGraphMetaData(graph: ProvenanceGraph) {
    this.node.querySelector('span.session-name').innerHTML = graph.desc.name;
    const syncIcon = this.node.querySelector('.sync-indicator');
    const persisted = isPersistent(graph.desc);
    const persistAction = (<HTMLLinkElement>this.node.querySelector('a[data-action="persist"]').parentElement);
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
    const manager = this.manager;
    //add provenance graph management menu entry
    const li = parent.ownerDocument.createElement('li');
    li.classList.add('dropdown');

    li.innerHTML = `
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
             aria-expanded="false"><i class="fa fa-folder-open-o" aria-hidden="true"></i> <i class="fa fa-save sync-indicator" aria-hidden="true"></i> <span>Analysis Session Management</span></a>
          <ul class="dropdown-menu">
            <li class="dropdown-label"><i class="fa fa-clock-o" aria-hidden="true"></i> <span class="session-name">No Name</span></li>
            <li class="divider"></li>
            <li><a href="#" data-action="edit" title="Edit Details"><i class="fa fa-edit" aria-hidden="true"></i> Edit Details</a></li>
            <li><a href="#" data-action="clone" title="Clone to Temporary Session"><i class="fa fa-clone" aria-hidden="true"></i> Clone to Temporary Session</a></li>
            <li class="divider"></li>
            <li><a href="#" data-action="open" title="Open Session"><i class="fa fa-folder-open-o" aria-hidden="true"></i> Open Existing Session</a></li>
            <li><a href="#" data-action="persist" title="Save Session"><i class="fa fa-save" aria-hidden="true"></i> Save Session</a></li>
            <li><a href="#" data-action="delete" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a></li>
            <li class="divider"></li>
            <li><a href="#" data-action="import" title="Import Graph"><i class="fa fa-upload" aria-hidden="true"></i> Import Session</a></li>
            <li><a href="#" data-action="export" title="Export Graph"><i class="fa fa-download" aria-hidden="true"></i> Export Session</a></li>
          </ul>`;

    (<HTMLLinkElement>li.querySelector('a[data-action="edit"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph) {
        return false;
      }
      editProvenanceGraphMetaData(this.graph.desc, {permission: isPersistent(this.graph.desc)}).then((extras) => {
        if (extras !== null) {
          Promise.resolve(manager.editGraphMetaData(this.graph.desc, extras))
            .then((desc) => {
              //update the name
              this.node.querySelector('a span').innerHTML = desc.name;
              globalFire(GLOBAL_EVENT_MANIPULATED);
            })
            .catch(showErrorModalDialog);
        }
      });
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

      lazyDialogModule()
        .then(({generateDialog}) => {
          const dialog = generateDialog('Open Session', 'Open');
          dialog.body.classList.add('tdp-session-dialog');
          dialog.body.innerHTML = `<div role="tab" data-menu="dashboards">
            <div role="tab" class="collapsed">
            <h4>Temporary Sessions</h4>
            <div role="tabpanel" data-session="t">
            </div>
          </div>
          <div role="tab" class="collapsed">
            <h4>Persistent Sessions</h4>
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
        });
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="persist"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.graph || isPersistent(this.graph.desc)) {
        return false;
      }
      persistProvenanceGraphMetaData(this.graph.desc).then((extras: any) => {
        if (extras !== null) {
          Promise.resolve(manager.migrateGraph(this.graph, extras)).catch(showErrorModalDialog).then(() => {
            this.updateGraphMetaData(this.graph);
            const p = new PropertyHandler(location.hash);
            const hash = new Map<string, string>();
            p.forEach((key, value) => {
              hash.set(key, `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            });
            hash.set('clue_graph', `clue_graph=${encodeURIComponent(this.graph.desc.id)}`);
            hash.set('clue_state', `clue_state=${this.graph.act.id}`);
            const url = `${location.href.replace(location.hash, '')}#${Array.from(hash.values()).join('&')}`;
            pushNotification('success', `Session "${this.graph.desc.name}" successfully persisted.
            <br>URL to share: <br>
            <a href="${url}" title="Current persistent session link">${url}</a>`, -1);
            globalFire(GLOBAL_EVENT_MANIPULATED);
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
      lazyDialogModule()
        .then(({areyousure}) => areyousure(`Are you sure to delete session: "${this.graph.desc.name}"`))
        .then((deleteIt) => {
          if (deleteIt) {
            Promise.resolve(this.manager.delete(this.graph.desc)).then((r) => {
              this.manager.startFromScratch();
            }).catch(showErrorModalDialog);
          }
        });
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="export"]')).addEventListener('click', (event) => {
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
      const blob = new Blob([str], {type: 'application/json;charset=utf-8'});
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
        pushNotification('success', `Session "${this.graph.desc.name}" successfully exported`, DEFAULT_SUCCESS_AUTO_HIDE);
      };
      a.readAsDataURL(blob);
      return false;
    });

    (<HTMLLinkElement>li.querySelector('a[data-action="import"]')).addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      //import dialog
      lazyDialogModule().then(({generateDialog}) => {
        const d = generateDialog('Select File', 'Upload');
        d.body.innerHTML = `<input type="file" placeholder="Select File to Upoad">`;
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
    });

    return li;
  }
}

export function isPersistent(d: IProvenanceGraphDataDescription) {
  return d.local === false || d.local === undefined;
}

export function persistProvenanceGraphMetaData(d: IProvenanceGraphDataDescription) {
  const name = d.name.startsWith('Temporary') ? `Persistent ${d.name.slice(10)}` : d.name;
  return editProvenanceGraphMetaData(d, {
    title: '<i class="fa fa-cloud"></i> Persist Session',
    button: '<i class="fa fa-cloud"></i> Persist',
    name
  });
}

export function isPublic(d: ISecureItem) {
  return hasPermission(d, EEntity.OTHERS);
}

export function editProvenanceGraphMetaData(d: IProvenanceGraphDataDescription, args: { button?: string, title?: string, permission?: boolean, name?: string } = {}) {
  args = mixin({
    button: 'Edit',
    title: '<i class="fa fa-edit" aria-hidden="true"></i> Edit Session Details',
    permission: true,
    name: d.name
  }, args);
  return lazyDialogModule().then(({FormDialog}) => {
    const dialog = new FormDialog(args.title, args.button);
    const prefix = 'd' + randomId();
    const permissions = permissionForm(d, {
      extra: `<div class="help-block">
      Please ensure when publishing a session that associated datasets (i.e. uploaded datasets) are also public.
    </div>`
    });
    dialog.form.innerHTML = `
        <div class="form-group">
          <label for="${prefix}_name">Name</label>
          <input type="text" class="form-control" id="${prefix}_name" value="${args.name}" required="required">
        </div>
        <div class="form-group">
          <label for="${prefix}_desc">Description</label>
          <textarea class="form-control" id="${prefix}_desc" rows="3">${d.description || ''}</textarea>
        </div>
        <div class="checkbox">
          <label class="radio-inline">
            <input type="checkbox" name="${prefix}_agree" required="required">
            I agree that the current session will be stored on the application server in form of a provenance graph. Please note that you can delete sessions as part of the <strong>'Open Existing Session'</strong> dialog.
          </label>
        </div>
    `;
    dialog.form.lastElementChild!.insertAdjacentElement('beforebegin', permissions.node);
    return new Promise((resolve) => {
      dialog.onHide(() => {
        resolve(null);
      });
      dialog.onSubmit(() => {
        const extras = Object.assign({
          name: (<HTMLInputElement>dialog.body.querySelector(`#${prefix}_name`)).value,
          description: (<HTMLTextAreaElement>dialog.body.querySelector(`#${prefix}_desc`)).value,
        }, args.permission ? permissions.resolve(new FormData(dialog.form)) : d.permissions);
        resolve(extras);
        dialog.hide();
        return false;
      });
      dialog.show();
    });
  });
}
