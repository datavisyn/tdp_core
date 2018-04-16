import {randomId} from 'phovea_core/src';
import {IDType, IDTypeLike, resolve} from 'phovea_core/src/idtype';
import {FormElementType, IFormElement, IFormElementDesc, IFormSelectElement} from '../form';
import {ISelection} from './interfaces';

export interface ISelectionChooserOptions {
  readableIDType: IDTypeLike;
  label: string;
  appendOriginalLabel: boolean;
  selectNewestByDefault: boolean;
}

/**
 * helper class for chooser logic
 */
export default class SelectionChooser {

  private readonly target: IDType | null;
  private readonly readAble: IDType | null;
  readonly desc: IFormElementDesc;
  private readonly formID: string;
  private readonly options : Readonly<ISelectionChooserOptions> = {
    appendOriginalLabel: true,
    selectNewestByDefault: true,
    readableIDType: null,
    label: 'Show'
  };
  private currentOptions: { label: string, id: number, name: string }[];

  constructor(private readonly accessor: (id: string) => IFormElement, targetIDType?: IDTypeLike, options: Partial<ISelectionChooserOptions> = {}) {
    Object.assign(this.options, options);
    this.target = targetIDType ? resolve(targetIDType) : null;
    this.readAble = options.readableIDType ? resolve(options.readableIDType) : null;

    this.formID = `forms.chooser.select.${this.target ? this.target.id : randomId(4)}`;
    this.desc = {
      type: FormElementType.SELECT,
      label: this.options.label,
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
    const target: IDType = this.target || selection.idtype;
    let targetIds: number[];

    if (target === selection.idtype) {
      targetIds = selection.range.dim(0).asList();
    } else {
      const mapped = await selection.idtype.mapToID(selection.range, target);
      targetIds = (<number[]>[]).concat(...mapped);
    }

    const names = await target.unmap(targetIds);
    const labels = this.readAble && target !== this.readAble ? await target.mapToFirstName(targetIds, this.readAble) : null;

    return this.updateItems(targetIds.map((id, i) => ({
      id,
      name: names[i],
      label: labels ? (this.options.appendOriginalLabel ? `${labels[i]} (${names[i]})` : labels[i]) : names[i]
    })), reuseOld);
  }

  private updateItems(items: { label: string, id: number, name: string }[], reuseOld: boolean) {
    const options = items.map(({label, id, name}) => ({value: id.toString(), name: label, data: {id, name}}));
    const element = <IFormSelectElement>this.accessor(this.formID);

    // backup entry and restore the selectedIndex by value afterwards again,
    // because the position of the selected element might change
    const bak = element.value || options[element.getSelectedIndex()];
    element.updateOptionElements(options);

    let changed = true;
    // select last item from incoming `selection.range`
    if (this.options.selectNewestByDefault) {
      // find the first newest entries
      const newOne = options.find((d) => !this.currentOptions || this.currentOptions.every((e) => e.id !== d.data.id));
      if (newOne) {
        element.value = newOne;
      } else {
        element.value = options[options.length - 1];
      }
    } else if (!reuseOld) {
      element.value = options[options.length - 1];
      // otherwise try to restore the backup
    } else if (bak !== null) {
      element.value = bak;
      changed = false;
    }

    this.currentOptions = items;

    // just show if there is more than one
    element.setVisible(options.length > 1);

    return changed;
  }

}
