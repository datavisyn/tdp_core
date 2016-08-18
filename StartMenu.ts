/**
 * Created by Holger Stitz on 27.07.2016.
 */

import session = require('../targid2/TargidSession');
import idtypes = require('../caleydo_core/idtype');
import {Targid, TargidConstants} from '../targid2/Targid';
import {listNamedSets, INamedSet} from '../targid2/storage';
import {IPluginDesc, list as listPlugins} from '../caleydo_core/plugin';
import {showErrorModalDialog} from './Dialogs';


export class StartMenu {

  protected $node;

  protected $sections;

  private targid:Targid;

  private sectionEntries:IStartMenuSection[] = [
    {
      id: 'targidStartEntryPoint',
      name: 'Entry Points',
      cssClass: 'entryPoints',
      showViewName: true
    },
    {
      id: 'targidStartLineUp',
      name: 'LineUp Data Sets',
      cssClass: 'lineUpData',
      showViewName: false
    },
    {
      id: 'targidStartSession',
      name: 'Sessions',
      cssClass: 'targidSessionData',
      showViewName: false
    }
  ];


  private entryPoints:IStartMenuSectionEntry[] = [];

  private entryPointLists:IEntryPointList[] = [];

  private template = `
    <button class="closeButton">
      <i class="fa fa-times" aria-hidden="true"></i>
      <span class="sr-only">Close</span>
    </button>
    <div class="menu"></div>
  `;

  /**
   * Save an old key down listener to restore it later
   */
  private restoreKeyDownListener;

  constructor(parent:Element, options?) {
    this.$node = d3.select(parent);
    this.targid = options.targid;
    this.build();
  }

  /**
   * Opens the start menu and attaches an key down listener, to close the menu again pressing the ESC key
   */
  public open() {
    this.restoreKeyDownListener = document.onkeydown;
    document.onkeydown = (evt) => {
      evt = evt || <KeyboardEvent>window.event;
      if (evt.keyCode === 27) {
        this.close();
      }
    };
    this.$node.classed('open', true);

    this.updateSections();
  }

  /**
   * Close the start menu and restore an old key down listener
   */
  public close() {
    document.onkeydown = this.restoreKeyDownListener;
    this.$node.classed('open', false);
  }

  /**
   * Update entry point list for a given idType and an additional namedSet that should be appended
   * @param idType
   * @param namedSet
   */
  public updateEntryPointList(idType: idtypes.IDType | string, namedSet: INamedSet) {
    this.entryPointLists
      .filter((d) => d.getIdType() === idtypes.resolve(idType).id)
      .forEach((d) => {
        d.addNamedSet(namedSet);
      });
  }

  /**
   * Build multiple sections with entries grouped by database
   */
  private build() {
    const that = this;

    this.$node.html(this.template);

    this.$node.on('click', () => {
      if((<Event>d3.event).currentTarget === (<Event>d3.event).target) {
        this.close();
      }
    });

    this.$node.select('.closeButton').on('click', (d) => {
      // prevent changing the hash (href)
      (<Event>d3.event).preventDefault();

      this.close();
    });

    this.$sections = this.$node.select('.menu').selectAll('section').data(this.sectionEntries);

    this.$sections.enter()
      .append('section')
      .classed((d) => d.cssClass, true)
      .each(function(d) {
        that.createSection(d, d3.select(this));
      });

    // do not update here --> will be done on first call of open()
    //this.updateSections();
  }

  /**
   * Create basic DOM elements for each section and
   * @param sectionDesc
   * @param $sectionNode
   */
  private createSection(sectionDesc:IStartMenuSection, $sectionNode) {
    // get start views for entry points and sort them by name ASC
    const views = findViewCreators(sectionDesc.id).sort((a,b) => {
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      return x === y ? 0 : (x < y ? -1 : 1);
    });

    const $main = $sectionNode.html(`
        <header><h1>${sectionDesc.name}</h1></header>
        <main></main>
      `)
      .select('main');

    const $items = $main.selectAll('.item').data(views);
    const $enter = $items.enter().append('div').classed('item', true);

    // relevant for multiple entry points
    if(sectionDesc.showViewName) {
      $enter.append('div').classed('header', true).text((d) => d.name);
    }

    // append initial loading icon --> must be removed by each entry point individually
    $enter.append('div').classed('body', true)
      .html(`
        <div class="loading">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
          <span class="sr-only">Loading...</span>
        </div>
      `);
  }

  /**
   * Loops through all sections and updates them (or the entry points) if necessary
   */
  private updateSections() {
    const that = this;

    this.$sections.each(function(section) {

      // reload the entry points every time the
      d3.select(this).selectAll('div.body')
        .each(function(entryPointDesc:any) {

          // do not load entry point again, if already loaded
          if(that.entryPoints.filter((ep) => ep.desc.id === entryPointDesc.p.id).length > 0) {
            return;
          }

          // provide targid object as option object
          entryPointDesc.build(this, {targid: that.targid})
            .then((entryPoint) => {
              // prevent adding the entryPoint if already in list or undefined
              if(entryPoint === undefined || that.entryPoints.filter((ep) => ep.desc.id === entryPointDesc.p.id).length > 0) {
                return;
              }

              that.entryPoints.push(entryPoint);

              // store IEntryPointLists separately to allow a dynamic update
              if(section.id === 'targidStartEntryPoint') {
                that.entryPointLists.push(<IEntryPointList>entryPoint);
              }
            })
            .catch(showErrorModalDialog);
        });
    });
  }

}

export function create(parent:Element, options?) {
  return new StartMenu(parent, options);
}




export interface IStartFactory {
  name: string;
  build(element : HTMLElement);
  options(): Promise<{ viewId: string; options: any }>;
}

class StartFactory implements IStartFactory {
  private builder: Promise<() => any> = null;

  constructor(private p : IPluginDesc) {

  }

  get name() {
    return this.p.name;
  }

  build(element: HTMLElement, options = {}) {
    return this.builder = this.p.load().then((i) => {
      if(i.factory) {
        return i.factory(element, this.p, options);
      } else {
        console.log(`No viewId and/or factory method found for '${i.desc.id}'`);
        return null;
      }
    });
  }

  options() {
    return this.builder.then((i) => ({ viewId: (<any>this.p).viewId, options: i() }));
  }
}


export function findViewCreators(type): IStartFactory[] {
  const plugins = listPlugins(type).sort((a: any,b: any) => (a.priority || 10) - (b.priority || 10));
  var factories = plugins.map((p: IPluginDesc): IStartFactory => {
    return new StartFactory(p);
  });
  return factories;
}


interface IStartMenuSection {
  id:string;

  name:string;

  cssClass:string;

  showViewName: boolean;
}

export interface IStartMenuSectionEntry {
  desc:IPluginDesc;
}


export interface IEntryPointList {
  getIdType():idtypes.IDType | string;
  addNamedSet(namedSet:INamedSet);
}

/**
 * Abstract entry point list
 */
export class AEntryPointList implements IEntryPointList, IStartMenuSectionEntry {

  protected idType = 'Ensembl';

  protected $node;

  protected data:any[] = [];

  constructor(protected parent: HTMLElement, public desc: IPluginDesc, protected options:any) {
    this.$node = d3.select(parent);
  }

  public getIdType() {
    return this.idType;
  }

  /**
   * Add a single named set to this entry point list
   * @param namedSet
   */
  public addNamedSet(namedSet:INamedSet) {
    this.data.push(this.convertNamedSet(namedSet));
    this.updateList(this.data);
  }

  protected build():Promise<INamedSet[]> {
    // load named sets (stored LineUp sessions)
    const promise = listNamedSets(this.idType)
      // on success
      .then((namedSets: INamedSet[]) => {
        this.$node.html(''); // remove loading element or previous data

        // convert to data format and append to species data
        this.data.push.apply(this.data, namedSets.map((d) => this.convertNamedSet(d)));

        this.$node.append('ul');
        this.updateList(this.data);

        return namedSets;
      });

    // on error
    promise.catch(showErrorModalDialog)
      .catch((error) => {
        console.error(error);
      });

    return promise;
  }

  /**
   * Convert a given INamedSet into the d3 updateList function
   * @param d
   * @returns {{type: string, v: string, ids: string}}
   */
  private convertNamedSet(d:INamedSet) {
    return { type: 'set', v: d.name, ids: d.ids};
  }

  /**
   * Update the HTML list for this entry point.
   * Also binds the click listener that saves the selection to the session, before reloading the page
   * @param data
   */
  private updateList(data) {
    // append the list items
    const $ul = this.$node.select('ul');
    const $options = $ul.selectAll('li').data(data);
    $options.enter()
      .append('li')
      //.classed('selected', (d,i) => (i === 0))
      .append('a')
      .attr('href', '#')
      .text((d:any) => d.v.charAt(0).toUpperCase() + d.v.slice(1))
      .on('click', (d:any) => {
        // prevent changing the hash (href)
        (<Event>d3.event).preventDefault();

        // if targid object is available
        if(this.options.targid) {
          // create options for new view
          let o = {};
          if(d.type === 'species') {
            o = { species: d.v};
          } else if(d.type === 'set') {
            o = { filterName: d.name, filter: d.ids};
          }

          // store state to session before creating a new graph
          session.store(TargidConstants.NEW_ENTRY_POINT, {
            view: (<any>this.desc).viewId,
            options: o
          });

          // create new graph and apply new view after window.reload (@see targid.checkForNewEntryPoint())
          this.options.targid.graphManager.newGraph();
        } else {
          console.error('no targid object given to push new view');
        }
      });
  }
}
