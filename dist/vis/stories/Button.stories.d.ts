/// <reference types="react" />
import { ComponentStory } from '@storybook/react';
declare type ThemeColorTypes = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'gray';
declare function Button({ themeColor, type, text, size, icon, disable, }: {
    themeColor: ThemeColorTypes;
    type?: 'icon' | 'text' | 'outline' | 'default';
    size?: 'btn-sm' | 'btn-lg' | 'default';
    text: string | null;
    icon: string;
    disable: 'default' | 'disabled';
}): JSX.Element;
declare const _default: {
    title: string;
    component: typeof Button;
    argTypes: {
        themeColor: {
            options: string[];
            control: {
                type: string;
            };
        };
        type: {
            options: string[];
            control: {
                type: string;
            };
        };
        size: {
            options: string[];
            control: {
                type: string;
            };
        };
        disable: {
            options: string[];
            control: {
                type: string;
            };
        };
    };
};
export default _default;
export declare const ButtonStory: ComponentStory<typeof Button>;
//# sourceMappingURL=Button.stories.d.ts.map