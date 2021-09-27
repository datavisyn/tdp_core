/// <reference types="react" />
import { EViolinOverlay } from '../../plotUtils/bar';
interface ViolinOverlayProps {
    callback: (s: EViolinOverlay) => void;
    currentSelected: EViolinOverlay;
}
export declare function ViolinOverlayButtons(props: ViolinOverlayProps): JSX.Element;
export {};
