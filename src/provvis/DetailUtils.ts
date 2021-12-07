import {ModeWrapper} from '../base/mode';

export enum LevelOfDetail {
  ExtraSmall = 0,
  Small = 1,
  Medium = 2,
  Large = 3
}
export class DetailUtils {
  static extractTags(text: string) {
    const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    let match;
    const matches = [];
    while (match = regex.exec(text)) {
      matches.push(match[1]);
    }
    return matches;
  }

  static getLevelOfDetail(): LevelOfDetail {
    const mode = ModeWrapper.getInstance().getMode();
    //if (mode.exploration >= 0.8) {
    //  return LevelOfDetail.Small;
    //}
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
