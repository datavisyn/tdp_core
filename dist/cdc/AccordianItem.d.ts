/// <reference types="react" />
interface IAccordionItem {
    children: JSX.Element;
    index: number;
    title: string;
    parentId: string;
    show?: boolean;
}
export default function AccordionItem({ children, index, title, parentId, show }: IAccordionItem): JSX.Element;
export {};
