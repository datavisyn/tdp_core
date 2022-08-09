import React from 'react';
// Define function to show all combinations of buttons possible
function AllButtons() {
    const themeColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'gray'];
    return (React.createElement("div", { className: "container" },
        React.createElement("h5", null,
            React.createElement("span", null,
                "Checkout the ",
                React.createElement("i", null, "Button"),
                " section in the",
                ' ',
                React.createElement("a", { href: "https://docs.google.com/document/d/1O3SX49CRacjR2WyteFByPO8rKrFYklh7YJ5FsaBjuDQ/edit#heading=h.h4bfja47lkm7" }, "Styleguide"),
                " to learn when to use which button style."),
            React.createElement("hr", null)),
        React.createElement("div", { className: "row" },
            React.createElement("div", { className: "col-3" },
                React.createElement("h5", null, ".btn-*")),
            React.createElement("div", { className: "col-3" },
                React.createElement("h5", null, ".btn-text-*")),
            React.createElement("div", { className: "col-3" },
                React.createElement("h5", null, ".btn-outline-*")),
            React.createElement("div", { className: "col-3" },
                React.createElement("h5", null, ".btn-icon-*"))),
        React.createElement("div", null, themeColors.map((color) => {
            return (React.createElement("div", { key: color, className: "row pt-2 pb-2" },
                React.createElement("div", { className: "col-3", style: { display: 'flex', gap: 6 } },
                    React.createElement("button", { type: "button", className: `btn btn-${color}` },
                        React.createElement("i", { className: "fas fa-plus me-1" }),
                        " Add"),
                    React.createElement("button", { type: "button", className: `btn btn-${color}` },
                        React.createElement("i", { className: "fas fa-plus" }))),
                React.createElement("div", { className: "col-3", style: { display: 'flex', gap: 6 } },
                    React.createElement("button", { type: "button", className: `btn btn-text-${color}` },
                        React.createElement("i", { className: "fas fa-plus me-1" }),
                        " Add"),
                    React.createElement("button", { type: "button", className: `btn btn-text-${color}` },
                        React.createElement("i", { className: "fas fa-plus" }))),
                React.createElement("div", { className: "col-3", style: { display: 'flex', gap: 6 } },
                    React.createElement("button", { type: "button", className: `btn btn-outline-${color}` },
                        React.createElement("i", { className: "fas fa-plus me-1" }),
                        " Add"),
                    React.createElement("button", { type: "button", className: `btn btn-outline-${color}` },
                        React.createElement("i", { className: "fas fa-plus" }))),
                React.createElement("div", { className: "col-3" },
                    React.createElement("button", { type: "button", className: `btn btn-icon-${color}` },
                        React.createElement("i", { className: "fas fa-plus" })))));
        }))));
}
// Create default export for this story
export default {
    title: 'Example/UI/Buttons',
    component: AllButtons,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};
// Create template for story
// eslint-disable-next-line react/function-component-definition
const Template = () => {
    return React.createElement(AllButtons, null);
};
// Create story that is shown
export const AllButtonsStory = Template.bind({});
AllButtonsStory.parameters = {
    backgrounds: { default: 'light' },
};
//# sourceMappingURL=AllButtons.stories.js.map