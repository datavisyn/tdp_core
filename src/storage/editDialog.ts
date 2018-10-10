import {IStoredNamedSet} from './interfaces';
import {FormDialog} from 'phovea_ui/src/dialogs';
import {EEntity, hasPermission} from 'phovea_core/src/security';

export default function editDialog(namedSet: IStoredNamedSet, result: (name: string, description: string, isPublic: boolean) => void) {
  const isCreate = namedSet === null;
  const title = isCreate ? 'Save' : 'Edit';
  const dialog = new FormDialog(title + ' List of Entities', title, 'namedset_form');

  dialog.form.innerHTML = `
    <div class="form-group">
      <label for="namedset_name">Name</label>
      <input type="text" class="form-control" id="namedset_name" placeholder="Name" required="required" ${namedSet ? `value="${namedSet.name}"` : ''}>
    </div>
    <div class="form-group">
      <label for="namedset_description">Description</label>
      <textarea class="form-control" id="namedset_description" rows="5" placeholder="Description">${namedSet ? namedSet.description : ''}</textarea>
    </div>
    <div class="radio">
      <label class="radio-inline">
        <input type="radio" name="namedset_public" value="private" ${!(namedSet && hasPermission(namedSet, EEntity.OTHERS)) ? 'checked="checked"' : ''}> <i class="fa fa-user"></i> Private
      </label>
      <label class="radio-inline">
        <input type="radio" name="namedset_public" id="namedset_public" value="public" ${namedSet && hasPermission(namedSet, EEntity.OTHERS) ? 'checked="checked"' : ''}> <i class="fa fa-users"></i> Public (everybody can see and use it)
      </label>
    </div>
  `;

  dialog.onHide(() => dialog.destroy());

  dialog.onSubmit(() => {
    const name = (<HTMLInputElement>document.getElementById('namedset_name')).value;
    const description = (<HTMLInputElement>document.getElementById('namedset_description')).value;
    const isPublic = (<HTMLInputElement>document.getElementById('namedset_public')).checked;

    result(name, description, isPublic);
    dialog.hide();
    return false;
  });

  dialog.show();
}
