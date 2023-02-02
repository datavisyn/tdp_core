/// <reference types="react" />
import { MantineThemeColors } from '@mantine/core';
/**
 *
 * @param projectName Optional name of project to be displayed next to app name.
 * @param dvLogo Optional change of default dv logo as JSX element. If not provided, normal logo will be displayed.
 * @param customerLogo Optional customer logo as JSX element. If not provided, nothing displayed
 * @param burgerMenu Optional JSX Element to be displayed when the burgerMenu is clicked. If not provided, burger menu is hidden.
 * @param userName Optional name to be displayed in a username avatar. Expects a space between names.
 * @param backgroundColor Optional color to be used for the background. This color must match an entry in the mantine theme colors array. Uses the 7th element in the mantine color array
 * @param undoCallback Optional callback functioned which is called when the undo button is clicked. If not given, undo button is not created
 * @param redoCallback Optional callback functioned which is called when the redo button is clicked. If not given, redo button is not created
 * @param searchCallback Optional callback called when the search is changed, passing the current search value. If not given, no search icon is created
 * @returns
 */
export declare function VisynHeader({ projectName, dvLogo, customerLogo, burgerMenu, userMenu, userName, backgroundColor, undoCallback, redoCallback, searchCallback, }: {
    projectName?: string;
    dvLogo?: JSX.Element;
    customerLogo?: JSX.Element;
    burgerMenu?: JSX.Element;
    userMenu?: JSX.Element;
    userName?: string;
    backgroundColor?: keyof MantineThemeColors;
    undoCallback?: () => void;
    redoCallback?: () => void;
    searchCallback?: (s: string) => void;
}): JSX.Element;
//# sourceMappingURL=VisynHeader.d.ts.map