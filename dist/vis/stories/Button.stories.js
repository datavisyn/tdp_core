import React from 'react';
import { Title, Subtitle, Description, Primary, ArgsTable, Stories, PRIMARY_STORY } from '@storybook/addon-docs';
function Button({ themeColor, type, text, size, icon, disable, }) {
    return (React.createElement("button", { type: "button", className: `btn btn${type !== 'default' ? `-${type}` : ''}-${themeColor} ${size !== 'default' && size} ${disable !== 'default' && disable} ` },
        icon && React.createElement("i", { className: `${icon} ${text ? 'me-2' : ''}` }),
        text));
}
// create default export to show story
export default {
    title: 'Example/UI/Buttons',
    component: Button,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        themeColor: {
            options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'gray'],
            control: { type: 'select' },
        },
        type: {
            options: ['icon', 'text', 'outline', 'default'],
            control: { type: 'radio' },
        },
        size: {
            options: ['btn-sm', 'btn-lg', 'default'],
            control: { type: 'radio' },
        },
        disable: {
            options: ['default', 'disabled'],
            control: { type: 'radio' },
        },
    },
};
// create template to create stories for multiple buttons if nedded
// eslint-disable-next-line react/function-component-definition
const Template = (args) => {
    return React.createElement(Button, { ...args });
};
// create story for single button
export const ButtonStory = Template.bind({});
ButtonStory.args = {
    text: 'Test Button',
    themeColor: 'primary',
    icon: 'fas fa-plus',
    disable: 'default',
    type: 'default',
    size: 'default',
};
ButtonStory.parameters = {
    backgrounds: { default: 'light' },
    docs: {
        // change source in documentation to display code for button
        transformSource: (src) => {
            // src contains string of call to Button component from above, using regex to parse parameters and return nice code for button
            const varRegex = /\w+(?=(\s)*(=))/g;
            const valueRegex = /(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/g;
            const varArr = src.match(varRegex);
            const valueArr = src.match(valueRegex);
            const props = {};
            for (const i in varArr) {
                if (varArr[i] && valueArr[i])
                    props[varArr[i]] = valueArr[i];
            }
            return `
      <button type="button" className="btn${props.type && props.type !== 'default' ? `-${props.type}` : ''}${props.themeColor ? `-${props.themeColor}` : ''}${props.size && props.size !== 'default' ? ` ${props.size}` : ''}${props.disable && props.disable !== 'default' ? ` ${props.disable}` : ''}">
    ${props.icon ? `<i className={${props.icon} ${props.text ? 'me-2' : ''}} />\n    ${props.text}` : `${props.text}`}
</button>
      `;
        },
        page: () => (React.createElement(React.Fragment, null,
            React.createElement(Title, null),
            React.createElement(Subtitle, null, "Configure Button"),
            React.createElement(Primary, null),
            React.createElement(ArgsTable, { story: PRIMARY_STORY }),
            React.createElement(Stories, null),
            React.createElement(Subtitle, null, "Documentation"),
            React.createElement(Description, null, "An in depth documentation about styling of Buttons can be found in the style guid: https://docs.google.com/document/d/1O3SX49CRacjR2WyteFByPO8rKrFYklh7YJ5FsaBjuDQ/edit#heading=h.h4bfja47lkm7"),
            React.createElement(Description, null, "The button element can be styled with the following properties:"),
            React.createElement(Description, { markdown: "\n        - Theme Color: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `gray`" }),
            React.createElement(Description, { markdown: "- Type: `icon`, `text`, `outline`, `default` (not specifying a type leads to `default`)" }),
            React.createElement(Description, { markdown: "- Size: `btn-sm`, `btn-lg`, `default` (not specifying a size leads to `default` size)" }),
            React.createElement(Description, { markdown: "- disabled: `disabled`, `default` (not specifying disabled leads to `default`)" }),
            React.createElement(Description, { markdown: "- icon: icons can be added in front of buttons" }))),
    },
};
//# sourceMappingURL=Button.stories.js.map