/// <reference types="react" />
interface IAccordionViewProps {
    parentId: string;
    data: {
        title: string;
        JSX: JSX.Element;
        show?: boolean;
    }[];
}
export declare function AccordionView({ parentId, data }: IAccordionViewProps): JSX.Element;
export {};
