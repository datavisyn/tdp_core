/// <reference types="react" />
import { MantineColor } from '@mantine/core';
export declare function VisynHeader({ burgerMenu, userMenu, color, backgroundColor, dvLogo, // TODO: Use d3 to determine the better variant
components, undoCallback, redoCallback, searchCallback, }: {
    /**
     * Optional change of default dv logo as JSX element. If not provided, normal logo will be displayed.
     */
    dvLogo?: JSX.Element;
    /**
     * Optional JSX Element to be displayed when the burgerMenu is clicked. If not provided, burger menu is hidden.
     */
    burgerMenu?: JSX.Element;
    userMenu?: JSX.Element;
    /**
     * Optional color to be used for the background. This color must match an entry in the mantine theme colors array. Uses the 7th element in the mantine color array.
     */
    backgroundColor?: MantineColor;
    /**
     * Optional color to be used for the text. This must be in contrast with the given `backgroundColor`.
     */
    color?: MantineColor;
    /**
     * Extension components to be rendered within the header.
     */
    components?: {
        beforeTitle?: JSX.Element;
        title?: JSX.Element;
        afterTitle?: JSX.Element;
        beforeRight?: JSX.Element;
        afterRight?: JSX.Element;
        beforeLeft?: JSX.Element;
        afterLeft?: JSX.Element;
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
     * @param s Search string.
     */
    searchCallback?: (s: string) => void;
}): JSX.Element;
//# sourceMappingURL=VisynHeader.d.ts.map