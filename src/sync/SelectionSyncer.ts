import {BaseUtils} from '../base/BaseUtils';
import {Store} from './Store';
import {IDTypeManager, SelectionUtils} from '../idtype';
import {IDType} from '../idtype/IDType';
import {Range} from '../range/Range';
import {GlobalEventHandler} from '../base/event';

const PREFIX = 'selection-idtype-';

export interface ISelectionSyncerOptions {
  filter?(idType: IDType): boolean;
  selectionTypes?: string[];
}

export class SelectionSyncerOptionUtils {

  private static syncIDType(store: Store, idType: IDType, options: ISelectionSyncerOptions) {
    options.selectionTypes.forEach((type) => {
      const key = `${PREFIX}${idType.id}-${type}`;
      let disable = false;
      idType.on('select-' + type, (event, type: string, selection: Range) => {
        if (disable) {
          return;
        }
        // sync just the latest state
        store.setValue(key, selection.toString());
      });
      store.on(key, (event: any, newValue: string) => {
        disable = true; //don't track on changes
        idType.select(type, newValue);
        disable = false;
      });
    });
  }


  static create(store: Store, options?: ISelectionSyncerOptions) {
    options = BaseUtils.mixin({
      filter: () => true,
      selectionTypes: [SelectionUtils.defaultSelectionType] // by default just selections
    }, options);

    // store existing
    const toSync = IDTypeManager.getInstance().listIdTypes().filter((idType) => (idType instanceof IDType && options.filter(<IDType>idType)));
    toSync.forEach((idType) => SelectionSyncerOptionUtils.syncIDType(store, <IDType>idType, options));

    // watch new ones
    GlobalEventHandler.getInstance().on('register.idtype', (event: any, idType: IDType) => {
      if (options.filter(idType)) {
        SelectionSyncerOptionUtils.syncIDType(store, idType, options);
      }
    });
    return null;
  }
}
