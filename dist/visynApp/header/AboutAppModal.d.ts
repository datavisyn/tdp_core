/// <reference types="react" />
import { MantineNumberSize } from '@mantine/core';
export interface IAboutAppModalConfig {
    content: JSX.Element;
    customerLogo?: JSX.Element;
    size?: MantineNumberSize;
}
export declare function AboutAppModal({ size, content, opened, onClose, dvLogo, customerLogo, }: {
    opened: boolean;
    onClose: () => void;
    dvLogo?: JSX.Element;
    customerLogo?: JSX.Element;
} & IAboutAppModalConfig): JSX.Element;
//# sourceMappingURL=AboutAppModal.d.ts.map