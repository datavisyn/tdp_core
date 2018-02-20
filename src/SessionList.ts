/**
 * Created by Holger Stitz on 27.07.2016.
 */

import {areyousure} from 'phovea_ui/src/dialogs';
import {select, Selection, event} from 'd3';
import * as $ from 'jquery';
import {currentUserNameOrAnonymous, canWrite} from 'phovea_core/src/security';
import CLUEGraphManager from 'phovea_clue/src/CLUEGraphManager';
import {IProvenanceGraphDataDescription, op} from 'phovea_core/src/provenance';
import {KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES} from './constants';
import {showErrorModalDialog} from './dialogs';
import {
  GLOBAL_EVENT_MANIPULATED,
  editProvenanceGraphMetaData, isPersistent, isPublic,
  persistProvenanceGraphMetaData
} from './internal/EditProvenanceGraphMenu';
import {on as globalOn, off as globalOff} from 'phovea_core/src/event';
import {fromNow} from './internal/utils';
import {successfullyDeleted, successfullySaved} from './notifications';

export {isPublic} from './internal/EditProvenanceGraphMenu';

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
        return `<a href="#" data-action="delete" title="Delete Session" ><i class="fa fa-trash" aria-hidden="true"></i><span class="sr-only">Delete</span></a>`;
      case 'select':
        return `<a href="#" data-action="select" title="Continue Session"><i class="fa fa-folder-open" aria-hidden="true"></i><span class="sr-only">Continue</span></a>`;
      case 'clone':
        return `<a href="#" data-action="clone" title="Clone to Temporary Session"><i class="fa fa-clone" aria-hidden="true"></i><span class="sr-only">Clone to Temporary Session</span></a>`;
      case 'persist':
        return `<a href="#" data-action="persist" title="Persist Session"><i class="fa fa-cloud" aria-hidden="true"></i><span class="sr-only">Persist Session</span></a>`;
      case 'edit':
        return `<a href="#" data-action="edit" title="Edit Session Details"><i class="fa fa-edit" aria-hidden="true"></i><span class="sr-only">Edit Session Details</span></a>`;
    }
  }

  protected registerActionListener(manager: CLUEGraphManager, $enter: Selection<IProvenanceGraphDataDescription>) {
    const stopEvent = () => {
      (<Event>event).preventDefault();
      (<Event>event).stopPropagation();
    };

    $enter.select('a[data-action="delete"]').on('click', async function (d) {
      stopEvent();
      const deleteIt = await areyousure(`Are you sure to delete session: "${d.name}"`);
      if (deleteIt) {
        await manager.delete(d);
        successfullyDeleted('Session', d.name);
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
      if (!canWrite(d)) {
        manager.cloneLocal(d);
      } else {
        manager.loadGraph(d);
      }
      return false;
    });
    $enter.select('a[data-action="edit"]').on('click', function (this: HTMLButtonElement, d) {
      stopEvent();
      const nameTd = <HTMLElement>this.parentElement.parentElement.firstElementChild;
      const publicI = <HTMLElement>this.parentElement.parentElement.children[1].firstElementChild;
      editProvenanceGraphMetaData(d, 'Edit').then((extras) => {
        if (extras !== null) {
          Promise.resolve(manager.editGraphMetaData(d, extras))
            .then((desc) => {
              //update the name
              nameTd.innerText = desc.name;
              successfullySaved('Session', desc.name);
              publicI.className = isPublic(desc) ? 'fa fa-users' : 'fa fa-user';
              publicI.setAttribute('title', isPublic(d) ? 'Public (everyone can see it)' : 'Private');
            })
            .catch(showErrorModalDialog);
        }
      });
      return false;
    });
    $enter.select('a[data-action="persist"]').on('click', (d) => {
      stopEvent();
      persistProvenanceGraphMetaData(d).then((extras: any) => {
        if (extras !== null) {
          manager.importExistingGraph(d, extras, true).catch(showErrorModalDialog);
        }
      });
      return false;
    });
  }

  protected createLoader() {
    return select(this.parent).classed('menuTable', true).html(`
      <div class="loading">
        <i class="fa fa-spinner fa-pulse fa-fw"></i>
        <span class="sr-only">Loading...</span>
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
    let workspaces = (await manager.list()).filter((d) => !isPersistent(d)).sort(byDateDesc);

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
        <th>Name</th>
        <th>Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>

    </tbody>
  </table>`;
    const list = ``;

    //replace loading
    const $table = $parent.html(`<p>
      A temporary session will only be stored in your local browser cache.
      It is not possible to share a link to states of this session with others.
      Only the ${KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES} most recent sessions will be stored.
    </p><div>${this.mode === 'table' ? table : list}</div>`);

    const updateTable = (data: IProvenanceGraphDataDescription[]) => {
      const $tr = $table.select('tbody').selectAll('tr').data(data);

      const $trEnter = $tr.enter().append('tr').html(`
          <td></td>
          <td></td>
          <td>${ASessionList.createButton('select')}${ASessionList.createButton('clone')}${ASessionList.createButton('persist')}${ASessionList.createButton('delete')}</td>`);

      this.registerActionListener(manager, $trEnter);
      $tr.select('td').text((d) => d.name).attr('class', (d) => isPublic(d) ? 'public' : 'private');
      $tr.select('td:nth-of-type(2)')
        .text((d) => d.ts ? fromNow(d.ts) : 'Unknown')
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
      $tr.select('span').text((d) => d.name).attr('class', (d) => isPublic(d) ? 'public' : 'private');
      $tr.select('span:nth-of-type(2)')
        .text((d) => d.ts ? fromNow(d.ts) : 'Unknown')
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
    return (await manager.list()).filter((d) => isPersistent(d)).sort(byDateDesc);
  }

  protected async build(manager: CLUEGraphManager) {

    const $parent = this.createLoader();

    //select and sort by date desc
    const workspaces = await this.getData(manager);

    const tableMine = `<table class="table table-striped table-hover table-bordered table-condensed">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Access</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>`;
    const tablePublic = `<table class="table table-striped table-hover table-bordered table-condensed">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Creator</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>`;

    $parent.html(`<p>
     The persistent session will be stored on the server.
     By default, sessions are private, meaning that only the creator has access to it.
     If the status is set to public, others can also see the session and access certain states by opening a shared link.
    </p>
        <ul class="nav nav-tabs" role="tablist">
          <li class="active" role="presentation"><a href="#session_mine" class="active"><i class="fa fa-user"></i> My Sessions</a></li>
          <li role="presentation"><a href="#session_others"><i class="fa fa-users"></i> Other Sessions</a></li>
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
            .attr('class', (d) => isPublic(d) ? 'fa fa-users' : 'fa fa-user')
            .attr('title', (d) => isPublic(d) ? 'Public (everyone can see it)' : 'Private');
          $tr.select('td:nth-of-type(3)')
            .text((d) => d.ts ? fromNow(d.ts) : 'Unknown')
            .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

          $tr.exit().remove();
        }
        {
          const $tr = $parent.select('#session_others tbody').selectAll('tr').data(otherworkspaces);

          const $trEnter = $tr.enter().append('tr').html(`
              <td></td>
              <td></td>
              <td></td>
              <td>${ASessionList.createButton('clone')}</td>`);

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
            .attr('class', (d) => isPublic(d) ? 'fa fa-users' : 'fa fa-user')
            .attr('title', (d) => isPublic(d) ? 'Public (everyone can see it)' : 'Private');
          $tr.select('span:nth-of-type(3)')
            .text((d) => d.ts ? fromNow(d.ts) : 'Unknown')
            .attr('title', (d) => d.ts ? new Date(d.ts).toUTCString() : null);

          $tr.exit().remove();
        }
        {
          const $tr = $parent.select('#session_others').selectAll('div').data(otherworkspaces);

          const $trEnter = $tr.enter().append('div').classed('sessionEntry', true).html(`
              <span></span>
              <span></span>
              <span></span>
              <span>${ASessionList.createButton('clone')}</span>`);

          this.registerActionListener(manager, $trEnter);
          $tr.select('span').text((d) => d.name);
          $tr.select('span:nth-of-type(2)').text((d) => d.creator);
          $tr.select('span:nth-of-type(3)').text((d) => d.ts ? new Date(d.ts).toUTCString() : 'Unknown');

          $tr.exit().remove();
        }
      }
    };

    update(workspaces);

    return () => this.getData(manager).then(update);
  }
}
