/// <reference types="react" />
import { EScatterSelectSettings } from '../interfaces';
interface BrushOptionProps {
    callback: (dragMode: EScatterSelectSettings) => void;
    dragMode: EScatterSelectSettings;
    options?: EScatterSelectSettings[];
}
export declare function BrushOptionButtons({ callback, dragMode, options, }: BrushOptionProps): JSX.Element;
export {};
//# sourceMappingURL=BrushOptionButtons.d.ts.map