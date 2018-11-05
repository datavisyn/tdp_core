import {IPlugin} from 'phovea_core/src/plugin';

export const EXTENSION_POINT_TDP_TOUR = 'tdpTour';

export interface ITDPTourExtensionDesc {
  name: string;
  description?: string;
  level?: 'beginner' | 'advanced';

  load(): Promise<IPlugin & ITDPTourExtension>;
}

export interface ITDPTourExtension {
  desc: ITDPTourExtensionDesc;
  factory(): IStep[];
}

export interface IStep {
  selector: string;
  html: string;
}
