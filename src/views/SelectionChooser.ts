

import {ISelection} from './interfaces';
import {FormElementType, IFormElement, IFormElementDesc, IFormSelectElement} from '../form';
import {IDType, IDTypeLike, resolve} from 'phovea_core/src/idtype';
import {resolveIds} from './resolve';
import {randomId} from 'phovea_core/src';

/**
 * helper class for chooser logic
 */
export default class SelectionChooser {

  private readonly target: IDType|null;
  readonly desc: IFormElementDesc;
  private readonly formID: string;

  constructor(private readonly accessor: (id: string) => IFormElement, targetIDType?: IDTypeLike) {
    this.target = targetIDType ? resolve(targetIDType): null;

    this.formID = `forms.chooser.select.${this.target ? this.target.id : randomId(4)}`;
    this.desc = {
      type: FormElementType.SELECT,
      label: 'Show',
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

  private updateImpl(selection: ISelection, reuseOld: boolean): Promise<boolean> {
    const ids = selection.range.dim(0).asList();
    return resolveIds(selection.idtype, selection.range, this.target).then((names) => {
      const options = names.map((name, i) => ({value: ids[i].toString(), name, data: {id: ids[i], name}}));
      const element = <IFormSelectElement>this.accessor(this.formID);

      // backup entry and restore the selectedIndex by value afterwards again,
      // because the position of the selected element might change
      const bak = element.value || options[element.getSelectedIndex()];
      element.updateOptionElements(options);

      let changed = true;
      // select last item from incoming `selection.range`
      if (!reuseOld) {
        element.value = options.filter((d) => d.value === names[names.length - 1])[0];
        // otherwise try to restore the backup
      } else if (bak !== null) {
        element.value = bak;
        changed = false;
      }

      // just show if there is more than one
      element.setVisible(options.length > 1);

      return changed;
    });
  }

}
