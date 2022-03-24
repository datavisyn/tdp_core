import { ModeWrapper } from '../base/mode';
export var LevelOfDetail;
(function (LevelOfDetail) {
    LevelOfDetail[LevelOfDetail["ExtraSmall"] = 0] = "ExtraSmall";
    LevelOfDetail[LevelOfDetail["Small"] = 1] = "Small";
    LevelOfDetail[LevelOfDetail["Medium"] = 2] = "Medium";
    LevelOfDetail[LevelOfDetail["Large"] = 3] = "Large";
})(LevelOfDetail || (LevelOfDetail = {}));
export class DetailUtils {
    static extractTags(text) {
        const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
        let match;
        const matches = [];
        // eslint-disable-next-line no-cond-assign
        while ((match = regex.exec(text))) {
            matches.push(match[1]);
        }
        return matches;
    }
    static getLevelOfDetail() {
        const mode = ModeWrapper.getInstance().getMode();
        // if (mode.exploration >= 0.8) {
        //  return LevelOfDetail.Small;
        // }
        if (mode.presentation > 0.3) {
            return LevelOfDetail.ExtraSmall;
        }
        if (mode.authoring >= 0.8) {
            return LevelOfDetail.Large;
        }
        return LevelOfDetail.Medium;
    }
    static isEditAble() {
        return DetailUtils.getLevelOfDetail() >= LevelOfDetail.Large;
    }
}
//# sourceMappingURL=DetailUtils.js.map