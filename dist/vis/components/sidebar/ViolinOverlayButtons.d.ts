/// <reference types="react" />
import { EViolinOverlay } from '../../bar/bar';
interface ViolinOverlayProps {
    callback: (s: EViolinOverlay) => void;
    currentSelected: EViolinOverlay;
}
export declare function ViolinOverlayButtons(props: ViolinOverlayProps): JSX.Element;
export {};
