import {debounce} from 'phovea_core/src';
import {parse} from 'phovea_core/src/range';
import {showErrorModalDialog} from '../dialogs';
import {IRow} from '../rest';
import {ISelection, IViewContext} from '../views';
import {AView} from './AView';

export interface IATableViewOptions {
  selectAble: boolean;
}

/**
 * base class for views based on LineUp
 */
export abstract class ATableView<T extends IRow> extends AView {

  private readonly options: Readonly<IATableViewOptions> = {
    selectAble: true
  };

  /**
   * clears and rebuilds this lineup instance from scratch
   * @returns {Promise<any[]>} promise when done
   */
  protected rebuild = debounce(() => this.rebuildImpl(), 100);

  /**
   * similar to rebuild but just loads new data and keep the columns
   * @returns {Promise<any[]>} promise when done
   */
  protected reloadData = debounce(() => this.reloadDataImpl(), 100);

  /**
   * promise resolved when everything is built
   * @type {any}
   */
  protected built: Promise<any> = null;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IATableViewOptions> = {}) {
    super(context, selection, parent);

    this.node.classList.add('tdp-table');
  }

  /**
   * custom initialization function at the build will be called
   */
  protected initImpl() {
    super.initImpl();

    this.node.innerHTML = `<table>
        <thead><tr></tr></thead>
        <tbody></tbody>
    </table>`;

    return this.built = this.build();
  }

  protected abstract renderHeader(tr: HTMLTableRowElement, rows: T[]): void;

  protected abstract renderRow(tr: HTMLTableRowElement, row: T, index: number): void;

  /**
   * load the rows of LineUp
   * @returns {Promise<IRow[]>} the rows at least containing the represented ids
   */
  protected abstract loadRows(): Promise<T[]>|T[];


  private build() {
    this.setBusy(true);
    return Promise.resolve(this.loadRows()).then((rows) => {
      const header = <HTMLTableRowElement>this.node.querySelector('thead tr');
      header.innerHTML = '';
      this.renderHeader(header, rows);
      const body = <HTMLTableSectionElement>this.node.querySelector('tbody');
      body.innerHTML = '';
      rows.forEach((row, i) => {
        const tr = body.insertRow();
        this.renderRow(tr, row, i);
        if (this.options.selectAble && this.itemIDType) {
          tr.onclick = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.setItemSelection({
              idtype: this.itemIDType,
              range: parse([row._id])
            });
          };
        }
      });
      this.setBusy(false);
    }).catch(showErrorModalDialog)
      .catch((error) => {
        console.error(error);
        this.setBusy(false);
      });
  }

  private reloadDataImpl() {
    return this.built = Promise.all([this.built, this.loadRows()]).then((r) => {
      const rows: T[] = r[1];
      const body = <HTMLTableSectionElement>this.node.querySelector('tbody');
      body.innerHTML = '';
      rows.forEach((row, i) => {
        const tr = body.insertRow();
        this.renderRow(tr, row, i);
      });
    });
  }

  private rebuildImpl() {
    return this.built = this.built.then(() => this.build());
  }
}

export default ATableView;
