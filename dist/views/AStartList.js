import { ARankingView } from '../lineup/ARankingView';
import { ENamedSetType } from '../storage/interfaces';
/**
 * base class for ranking views start doen't require any input but can have as additional input a NamedSet they are representing
 */
export class AStartList extends ARankingView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent, {
            additionalScoreParameter: options.namedSet,
            additionalComputeScoreParameter: options.namedSet,
            subType: {
                key: options.namedSet ? options.namedSet.subTypeKey : '',
                value: options.namedSet ? options.namedSet.subTypeValue : '',
            },
            ...options,
        });
    }
    get namedSet() {
        return this.options.namedSet || null;
    }
    buildNamedSetFilters(namedSetIdFilterKey = 'namedset4id', validFilterKey = () => true) {
        const { namedSet } = this;
        if (!namedSet) {
            return {};
        }
        const filter = {};
        switch (namedSet.type) {
            case ENamedSetType.NAMEDSET:
                filter[namedSetIdFilterKey] = namedSet.id;
                break;
            case ENamedSetType.PANEL:
                filter.panel = namedSet.id;
                break;
            case ENamedSetType.FILTER:
                Object.assign(filter, namedSet.filter);
                break;
            default:
                break;
        }
        // TODO can't remember why the all exception
        if (this.namedSet.subTypeKey && validFilterKey(this.namedSet.subTypeKey) && this.namedSet.subTypeValue !== 'all') {
            if (this.namedSet.subTypeFromSession) {
                filter[this.namedSet.subTypeKey] =
                    typeof window.sessionStorage.getItem(this.namedSet.subTypeKey) === 'string'
                        ? JSON.parse(window.sessionStorage.getItem(this.namedSet.subTypeKey))
                        : this.namedSet.subTypeValue;
            }
            else {
                filter[this.namedSet.subTypeKey] = this.namedSet.subTypeValue;
            }
        }
        return filter;
    }
}
//# sourceMappingURL=AStartList.js.map