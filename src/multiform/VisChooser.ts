import { IMultiForm } from './IMultiForm';
import { FormUtils } from './internal/FormUtils';

export class VisChooser {
  /**
   * computes the selectable vis techniques for a given set of multi form objects
   * @param forms
   * @return {*}
   */
  static toAvailableVisses(forms: IMultiForm[]) {
    if (forms.length === 0) {
      return [];
    }
    if (forms.length === 1) {
      return forms[0].visses;
    }
    // intersection of all
    return forms[0].visses.filter((vis) => forms.every((f) => f.visses.indexOf(vis) >= 0));
  }

  static addIconVisChooser(toolbar: HTMLElement, ...forms: IMultiForm[]) {
    const s = toolbar.ownerDocument.createElement('div');
    toolbar.insertBefore(s, toolbar.firstChild);
    const visses = VisChooser.toAvailableVisses(forms);

    visses.forEach((v) => {
      const child = FormUtils.createNode(s, 'i');
      v.iconify(child);
      child.onclick = () => forms.forEach((f) => f.switchTo(v));
    });
  }

  static addSelectVisChooser(toolbar: HTMLElement, ...forms: IMultiForm[]) {
    const s = toolbar.ownerDocument.createElement('select');
    toolbar.insertBefore(s, toolbar.firstChild);
    const visses = VisChooser.toAvailableVisses(forms);

    visses.forEach((v, i) => {
      const child = FormUtils.createNode(s, 'option');
      child.setAttribute('value', String(i));
      child.textContent = v.name;
    });
    // use only the current selection of the first form
    if (forms[0]) {
      s.selectedIndex = visses.indexOf(forms[0].act);
    }
    s.onchange = () => forms.forEach((f) => f.switchTo(visses[s.selectedIndex]));
  }
}
