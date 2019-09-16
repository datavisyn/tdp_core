import {randomId} from 'phovea_core/src';
import {IDType, IDTypeLike, resolve} from 'phovea_core/src/idtype';
import {FormElementType, IFormElement, IFormElementDesc, IFormSelectElement, IFormSelectOptionGroup,  IFormSelectOption} from '../form';
import {ISelection} from './interfaces';

export interface ISelectionChooserOptions {
  /**
   * Readable IDType the selection is being mapped to. If there is a 1:n mapping this IDType is used as the options group
   */
  readableIDType: IDTypeLike;
  /**
   * In case of 1:n mappings between the selection's IDType and the readableIDType the readableSubOptionIDType can be used map the n options to readable names
   */
  readableSubOptionIDType: IDTypeLike;
  label: string;
  appendOriginalLabel: boolean;
  selectNewestByDefault: boolean;
}

/**
 * helper class for chooser logic
 */
export default class SelectionChooser {

  private static readonly INVALID_MAPPING = {
    name: 'Invalid',
    id: -1
  };

  private readonly target: IDType | null;
  private readonly readAble: IDType | null;
  private readonly readAbleSubOptionsIDType: IDType | null;
  readonly desc: IFormElementDesc;
  private readonly formID: string;
  private readonly options : Readonly<ISelectionChooserOptions> = {
    appendOriginalLabel: true,
    selectNewestByDefault: true,
    readableIDType: null,
    readableSubOptionIDType: null,
    label: 'Show'
  };
  private currentOptions: IFormSelectOption[];

  constructor(private readonly accessor: (id: string) => IFormElement, targetIDType?: IDTypeLike, options: Partial<ISelectionChooserOptions> = {}) {
    Object.assign(this.options, options);
    this.target = targetIDType ? resolve(targetIDType) : null;
    this.readAble = options.readableIDType ? resolve(options.readableIDType) : null;
    this.readAbleSubOptionsIDType = options.readableSubOptionIDType ? resolve(options.readableSubOptionIDType) : null;

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
    if (!s || s.data === SelectionChooser.INVALID_MAPPING) {
      return null;
    }
    if (s.data) {
      return s.data;
    }
    return {id: parseInt(s.id, 10), name: s.name};
  }

  private async toItems(selection: ISelection): Promise<(IFormSelectOption|IFormSelectOptionGroup)[]> {
    const source = selection.idtype;
    const sourceIds = selection.range.dim(0).asList();
    const sourceNames = await source.unmap(sourceIds);

    const readAble = this.readAble || null;
    const readAbleNames = !readAble || readAble === source ? null : await source.mapToFirstName(sourceIds, readAble);
    const labels = readAbleNames ? (this.options.appendOriginalLabel ? readAbleNames.map((d, i) => `${d} (${sourceNames[i]})`) : readAbleNames) : sourceNames;

    const target = this.target || source;
    if (target === source) {
      return sourceIds.map((d, i) => ({
        value: String(d),
        name: labels[i],
        data: {id: d, name: sourceNames[i]}
      }));
    }

    const targetIds = await source.mapToID(sourceIds, target);
    const targetIdsFlat = (<number[]>[]).concat(...targetIds);
    const targetNames = await target.unmap(targetIdsFlat);

    // in case of 1:n mappings the readableIDType maps to the groups, the actual options would be mapped to the target IDType (e.g. some IDs).
    // the readableSubOptionIDType provide the possibility to add an extra IDType to map the actual options to instead of the target
    let readAbleSubOptions: string[];
    if (this.readAbleSubOptionsIDType) {
      const optionsIDs: string[][] = await target.mapNameToName(targetNames, this.readAbleSubOptionsIDType);

      readAbleSubOptions = [].concat(...optionsIDs);
    }

    const subOptions = readAbleSubOptions && readAbleSubOptions.length > 0? readAbleSubOptions : targetNames;

    if (target === readAble && targetIds.every((d) => d.length === 1)) {
      // keep it simple target = readable and single hit - so just show flat
      return targetIds.map((d, i) => ({
        value: String(d[0]),
        name: labels[i],
        data: {id: d[0], name: subOptions[i]}
      }));
    }

    let acc = 0;
    const base = labels.map((name, i) => {
      const group = targetIds[i];
      const groupNames = subOptions.slice(acc, acc + group.length);
      acc += group.length;

      if (group.length === 0) {
        // fake option with null value
        return <IFormSelectOptionGroup>{
          name,
          children: [{
            name: 'No Mapping found',
            value: '',
            data: SelectionChooser.INVALID_MAPPING
          }]
        };
      }
      return <IFormSelectOptionGroup>{
        name,
        children: group.map((d, j) => ({
          name: groupNames[j],
          value: String(d),
          data: {
            id: d,
            name: groupNames[j]
          }
        }))
      };
    });
    return base.length === 1 ? base[0].children : base;
  }

  private updateImpl(selection: ISelection, reuseOld: boolean): Promise<boolean> {
    return this.toItems(selection).then((r) => this.updateItems(r, reuseOld));
  }

  private updateItems(options: (IFormSelectOption|IFormSelectOptionGroup)[], reuseOld: boolean) {
    const element = <IFormSelectElement>this.accessor(this.formID);

    const flatOptions = options.reduce((acc, d) => {
      if ((<any>d).children) {
        acc.push(...(<IFormSelectOptionGroup>d).children);
      } else {
        acc.push(<IFormSelectOption>d);
      }
      return acc;
    }, <IFormSelectOption[]>[]);

    // backup entry and restore the selectedIndex by value afterwards again,
    // because the position of the selected element might change
    const bak = element.value || flatOptions[element.getSelectedIndex()];

    let changed = true;
    let newValue = bak;
    // select last item from incoming `selection.range`
    if (this.options.selectNewestByDefault) {
      // find the first newest entries
      const newOne = flatOptions.find((d) => !this.currentOptions || this.currentOptions.every((e) => e.value !== d.value));
      if (newOne) {
        newValue = newOne;
      } else {
        newValue = flatOptions[flatOptions.length - 1];
      }
    } else if (!reuseOld) {
      newValue = flatOptions[flatOptions.length - 1];
      // otherwise try to restore the backup
    } else if (bak !== null) {
      newValue = bak;
      changed = false;
    }

    this.currentOptions = flatOptions;
    element.updateOptionElements(options);
    element.value = newValue;
    // just show if there is more than one
    element.setVisible(options.length > 1);

    return changed;
  }

  /**
   * change the selected value programmatically
   */
  setSelection(value: any) {
    const element = <IFormSelectElement>this.accessor(this.formID);

    element.value = value;
  }

}
