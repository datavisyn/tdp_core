import { select, event } from 'd3v3';
import $ from 'jquery';
import { I18nextManager } from 'visyn_core/i18n';
import { GlobalEventHandler } from 'visyn_core/base';
import { UserSession } from 'visyn_core/security';
import { PHOVEA_UI_FormDialog } from '../../components';
import { ErrorAlertHandler } from '../../base/ErrorAlertHandler';
import { TDPApplicationUtils } from '../../utils/TDPApplicationUtils';
import { NotificationHandler } from '../../base/NotificationHandler';
import { ProvenanceGraphMenuUtils } from './ProvenanceGraphMenuUtils';
import { UniqueIdManager } from '../../app';
class ASessionList {
    constructor(parent, graphManager, mode = 'table') {
        this.parent = parent;
        this.mode = mode;
        this.build(graphManager).then((update) => {
            this.handler = () => update();
            GlobalEventHandler.getInstance().on(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED, this.handler);
        });
    }
    destroy() {
        GlobalEventHandler.getInstance().off(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED, this.handler);
    }
    static createButton(type) {
        switch (type) {
            case 'delete':
                return `<a href="#" data-action="delete" data-testid="delete-link" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.deleteSession')}" ><i class="fas fa-trash" aria-hidden="true"></i><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.delete')}</span></a>`;
            case 'select':
                return `<a href="#" data-action="select" data-testid="select-link" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.continueSession')}"><i class="fas fa-folder-open" aria-hidden="true"></i><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.continue')}</span></a>`;
            case 'clone':
                return `<a href="#" data-action="clone" data-testid="clone-link" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.cloneToTemporary')}"><i class="fas fa-clone" aria-hidden="true"></i><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.cloneToTemporary')}</span></a>`;
            case 'persist':
                return `<a href="#" data-action="persist" data-testid="persist-link" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.saveSession')}"><i class="fas fa-cloud" aria-hidden="true"></i><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.saveSession')}</span></a>`;
            case 'edit':
                return `<a href="#" data-action="edit" data-testid="edit-link" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.editSession')}"><i class="fas fa-edit" aria-hidden="true"></i><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.editSession')}</span></a>`;
            default:
                return undefined;
        }
    }
    registerActionListener(manager, $enter) {
        const stopEvent = () => {
            event.preventDefault();
            event.stopPropagation();
        };
        $enter.select('a[data-action="delete"]').on('click', async function (d) {
            stopEvent();
            const deleteIt = await PHOVEA_UI_FormDialog.areyousure(I18nextManager.getInstance().i18n.t('tdp:core.SessionList.deleteIt', { name: d.name }));
            if (deleteIt) {
                await manager.delete(d);
                NotificationHandler.successfullyDeleted(I18nextManager.getInstance().i18n.t('tdp:core.SessionList.session'), d.name);
                const tr = this.parentElement.parentElement;
                tr.remove();
            }
        });
        $enter.select('a[data-action="clone"]').on('click', (d) => {
            stopEvent();
            manager.cloneLocal(d);
            return false;
        });
        $enter.select('a[data-action="select"]').on('click', (d) => {
            stopEvent();
            if (UserSession.getInstance().canWrite(d)) {
                manager.loadGraph(d);
            }
            else {
                manager.cloneLocal(d);
            }
            return false;
        });
        $enter.select('a[data-action="edit"]').on('click', function (d) {
            stopEvent();
            const nameTd = this.parentElement.parentElement.firstElementChild;
            const publicI = this.parentElement.parentElement.children[1].firstElementChild;
            ProvenanceGraphMenuUtils.editProvenanceGraphMetaData(d, { button: I18nextManager.getInstance().i18n.t('tdp:core.SessionList.save') }).then((extras) => {
                if (extras !== null) {
                    Promise.resolve(manager.editGraphMetaData(d, extras))
                        .then((desc) => {
                        // update the name
                        nameTd.innerText = desc.name;
                        NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.SessionList.session'), desc.name);
                        publicI.className = ProvenanceGraphMenuUtils.isPublic(desc) ? 'fas fa-users' : 'fas fa-user';
                        publicI.setAttribute('title', ProvenanceGraphMenuUtils.isPublic(d)
                            ? I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status')
                            : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', { context: 'private' }));
                    })
                        .catch(ErrorAlertHandler.getInstance().errorAlert);
                }
            });
            return false;
        });
        $enter.select('a[data-action="persist"]').on('click', (d) => {
            stopEvent();
            ProvenanceGraphMenuUtils.persistProvenanceGraphMetaData(d).then((extras) => {
                if (extras !== null) {
                    manager.importExistingGraph(d, extras, true).catch(ErrorAlertHandler.getInstance().errorAlert);
                }
            });
            return false;
        });
    }
    createLoader() {
        return select(this.parent).classed('menuTable', true).html(`
      <div class="loading">
        <i class="fas fa-spinner fa-pulse fa-fw"></i>
        <span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.loadingText')}</span>
      </div>`);
    }
}
function byDateDesc(a, b) {
    return -((a.ts || 0) - (b.ts || 0));
}
/**
 * a table ot the temporary sessions within this application
 */
class TemporarySessionList extends ASessionList {
    async getData(manager) {
        let workspaces = (await manager.list()).filter((d) => !ProvenanceGraphMenuUtils.isPersistent(d)).sort(byDateDesc);
        // cleanup up temporary ones
        if (workspaces.length > TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES) {
            const toDelete = workspaces.slice(TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
            workspaces = workspaces.slice(0, TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
            Promise.all(toDelete.map((d) => manager.delete(d))).catch((error) => {
                console.warn('cannot delete old graphs:', error);
            });
        }
        return workspaces;
    }
    async build(manager) {
        const $parent = this.createLoader();
        // select and sort by date desc
        const workspaces = await this.getData(manager);
        const table = `<table class="table table-striped table-hover table-bordered table-sm">
    <thead>
      <tr>
        <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.name')}</th>
        <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.date')}</th>
        <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.actions')}</th>
      </tr>
    </thead>
    <tbody>

    </tbody>
  </table>`;
        const list = ``;
        // replace loading
        const $table = $parent.html(`<p>
     ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.sessionMessage', { latest: TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES })}
    </p><div>${this.mode === 'table' ? table : list}</div>`);
        const updateTable = (data) => {
            const $tr = $table.select('tbody').selectAll('tr').data(data);
            const $trEnter = $tr.enter().append('tr').html(`
          <td></td>
          <td></td>
          <td>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('persist')}${ASessionList.createButton('delete')}</td>`);
            this.registerActionListener(manager, $trEnter);
            $tr
                .select('td')
                .text((d) => d.name)
                .attr('class', (d) => ProvenanceGraphMenuUtils.isPublic(d)
                ? I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status')
                : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', { context: 'private' }));
            $tr.select('td:nth-of-type(3)').attr('data-testid', (d) => d.id);
            $tr
                .select('td:nth-of-type(2)')
                .text((d) => (d.ts ? TDPApplicationUtils.fromNow(d.ts) : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.unknown')))
                .attr('title', (d) => (d.ts ? new Date(d.ts).toUTCString() : null));
            $tr.exit().remove();
        };
        const updateList = (data) => {
            const $tr = $table.select('div').selectAll('div').data(data);
            const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html(`
          <span></span>
          <span></span>
          <span>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('persist')}${ASessionList.createButton('delete')}</span>`);
            this.registerActionListener(manager, $trEnter);
            $tr
                .select('span')
                .text((d) => d.name)
                .attr('class', (d) => ProvenanceGraphMenuUtils.isPublic(d)
                ? I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status')
                : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', { context: 'private' }));
            $tr
                .select('span:nth-of-type(2)')
                .text((d) => (d.ts ? TDPApplicationUtils.fromNow(d.ts) : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.unknown')))
                .attr('title', (d) => (d.ts ? new Date(d.ts).toUTCString() : null));
            $tr.exit().remove();
        };
        const update = this.mode === 'table' ? updateTable : updateList;
        update.call(this, workspaces);
        return () => this.getData(manager).then(update.bind(this));
    }
}
TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES = 10;
export { TemporarySessionList };
/**
 * a table ot the persistent sessions within this application
 */
export class PersistentSessionList extends ASessionList {
    async getData(manager) {
        return (await manager.list()).filter((d) => ProvenanceGraphMenuUtils.isPersistent(d)).sort(byDateDesc);
    }
    async build(manager) {
        const uniqueId = UniqueIdManager.getInstance().uniqueId();
        const mySessionsTabId = `session_mine_${uniqueId}`;
        const otherSessionsTabId = `session_others_${uniqueId}`;
        const $parent = this.createLoader();
        // select and sort by date desc
        const workspaces = await this.getData(manager);
        const tableMine = `<table class="table table-striped table-hover table-bordered table-sm">
                <thead>
                  <tr>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.name')}</th>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.access')}</th>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.date')}</th>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.actions')}</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>`;
        const tablePublic = `<table class="table table-striped table-hover table-bordered table-sm">
                <thead>
                  <tr>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.name')}</th>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.creator')}</th>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.date')}</th>
                    <th>${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.actions')}</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>`;
        $parent.html(`<p>
    ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.paragraphText')}
    </p>
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item active"><a href="#${mySessionsTabId}" class="nav-link active" role="tab"><i class="fas fa-user"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.mySessions')}</a></li>
          <li class="nav-item"><a href="#${otherSessionsTabId}" class="nav-link" role="tab"><i class="fas fa-users"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.otherSessions')}</a></li>
        </ul>
        <div class="tab-content pt-1">
            <div id="${mySessionsTabId}" class="tab-pane show active" role="tabpanel">
                ${this.mode === 'table' ? tableMine : ''}
            </div>
            <div id="${otherSessionsTabId}" class="tab-pane" role="tabpanel">
                ${this.mode === 'table' ? tablePublic : ''}
            </div>
       </div>`);
        $parent.selectAll('ul.nav-tabs a').on('click', function () {
            event.preventDefault();
            // avoid Property 'tab' does not exist on type 'JQuery<any>'
            // @ts-ignore
            $(this).tab('show');
        });
        const update = (data) => {
            const me = UserSession.getInstance().currentUserNameOrAnonymous();
            const myworkspaces = data.filter((d) => d.creator === me);
            const otherworkspaces = data.filter((d) => d.creator !== me);
            const publicTitle = I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status');
            const privateTitle = I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', { context: 'private' });
            const unknownText = I18nextManager.getInstance().i18n.t('tdp:core.SessionList.unknown');
            if (this.mode === 'table') {
                {
                    const $tr = $parent.select(`#${mySessionsTabId} tbody`).selectAll('tr').data(myworkspaces);
                    const $trEnter = $tr.enter().append('tr').html(`
            <td></td>
            <td class="text-center"><i class="fa"></i></td>
            <td></td>
            <td>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('edit')}${ASessionList.createButton('delete')}</td>`);
                    this.registerActionListener(manager, $trEnter);
                    $tr.select('td').text((d) => d.name);
                    $tr
                        .select('td:nth-of-type(2) i')
                        .attr('class', (d) => (ProvenanceGraphMenuUtils.isPublic(d) ? 'fas fa-users' : 'fas fa-user'))
                        .attr('title', (d) => (ProvenanceGraphMenuUtils.isPublic(d) ? publicTitle : privateTitle));
                    $tr
                        .select('td:nth-of-type(3)')
                        .text((d) => (d.ts ? TDPApplicationUtils.fromNow(d.ts) : unknownText))
                        .attr('title', (d) => (d.ts ? new Date(d.ts).toUTCString() : null));
                    $tr.exit().remove();
                }
                {
                    const $tr = $parent.select(`#${otherSessionsTabId} tbody`).selectAll('tr').data(otherworkspaces);
                    const $trEnter = $tr
                        .enter()
                        .append('tr')
                        .html((d) => {
                        let actions = '';
                        if (UserSession.getInstance().canWrite(d)) {
                            actions += ASessionList.createButton('select');
                        }
                        actions += ASessionList.createButton('clone');
                        return `
            <td></td>
            <td></td>
            <td></td>
            <td>${actions}</td>`;
                    });
                    this.registerActionListener(manager, $trEnter);
                    $tr.select('td').text((d) => d.name);
                    $tr.select('td:nth-of-type(2)').text((d) => d.creator);
                    $tr.select('td:nth-of-type(3)').text((d) => (d.ts ? new Date(d.ts).toUTCString() : 'Unknown'));
                    $tr.exit().remove();
                }
            }
            else {
                {
                    const $tr = $parent.select('#session_mine').selectAll('div').data(myworkspaces);
                    const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html(`
            <span></span>
            <span><i class="fa"></i></span>
            <span></span>
            <span>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('edit')}${ASessionList.createButton('delete')}</span>`);
                    this.registerActionListener(manager, $trEnter);
                    $tr.select('span').text((d) => d.name);
                    $tr
                        .select('span:nth-of-type(2) i')
                        .attr('class', (d) => (ProvenanceGraphMenuUtils.isPublic(d) ? 'fas fa-users' : 'fas fa-user'))
                        .attr('title', (d) => (ProvenanceGraphMenuUtils.isPublic(d) ? publicTitle : privateTitle));
                    $tr
                        .select('span:nth-of-type(3)')
                        .text((d) => (d.ts ? TDPApplicationUtils.fromNow(d.ts) : unknownText))
                        .attr('title', (d) => (d.ts ? new Date(d.ts).toUTCString() : null));
                    $tr.exit().remove();
                }
                {
                    const $tr = $parent.select(`#${otherSessionsTabId}`).selectAll('div').data(otherworkspaces);
                    const $trEnter = $tr
                        .enter()
                        .append('div')
                        .classed('sessionEntry', true)
                        .html((d) => {
                        let actions = '';
                        if (UserSession.getInstance().canWrite(d)) {
                            actions += ASessionList.createButton('select');
                        }
                        actions += ASessionList.createButton('clone');
                        return `
              <span></span>
              <span></span>
              <span></span>
              <span>${actions}</span>`;
                    });
                    this.registerActionListener(manager, $trEnter);
                    $tr.select('span').text((d) => d.name);
                    $tr.select('span:nth-of-type(2)').text((d) => d.creator);
                    $tr.select('span:nth-of-type(3)').text((d) => (d.ts ? new Date(d.ts).toUTCString() : unknownText));
                    $tr.exit().remove();
                }
            }
        };
        update(workspaces);
        return () => this.getData(manager).then(update);
    }
}
//# sourceMappingURL=SessionList.js.map