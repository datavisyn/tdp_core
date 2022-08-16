/// <reference types="react" />
import { EBarDisplayType } from '../interfaces';
interface BarDisplayProps {
    callback: (s: EBarDisplayType) => void;
    currentSelected: EBarDisplayType;
}
export declare function BarDisplayButtons({ callback, currentSelected }: BarDisplayProps): JSX.Element;
export {};
//# sourceMappingURL=BarDisplayTypeButtons.d.ts.map