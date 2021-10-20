import React from "react";

interface IAccordionViewProps {
    parentId: string;
    data: {title: string, JSX: JSX.Element, show?: boolean}[];
}

export function AccordionView({parentId, data}: IAccordionViewProps) {
  const accordionItem = (index: number, title: string, JSX: JSX.Element, show?: boolean) => {
    return (
      <div key={index} className="accordion-item">
        <h2 className="accordion-header" id={`heading${index}`}>
          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="true" aria-controls={`collapse${index}`}>
            {title}
          </button>
        </h2>
        <div id={`collapse${index}`} className={`p-2 accordion-collapse collapse${show ? " show" : ""}`} aria-labelledby={`heading${index}`} data-bs-parent={`#${parentId.trim()}`}>
          {JSX}
        </div>
      </div>
    );
  };

  return (
    <div className="accordion" id={parentId.trim()}>
      {data.map((d, i) => accordionItem(i, d.title, d.JSX, d.show))}
    </div>
  );
}