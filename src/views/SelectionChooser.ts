import {randomId} from 'phovea_core/src';
import {IDType, IDTypeLike, resolve} from 'phovea_core/src/idtype';
import {FormElementType, IFormElement, IFormElementDesc, IFormSelectElement} from '../form';
import {ISelection} from './interfaces';

export interface ISelectionChooserOptions {
  readableIDType: IDTypeLike;
  label: string;
  appendOriginalLabel: boolean;
}

/**
 * helper class for chooser logic
 */
export default class SelectionChooser {

  private readonly target: IDType | null;
  private readonly readAble: IDType | null;
  readonly desc: IFormElementDesc;
  private readonly formID: string;
  private readonly appendOriginalLabel: boolean;

  constructor(private readonly accessor: (id: string) => IFormElement, targetIDType?: IDTypeLike, options: Partial<ISelectionChooserOptions> = {}) {
    this.target = targetIDType ? resolve(targetIDType) : null;
    this.readAble = options.readableIDType ? resolve(options.readableIDType) : null;
    this.appendOriginalLabel = options.appendOriginalLabel == null ? true : options.appendOriginalLabel;

    this.formID = `forms.chooser.select.${this.target ? this.target.id : randomId(4)}`;
    this.desc = {
      type: FormElementType.SELECT,
      label: options.label || 'Show',
      id: this.formID,
      options: {
        optionsData: [],
      },
      useSession: true
    };
  }

  init(selection: ISelection) {
    return this.updateImpl(selection, false);
  }

  update(selection: ISelection) {
    return this.updateImpl(selection, true);
  }

  chosen(): { id: number, name: string } | null {
    const s = this.accessor(this.formID).value;
    if (!s) {
      return null;
    }
    if (s.data) {
      return s.data;
    }
    return {id: parseInt(s.id, 10), name: s.name};
  }

  private async updateImpl(selection: ISelection, reuseOld: boolean): Promise<boolean> {
    let targetIds: number[];

    if (this.target == null || this.target === selection.idtype) {
      targetIds = selection.range.dim(0).asList();
    } else {
      const mapped = await selection.idtype.mapToID(selection.range, this.target);
      targetIds = (<number[]>[]).concat(...mapped);
    }

    const names = await this.target.unmap(targetIds);
    const labels = this.readAble ? await this.target.mapToFirstName(targetIds, this.readAble) : null;

    return this.updateItems(targetIds.map((id, i) => ({
      id,
      name: names[i],
      label: labels ? (this.appendOriginalLabel ? `${labels[i]} (${names[i]})` : labels[i]) : names[i]
    })), reuseOld);
  }

  private updateItems(items: { label: string, id: number, name: string }[], reuseOld: boolean) {
    const options = items.map(({label, id, name}) => ({value: id.toString(), name, data: {id, name}}));
    const element = <IFormSelectElement>this.accessor(this.formID);

    // backup entry and restore the selectedIndex by value afterwards again,
    // because the position of the selected element might change
    const bak = element.value || options[element.getSelectedIndex()];
    element.updateOptionElements(options);

    let changed = true;
    // select last item from incoming `selection.range`
    if (!reuseOld) {
      element.value = options.filter((d) => d.value === items[items.length - 1].id.toString())[0];
      // otherwise try to restore the backup
    } else if (bak !== null) {
      element.value = bak;
      changed = false;
    }

    // just show if there is more than one
    element.setVisible(options.length > 1);

    return changed;
  }

}
