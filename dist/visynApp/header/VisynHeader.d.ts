/// <reference types="react" />
import { MantineColor } from '@mantine/core';
import { IAboutAppModalConfig } from './AboutAppModal';
export declare function VisynHeader({ color, backgroundColor, appLinkSrc, components, undoCallback, redoCallback, searchCallback, }: {
    /**
     * Optional color to be used for the background. If it is part of the mantine colors, it uses the primary shade, otherwise it is interpreted as CSS color.
     */
    backgroundColor?: MantineColor;
    /**
     * Optional color to be used for the text. This must be in contrast with the given `backgroundColor`.
     */
    color?: MantineColor;
    /**
     * Optional appLlinkSrc to be used for the as the source for the app link in the header.
     */
    appLinkSrc?: string;
    /**
     * Extension components to be rendered within the header.
     */
    components?: {
        beforeLeft?: JSX.Element;
        burgerMenu?: JSX.Element;
        afterLeft?: JSX.Element;
        beforeTitle?: JSX.Element;
        title?: JSX.Element;
        afterTitle?: JSX.Element;
        beforeRight?: JSX.Element;
        logo?: JSX.Element;
        userAvatar?: JSX.Element;
        userMenu?: JSX.Element;
        afterRight?: JSX.Element;
        aboutAppModal?: JSX.Element | IAboutAppModalConfig;
    };
    /**
     * Optional callback functioned which is called when the undo button is clicked. If not given, undo button is not created
     */
    undoCallback?: () => void;
    /**
     * Optional callback functioned which is called when the redo button is clicked. If not given, redo button is not created
     */
    redoCallback?: () => void;
    /**
     * Optional callback called when the search is changed, passing the current search value. If not given, no search icon is created
     */
    searchCallback?: (s: string) => void;
}): JSX.Element;
//# sourceMappingURL=VisynHeader.d.ts.map