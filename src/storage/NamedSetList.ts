/**
 * Created by Holger Stitz on 27.07.2016.
 */

import {IDType} from 'phovea_core/src/idtype';
import {areyousure} from 'phovea_ui/src/dialogs';
import editDialog from './editDialog';
import {listNamedSets, deleteNamedSet, editNamedSet} from './rest';
import {INamedSet, IStoredNamedSet, ENamedSetType} from './interfaces';
import {list as listPlugins} from 'phovea_core/src/plugin';
import {showErrorModalDialog} from '../dialogs';
import {EXTENSION_POINT_TDP_LIST_FILTERS} from '../extensions';
import {Selection, select, event as d3event} from 'd3';
import {
  ALL_NONE_NONE,
  ALL_READ_READ,
  canWrite,
  currentUserNameOrAnonymous,
  EEntity,
  hasPermission
} from 'phovea_core/src/security';
import {successfullySaved, successfullyDeleted} from '../notifications';

export default class NamedSetList {
  readonly node: HTMLElement;

  private data: INamedSet[] = [];
  private filter: (metaData: object) => boolean = () => true;
  private loaded = false;

  constructor(private readonly idType: IDType, private readonly sessionCreator: (namedSet: INamedSet) => void, doc = document) {
    this.node = doc.createElement('div');
    this.node.classList.add('named-sets-wrapper');
    this.build();
  }

  get(index: number) {
    return this.data[index];
  }

  private async build() {
    this.node.innerHTML = `
      <section class="predefined-named-sets"><header>Predefined Sets</header><ul class="loading"></ul></section>
      <section class="custom-named-sets"><header>My Sets</header><ul class="loading"></ul></section>
      <section class="other-named-sets"><header>Public Sets</header><ul class="loading"></ul></section>`;

    this.filter = await this.findFilters();
    const data = await this.list();

    //store
    this.data.push(...data);
    this.loaded = true;
    this.update();
  }

  private edit(namedSet: IStoredNamedSet) {
    if (!canWrite(namedSet)) {
      return;
    }
    editDialog(namedSet, async (name, description, isPublic) => {
      const params = {
        name,
        description,
        permissions: isPublic ? ALL_READ_READ : ALL_NONE_NONE
      };

      const editedSet = await editNamedSet(namedSet.id, params);
      successfullySaved('Named Set', name);
      this.replace(namedSet, editedSet);
    });
  }

  update() {
    const data = this.data.filter((datum) => this.filter({[datum.subTypeKey]: datum.subTypeValue}));
    const predefinedNamedSets = data.filter((d) => d.type !== ENamedSetType.NAMEDSET);
    const me = currentUserNameOrAnonymous();
    const customNamedSets = data.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me);
    const otherNamedSets = data.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me);

    const $node = select(this.node);

    // append the list items
    this.updateGroup($node.select('.predefined-named-sets ul'), predefinedNamedSets);
    this.updateGroup($node.select('.custom-named-sets ul'), customNamedSets);
    this.updateGroup($node.select('.other-named-sets ul'), otherNamedSets);
  }

  private updateGroup($base: Selection<any>, data: INamedSet[]) {
    const $options = $base.classed('loading', data.length === 0 && !this.loaded).selectAll('li').data(data);
    const $enter = $options.enter()
      .append('li').classed('namedset', (d) => d.type === ENamedSetType.NAMEDSET);

    $enter.append('a')
      .classed('goto', true)
      .attr('href', '#')
      .on('click', (namedSet: INamedSet) => {
        // prevent changing the hash (href)
        (<Event>d3event).preventDefault();
        this.sessionCreator(namedSet);
      });

    $enter.append('a')
      .classed('public', true)
      .attr('href', '#')
      .html(`<i class="fa fa-fw" aria-hidden="true"></i> <span class="sr-only"></span>`)
      .on('click', (namedSet: INamedSet) => {
        // prevent changing the hash (href)
        (<Event>d3event).preventDefault();
        this.edit(<IStoredNamedSet>namedSet);
      });

    $enter.append('a')
      .classed('edit', true)
      .attr('href', '#')
      .html(`<i class="fa fa-pencil-square-o" aria-hidden="true"></i> <span class="sr-only">Edit</span>`)
      .attr('title', 'Edit')
      .on('click', (namedSet: IStoredNamedSet) => {
        // prevent changing the hash (href)
        (<Event>d3event).preventDefault();
        this.edit(namedSet);
      });

    $enter.append('a')
      .classed('delete', true)
      .attr('href', '#')
      .html(`<i class="fa fa-trash" aria-hidden="true"></i> <span class="sr-only">Delete</span>`)
      .attr('title', 'Delete')
      .on('click', async (namedSet: IStoredNamedSet) => {
        // prevent changing the hash (href)
        (<Event>d3event).preventDefault();

        if (!canWrite(namedSet)) {
          return;
        }

        const deleteIt = await areyousure(`The named set <i>${namedSet.name}</i> will be deleted and cannot be restored. Continue?`,
          {title: `Delete named set`}
        );
        if (deleteIt) {
          await deleteNamedSet(namedSet.id);
          successfullyDeleted('Dashboard', namedSet.name);
          this.remove(namedSet);
        }
      });

    //update
    $options.select('a.goto').text((d) => d.name)
      .attr('title', (d) => `Name: ${d.name}\nDescription: ${d.description}${d.type === ENamedSetType.NAMEDSET ? `\nCreator: ${(<IStoredNamedSet>d).creator}\nPublic: ${hasPermission(<IStoredNamedSet>d, EEntity.OTHERS)}` : ''}`);
    $options.select('a.delete').classed('hidden', (d) => d.type !== ENamedSetType.NAMEDSET || !canWrite(d));
    $options.select('a.edit').classed('hidden', (d) => d.type !== ENamedSetType.NAMEDSET || !canWrite(d));
    $options.select('a.public')
      .classed('hidden', (d) => d.type !== ENamedSetType.NAMEDSET || !canWrite(d))
      .html((d) => {
        const isPublic = d.type === ENamedSetType.NAMEDSET && hasPermission(<IStoredNamedSet>d, EEntity.OTHERS);
        return `<i class="fa ${isPublic ? 'fa-users' : 'fa-user'}" aria-hidden="true" title="${isPublic ? 'Public' : 'Private'}"></i> <span class="sr-only">${isPublic ? 'Public' : 'Private'}</span>`;
      });

    $options.exit().remove();
  }

  push(...namedSet: INamedSet[]) {
    this.data.push(...namedSet);
    this.update();
  }

  remove(namedSet: INamedSet) {
    this.data.splice(this.data.indexOf(namedSet), 1);
    this.update();
  }

  replace(oldNamedSet: INamedSet, newNamedSet: INamedSet) {
    this.data.splice(this.data.indexOf(oldNamedSet), 1, newNamedSet);
    this.update();
  }

  protected findFilters() {
    return Promise.all(listPlugins(EXTENSION_POINT_TDP_LIST_FILTERS).map((plugin) => plugin.load())).then((filters) => {
      return (metaData: object) => filters.every((f) => f.factory(metaData));
    });
  }

  protected list(): Promise<INamedSet[]> {
    return listNamedSets(this.idType)
      .catch(showErrorModalDialog)
      .catch((error) => {
        console.error(error);
        return [];
      });
  }
}
