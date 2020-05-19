/**
 * Created by Holger Stitz on 27.07.2016.
 */

import {areyousure} from 'phovea_ui/src/dialogs';
import {select, Selection, event} from 'd3';
import $ from 'jquery';
import {currentUserNameOrAnonymous, canWrite} from 'phovea_core/src/security';
import CLUEGraphManager from 'phovea_clue/src/CLUEGraphManager';
import {IProvenanceGraphDataDescription, op} from 'phovea_core/src/provenance';
import {KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES} from './constants';
import {errorAlert} from './notifications';
import {
  GLOBAL_EVENT_MANIPULATED, EditProvenanceGraphMenu
} from './utils/EditProvenanceGraphMenu';
import {on as globalOn, off as globalOff} from 'phovea_core/src/event';
import {fromNow} from './utils/utils';
import {successfullyDeleted, successfullySaved} from './notifications';
import i18n from 'phovea_core/src/i18n';

abstract class ASessionList {
  private handler: () => void;

  constructor(private readonly parent: HTMLElement, graphManager: CLUEGraphManager, protected readonly mode: 'table' | 'list' = 'table') {
    this.build(graphManager).then((update) => {
      this.handler = () => update();
      globalOn(GLOBAL_EVENT_MANIPULATED, this.handler);
    });
  }

  destroy() {
    globalOff(GLOBAL_EVENT_MANIPULATED, this.handler);
  }

  protected static createButton(type: 'delete' | 'select' | 'clone' | 'persist' | 'edit') {
    switch (type) {
      case 'delete':
        return `<a href="#" data-action="delete" title="${i18n.t('tdp:core.SessionList.deleteSession')}" ><i class="fa fa-trash" aria-hidden="true"></i><span class="sr-only">${i18n.t('tdp:core.SessionList.delete')}</span></a>`;
      case 'select':
        return `<a href="#" data-action="select" title="${i18n.t('tdp:core.SessionList.continueSession')}"><i class="fa fa-folder-open" aria-hidden="true"></i><span class="sr-only">${i18n.t('tdp:core.SessionList.continue')}</span></a>`;
      case 'clone':
        return `<a href="#" data-action="clone" title="${i18n.t('tdp:core.SessionList.cloneToTemporary')}"><i class="fa fa-clone" aria-hidden="true"></i><span class="sr-only">${i18n.t('tdp:core.SessionList.cloneToTemporary')}</span></a>`;
      case 'persist':
        return `<a href="#" data-action="persist" title="${i18n.t('tdp:core.SessionList.persistSession')}"><i class="fa fa-cloud" aria-hidden="true"></i><span class="sr-only">${i18n.t('tdp:core.SessionList.persistSession')}</span></a>`;
      case 'edit':
        return `<a href="#" data-action="edit" title="${i18n.t('tdp:core.SessionList.editSession')}"><i class="fa fa-edit" aria-hidden="true"></i><span class="sr-only">${i18n.t('tdp:core.SessionList.editSession')}</span></a>`;
    }
  }

  protected registerActionListener(manager: CLUEGraphManager, $enter: Selection<IProvenanceGraphDataDescription>) {
    const stopEvent = () => {
      (<Event>event).preventDefault();
      (<Event>event).stopPropagation();
    };

    $enter.select('a[data-action="delete"]').on('click', async function (d) {
      stopEvent();
      const deleteIt = await areyousure(i18n.t('tdp:core.SessionList.deleteIt', {name: d.name}));
      if (deleteIt) {
        await manager.delete(d);
        successfullyDeleted(i18n.t('tdp:core.SessionList.session'), d.name);
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
      if (canWrite(d)) {
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
      EditProvenanceGraphMenu.editProvenanceGraphMetaData(d, {button: i18n.t('tdp:core.SessionList.edit')}).then((extras) => {
        if (extras !== null) {
          Promise.resolve(manager.editGraphMetaData(d, extras))
            .then((desc) => {
              //update the name
              nameTd.innerText = desc.name;
              successfullySaved(i18n.t('tdp:core.SessionList.session'), desc.name);
              publicI.className = EditProvenanceGraphMenu.isPublic(desc) ? 'fa fa-users' : 'fa fa-user';
              publicI.setAttribute('title', EditProvenanceGraphMenu.isPublic(d) ? i18n.t('tdp:core.SessionList.status') : i18n.t('tdp:core.SessionList.status', {context: 'private'}));
            })
            .catch(errorAlert);
        }
      });
      return false;
    });
    $enter.select('a[data-action="persist"]').on('click', (d) => {
      stopEvent();
      EditProvenanceGraphMenu.persistProvenanceGraphMetaData(d).then((extras: any) => {
        if (extras !== null) {
          manager.importExistingGraph(d, extras, true).catch(errorAlert);
        }
      });
      return false;
    });
  }

  protected createLoader() {
    return select(this.parent).classed('menuTable', true).html(`
      <div class="loading">
        <i class="fa fa-spinner fa-pulse fa-fw"></i>
        <span class="sr-only">${i18n.t('tdp:core.SessionList.loadingText')}</span>
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
    let workspaces = (await manager.list()).filter((d) => !EditProvenanceGraphMenu.isPersistent(d)).sort(byDateDesc);

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
        <th>${i18n.t('tdp:core.SessionList.name')}</th>
        <th>${i18n.t('tdp:core.SessionList.date')}</th>
        <th>${i18n.t('tdp:core.SessionList.actions')}</th>
      </tr>
    </thead>
    <tbody>

    </tbody>
  </table>`;
    const list = ``;

    //replace loading
    const $table = $parent.html(`<p>
     ${i18n.t('tdp:core.SessionList.sessionMessage', {latest: KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES})}
    </p><div>${this.mode === 'table' ? table : list}</div>`);

    const updateTable = (data: IProvenanceGraphDataDescription[]) => {
      const $tr = $table.select('tbody').selectAll('tr').data(data);

      const $trEnter = $tr.enter().append('tr').html(`
          <td></td>
          <td></td>
          <td>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('persist')}${ASessionList.createButton('delete')}</td>`);

      this.registerActionListener(manager, $trEnter);
      $tr.select('td').text((d) => d.name).attr('class', (d) => EditProvenanceGraphMenu.isPublic(d) ? i18n.t('tdp:core.SessionList.status') as string : i18n.t('tdp:core.SessionList.status', {context: 'private'}) as string);
      $tr.select('td:nth-of-type(2)')
        .text((d) => d.ts ? fromNow(d.ts) : i18n.t('tdp:core.SessionList.unknown') as string)
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
      $tr.select('span').text((d) => d.name).attr('class', (d) => EditProvenanceGraphMenu.isPublic(d) ? i18n.t('tdp:core.SessionList.status') as string : i18n.t('tdp:core.SessionList.status', {context: 'private'}) as string);
      $tr.select('span:nth-of-type(2)')
        .text((d) => d.ts ? fromNow(d.ts) : i18n.t('tdp:core.SessionList.unknown') as string)
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
    return (await manager.list()).filter((d) => EditProvenanceGraphMenu.isPersistent(d)).sort(byDateDesc);
  }

  protected async build(manager: CLUEGraphManager) {

    const $parent = this.createLoader();

    //select and sort by date desc
    const workspaces = await this.getData(manager);

    const tableMine = `<table class="table table-striped table-hover table-bordered table-condensed">
                <thead>
                  <tr>
                    <th>${i18n.t('tdp:core.SessionList.name')}</th>
                    <th>${i18n.t('tdp:core.SessionList.access')}</th>
                    <th>${i18n.t('tdp:core.SessionList.date')}</th>
                    <th>${i18n.t('tdp:core.SessionList.actions')}</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>`;
    const tablePublic = `<table class="table table-striped table-hover table-bordered table-condensed">
                <thead>
                  <tr>
                    <th>${i18n.t('tdp:core.SessionList.name')}</th>
                    <th>${i18n.t('tdp:core.SessionList.creator')}</th>
                    <th>${i18n.t('tdp:core.SessionList.date')}</th>
                    <th>${i18n.t('tdp:core.SessionList.actions')}</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>`;

    $parent.html(`<p>
    ${i18n.t('tdp:core.SessionList.paragraphText')}
    </p>
        <ul class="nav nav-tabs" role="tablist">
          <li class="active" role="presentation"><a href="#session_mine" class="active"><i class="fa fa-user"></i> ${i18n.t('tdp:core.SessionList.mySessions')}</a></li>
          <li role="presentation"><a href="#session_others"><i class="fa fa-users"></i> ${i18n.t('tdp:core.SessionList.otherSessions')}</a></li>
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
      const me = currentUserNameOrAnonymous();
      const myworkspaces = data.filter((d) => d.creator === me);
      const otherworkspaces = data.filter((d) => d.creator !== me);

      const publicTitle = i18n.t('tdp:core.SessionList.status');
      const privateTitle = i18n.t('tdp:core.SessionList.status', {context: 'private'});
      const unknownText = i18n.t('tdp:core.SessionList.unknown');

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
            .attr('class', (d) => EditProvenanceGraphMenu.isPublic(d) ? 'fa fa-users' : 'fa fa-user')
            .attr('title', (d) => EditProvenanceGraphMenu.isPublic(d) ? publicTitle : privateTitle);
          $tr.select('td:nth-of-type(3)')
            .text((d) => d.ts ? fromNow(d.ts) : unknownText)
            .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

          $tr.exit().remove();
        }
        {
          const $tr = $parent.select('#session_others tbody').selectAll('tr').data(otherworkspaces);

          const $trEnter = $tr.enter().append('tr').html((d) => {
            let actions = '';
            if(canWrite(d)) {
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
            .attr('class', (d) => EditProvenanceGraphMenu.isPublic(d) ? 'fa fa-users' : 'fa fa-user')
            .attr('title', (d) => EditProvenanceGraphMenu.isPublic(d) ? publicTitle : privateTitle);
          $tr.select('span:nth-of-type(3)')
            .text((d) => d.ts ? fromNow(d.ts) : unknownText)
            .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

          $tr.exit().remove();
        }
        {
          const $tr = $parent.select('#session_others').selectAll('div').data(otherworkspaces);

          const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html((d) => {
            let actions = '';
            if(canWrite(d)) {
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
