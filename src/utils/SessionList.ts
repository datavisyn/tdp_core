/**
 * Created by Holger Stitz on 27.07.2016.
 */

import {FormDialog} from 'phovea_ui';
import {select, Selection, event} from 'd3';
import $ from 'jquery';
import {UserSession, IProvenanceGraphDataDescription, EventHandler, I18nextManager} from 'phovea_core';
import {CLUEGraphManager} from 'phovea_clue';
import {KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES} from '../base/constants';
import {ErrorAlertHandler} from '../base/ErrorAlertHandler';
import {fromNow} from './utils';
import {NotificationHandler} from '../base/NotificationHandler';
import {ProvenanceGraphMenuUtils} from './ProvenanceGraphMenuUtils';


abstract class ASessionList {
  private handler: () => void;

  constructor(private readonly parent: HTMLElement, graphManager: CLUEGraphManager, protected readonly mode: 'table' | 'list' = 'table') {
    this.build(graphManager).then((update) => {
      this.handler = () => update();
      EventHandler.getInstance().on(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED, this.handler);
    });
  }

  destroy() {
    EventHandler.getInstance().off(ProvenanceGraphMenuUtils.GLOBAL_EVENT_MANIPULATED, this.handler);
  }

  protected static createButton(type: 'delete' | 'select' | 'clone' | 'persist' | 'edit') {
    switch (type) {
      case 'delete':
        return `<a href="#" data-action="delete" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.deleteSession')}" ><i class="fa fa-trash" aria-hidden="true"></i><span class="sr-only">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.delete')}</span></a>`;
      case 'select':
        return `<a href="#" data-action="select" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.continueSession')}"><i class="fa fa-folder-open" aria-hidden="true"></i><span class="sr-only">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.continue')}</span></a>`;
      case 'clone':
        return `<a href="#" data-action="clone" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.cloneToTemporary')}"><i class="fa fa-clone" aria-hidden="true"></i><span class="sr-only">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.cloneToTemporary')}</span></a>`;
      case 'persist':
        return `<a href="#" data-action="persist" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.persistSession')}"><i class="fa fa-cloud" aria-hidden="true"></i><span class="sr-only">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.persistSession')}</span></a>`;
      case 'edit':
        return `<a href="#" data-action="edit" title="${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.editSession')}"><i class="fa fa-edit" aria-hidden="true"></i><span class="sr-only">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.editSession')}</span></a>`;
    }
  }

  protected registerActionListener(manager: CLUEGraphManager, $enter: Selection<IProvenanceGraphDataDescription>) {
    const stopEvent = () => {
      (<Event>event).preventDefault();
      (<Event>event).stopPropagation();
    };

    $enter.select('a[data-action="delete"]').on('click', async function (d) {
      stopEvent();
      const deleteIt = await FormDialog.areyousure(I18nextManager.getInstance().i18n.t('tdp:core.SessionList.deleteIt', {name: d.name}));
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
      } else {
        manager.cloneLocal(d);
      }
      return false;
    });
    $enter.select('a[data-action="edit"]').on('click', function (this: HTMLButtonElement, d) {
      stopEvent();
      const nameTd = <HTMLElement>this.parentElement.parentElement.firstElementChild;
      const publicI = <HTMLElement>this.parentElement.parentElement.children[1].firstElementChild;
      ProvenanceGraphMenuUtils.editProvenanceGraphMetaData(d, {button: I18nextManager.getInstance().i18n.t('tdp:core.SessionList.edit')}).then((extras) => {
        if (extras !== null) {
          Promise.resolve(manager.editGraphMetaData(d, extras))
            .then((desc) => {
              //update the name
              nameTd.innerText = desc.name;
              NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.SessionList.session'), desc.name);
              publicI.className = ProvenanceGraphMenuUtils.isPublic(desc) ? 'fa fa-users' : 'fa fa-user';
              publicI.setAttribute('title', ProvenanceGraphMenuUtils.isPublic(d) ? I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status') : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', {context: 'private'}));
            })
            .catch(ErrorAlertHandler.getInstance().errorAlert);
        }
      });
      return false;
    });
    $enter.select('a[data-action="persist"]').on('click', (d) => {
      stopEvent();
      ProvenanceGraphMenuUtils.persistProvenanceGraphMetaData(d).then((extras: any) => {
        if (extras !== null) {
          manager.importExistingGraph(d, extras, true).catch(ErrorAlertHandler.getInstance().errorAlert);
        }
      });
      return false;
    });
  }

  protected createLoader() {
    return select(this.parent).classed('menuTable', true).html(`
      <div class="loading">
        <i class="fa fa-spinner fa-pulse fa-fw"></i>
        <span class="sr-only">${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.loadingText')}</span>
      </div>`);
  }

  protected abstract async build(manager: CLUEGraphManager): Promise<() => any>;
}

function byDateDesc(a: any, b: any) {
  return -((a.ts || 0) - (b.ts || 0));
}

/**
 * a table ot the temporary sessions within this application
 */
export class TemporarySessionList extends ASessionList {

  protected async getData(manager: CLUEGraphManager) {
    let workspaces = (await manager.list()).filter((d) => !ProvenanceGraphMenuUtils.isPersistent(d)).sort(byDateDesc);

    // cleanup up temporary ones
    if (workspaces.length > KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES) {
      const toDelete = workspaces.slice(KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
      workspaces = workspaces.slice(0, KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
      Promise.all(toDelete.map((d) => manager.delete(d))).catch((error) => {
        console.warn('cannot delete old graphs:', error);
      });
    }
    return workspaces;
  }

  protected async build(manager: CLUEGraphManager) {

    const $parent = this.createLoader();

    //select and sort by date desc
    const workspaces = await this.getData(manager);

    const table = `<table class="table table-striped table-hover table-bordered table-condensed">
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

    //replace loading
    const $table = $parent.html(`<p>
     ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.sessionMessage', {latest: KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES})}
    </p><div>${this.mode === 'table' ? table : list}</div>`);

    const updateTable = (data: IProvenanceGraphDataDescription[]) => {
      const $tr = $table.select('tbody').selectAll('tr').data(data);

      const $trEnter = $tr.enter().append('tr').html(`
          <td></td>
          <td></td>
          <td>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('persist')}${ASessionList.createButton('delete')}</td>`);

      this.registerActionListener(manager, $trEnter);
      $tr.select('td').text((d) => d.name).attr('class', (d) => ProvenanceGraphMenuUtils.isPublic(d) ? I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status') as string : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', {context: 'private'}) as string);
      $tr.select('td:nth-of-type(2)')
        .text((d) => d.ts ? fromNow(d.ts) : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.unknown') as string)
        .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

      $tr.exit().remove();
    };

    const updateList = (data: IProvenanceGraphDataDescription[]) => {
      const $tr = $table.select('div').selectAll('div').data(data);

      const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html(`
          <span></span>
          <span></span>
          <span>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('persist')}${ASessionList.createButton('delete')}</span>`);

      this.registerActionListener(manager, $trEnter);
      $tr.select('span').text((d) => d.name).attr('class', (d) => ProvenanceGraphMenuUtils.isPublic(d) ? I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status') as string : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', {context: 'private'}) as string);
      $tr.select('span:nth-of-type(2)')
        .text((d) => d.ts ? fromNow(d.ts) : I18nextManager.getInstance().i18n.t('tdp:core.SessionList.unknown') as string)
        .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

      $tr.exit().remove();
    };
    const update = this.mode === 'table' ? updateTable : updateList;
    update.call(this, workspaces);

    return () => this.getData(manager).then(update.bind(this));
  }
}


/**
 * a table ot the persistent sessions within this application
 */
export class PersistentSessionList extends ASessionList {

  protected async getData(manager: CLUEGraphManager) {
    return (await manager.list()).filter((d) => ProvenanceGraphMenuUtils.isPersistent(d)).sort(byDateDesc);
  }

  protected async build(manager: CLUEGraphManager) {

    const $parent = this.createLoader();

    //select and sort by date desc
    const workspaces = await this.getData(manager);

    const tableMine = `<table class="table table-striped table-hover table-bordered table-condensed">
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
    const tablePublic = `<table class="table table-striped table-hover table-bordered table-condensed">
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
          <li class="active" role="presentation"><a href="#session_mine" class="active"><i class="fa fa-user"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.mySessions')}</a></li>
          <li role="presentation"><a href="#session_others"><i class="fa fa-users"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.SessionList.otherSessions')}</a></li>
        </ul>
        <div class="tab-content">
            <div id="session_mine" class="tab-pane active">
                ${this.mode === 'table' ? tableMine : ''}
            </div>
            <div id="session_others" class="tab-pane">
                ${this.mode === 'table' ? tablePublic : ''}
            </div>
       </div>`);

    $parent.selectAll('ul.nav-tabs a').on('click', function () {
      (<Event>event).preventDefault();
      $(this).tab('show');
    });

    const update = (data: IProvenanceGraphDataDescription[]) => {
      const me = UserSession.getInstance().currentUserNameOrAnonymous();
      const myworkspaces = data.filter((d) => d.creator === me);
      const otherworkspaces = data.filter((d) => d.creator !== me);

      const publicTitle = I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status');
      const privateTitle = I18nextManager.getInstance().i18n.t('tdp:core.SessionList.status', {context: 'private'});
      const unknownText = I18nextManager.getInstance().i18n.t('tdp:core.SessionList.unknown');

      if (this.mode === 'table') {
        {
          const $tr = $parent.select('#session_mine tbody').selectAll('tr').data(myworkspaces);

          const $trEnter = $tr.enter().append('tr').html(`
            <td></td>
            <td class="text-center"><i class="fa"></i></td>
            <td></td>
            <td>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('edit')}${ASessionList.createButton('delete')}</td>`);

          this.registerActionListener(manager, $trEnter);
          $tr.select('td').text((d) => d.name);
          $tr.select('td:nth-of-type(2) i')
            .attr('class', (d) => ProvenanceGraphMenuUtils.isPublic(d) ? 'fa fa-users' : 'fa fa-user')
            .attr('title', (d) => ProvenanceGraphMenuUtils.isPublic(d) ? publicTitle : privateTitle);
          $tr.select('td:nth-of-type(3)')
            .text((d) => d.ts ? fromNow(d.ts) : unknownText)
            .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

          $tr.exit().remove();
        }
        {
          const $tr = $parent.select('#session_others tbody').selectAll('tr').data(otherworkspaces);

          const $trEnter = $tr.enter().append('tr').html((d) => {
            let actions = '';
            if(UserSession.getInstance().canWrite(d)) {
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
          $tr.select('td:nth-of-type(3)').text((d) => d.ts ? new Date(d.ts).toUTCString() : 'Unknown');

          $tr.exit().remove();
        }
      } else {
        {
          const $tr = $parent.select('#session_mine').selectAll('div').data(myworkspaces);

          const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html(`
            <span></span>
            <span><i class="fa"></i></span>
            <span></span>
            <span>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('edit')}${ASessionList.createButton('delete')}</span>`);

          this.registerActionListener(manager, $trEnter);
          $tr.select('span').text((d) => d.name);
          $tr.select('span:nth-of-type(2) i')
            .attr('class', (d) => ProvenanceGraphMenuUtils.isPublic(d) ? 'fa fa-users' : 'fa fa-user')
            .attr('title', (d) => ProvenanceGraphMenuUtils.isPublic(d) ? publicTitle : privateTitle);
          $tr.select('span:nth-of-type(3)')
            .text((d) => d.ts ? fromNow(d.ts) : unknownText)
            .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

          $tr.exit().remove();
        }
        {
          const $tr = $parent.select('#session_others').selectAll('div').data(otherworkspaces);

          const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html((d) => {
            let actions = '';
            if(UserSession.getInstance().canWrite(d)) {
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
          $tr.select('span:nth-of-type(3)').text((d) => d.ts ? new Date(d.ts).toUTCString() : unknownText);

          $tr.exit().remove();
        }
      }
    };

    update(workspaces);

    return () => this.getData(manager).then(update);
  }
}
