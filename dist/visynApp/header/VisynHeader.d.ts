/// <reference types="react" />
import { MantineColor } from '@mantine/core';
import { IAboutAppModalConfig } from './AboutAppModal';
export declare function VisynHeader({ color, backgroundColor, components, undoCallback, redoCallback, searchCallback, }: {
    backgroundColor?: MantineColor;
    color?: MantineColor;
    components?: {
        beforeLeft?: JSX.Element;
        burgerMenu?: JSX.Element;
        afterLeft?: JSX.Element;
        beforeTitle?: JSX.Element;
        title?: JSX.Element;
        afterTitle?: JSX.Element;
        beforeRight?: JSX.Element;
        logo?: JSX.Element;
        customerLogo?: JSX.Element;
        userAvatar?: JSX.Element;
        userMenu?: JSX.Element;
        afterRight?: JSX.Element;
        aboutAppModal?: JSX.Element | IAboutAppModalConfig;
    };
    undoCallback?: () => void;
    redoCallback?: () => void;
    searchCallback?: (s: string) => void;
}): JSX.Element;
//# sourceMappingURL=VisynHeader.d.ts.map