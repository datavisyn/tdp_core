import React from 'react';
import { ComponentStory } from '@storybook/react';
import { Title, Subtitle, Description, Primary, ArgsTable, Stories, PRIMARY_STORY } from '@storybook/addon-docs';

// Create function for displaying a button with all customization options
type ThemeColorTypes = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'gray';
function Button({
  themeColor,
  type,
  text,
  size,
  icon,
  disable,
}: {
  themeColor: ThemeColorTypes;
  type?: 'icon' | 'text' | 'outline' | 'default';
  size?: 'btn-sm' | 'btn-lg' | 'default';
  text: string | null;
  icon: string;
  disable: 'default' | 'disabled';
}) {
  return (
    <button
      type="button"
      className={`btn btn${type !== 'default' ? `-${type}` : ''}-${themeColor} ${size !== 'default' && size} ${disable !== 'default' && disable} `}
    >
      {icon && <i className={`${icon} ${text ? 'me-2' : ''}`} />}
      {text}
    </button>
  );
}

// create default export to show story
export default {
  title: 'UI/Buttons',
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
const Template: ComponentStory<typeof Button> = (args) => {
  return <Button {...args} />;
};

// create story for single button
export const ButtonStory = Template.bind({}) as typeof Template;

ButtonStory.args = {
  text: 'Test Button',
  themeColor: 'primary',
  icon: 'fas fa-plus',
  disable: 'default',
  type: 'default',
  size: 'default',
};

interface Iprops {
  text?: string;
  themeColor?: string;
  type?: string;
  size?: string;
  disable?: string;
  icon?: string;
}

ButtonStory.parameters = {
  backgrounds: { default: 'light' },
  docs: {
    // change source in documentation to display code for button
    transformSource: (src: string) => {
      // src contains string of call to Button component from above, using regex to parse parameters and return nice code for button
      const varRegex = /\w+(?=(\s)*(=))/g;
      const valueRegex = /(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/g;

      const varArr = src.match(varRegex);
      const valueArr = src.match(valueRegex);

      const props: Iprops = {};
      for (const i in varArr) {
        if (varArr[i] && valueArr[i]) props[varArr[i]] = valueArr[i];
      }

      return `
      <button type="button" className="btn${props.type && props.type !== 'default' ? `-${props.type}` : ''}${props.themeColor ? `-${props.themeColor}` : ''}${
        props.size && props.size !== 'default' ? ` ${props.size}` : ''
      }${props.disable && props.disable !== 'default' ? ` ${props.disable}` : ''}">
    ${props.icon ? `<i className={${props.icon} ${props.text ? 'me-2' : ''}} />\n    ${props.text}` : `${props.text}`}
</button>
      `;
    },
    page: () => (
      <>
        <Title />
        <Subtitle>Configure Button</Subtitle>
        <Primary />
        <ArgsTable story={PRIMARY_STORY} />
        <Stories />
        <Subtitle>Documentation</Subtitle>
        <Description>
          An in depth documentation about styling of Buttons can be found in the style guid:
          https://docs.google.com/document/d/1O3SX49CRacjR2WyteFByPO8rKrFYklh7YJ5FsaBjuDQ/edit#heading=h.h4bfja47lkm7
        </Description>
        <Description>The button element can be styled with the following properties:</Description>
        <Description
          markdown="
        - Theme Color: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `gray`"
        />
        <Description markdown="- Type: `icon`, `text`, `outline`, `default` (not specifying a type leads to `default`)" />
        <Description markdown="- Size: `btn-sm`, `btn-lg`, `default` (not specifying a size leads to `default` size)" />
        <Description markdown="- disabled: `disabled`, `default` (not specifying disabled leads to `default`)" />
        <Description markdown="- icon: icons can be added in front of buttons" />
      </>
    ),
  },
};
