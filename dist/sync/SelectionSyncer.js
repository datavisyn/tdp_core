import { BaseUtils } from '../base/BaseUtils';
import { IDTypeManager, SelectionUtils } from '../idtype';
import { IDType } from '../idtype/IDType';
import { GlobalEventHandler } from '../base/event';
const PREFIX = 'selection-idtype-';
export class SelectionSyncerOptionUtils {
    static syncIDType(store, idType, options) {
        options.selectionTypes.forEach((type) => {
            const key = `${PREFIX}${idType.id}-${type}`;
            let disable = false;
            idType.on('select-' + type, (event, type, selection) => {
                if (disable) {
                    return;
                }
                // sync just the latest state
                store.setValue(key, selection.toString());
            });
            store.on(key, (event, newValue) => {
                disable = true; //don't track on changes
                idType.select(type, newValue);
                disable = false;
            });
        });
    }
    static create(store, options) {
        options = BaseUtils.mixin({
            filter: () => true,
            selectionTypes: [SelectionUtils.defaultSelectionType] // by default just selections
        }, options);
        // store existing
        const toSync = IDTypeManager.getInstance().listIdTypes().filter((idType) => (idType instanceof IDType && options.filter(idType)));
        toSync.forEach((idType) => SelectionSyncerOptionUtils.syncIDType(store, idType, options));
        // watch new ones
        GlobalEventHandler.getInstance().on('register.idtype', (event, idType) => {
            if (options.filter(idType)) {
                SelectionSyncerOptionUtils.syncIDType(store, idType, options);
            }
        });
        return null;
    }
}
//# sourceMappingURL=SelectionSyncer.js.map