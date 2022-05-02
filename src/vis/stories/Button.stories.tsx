import React from 'react';
import { ComponentStory } from '@storybook/react';

// Create function for displaying a button with all customization options
type ThemeColorTypes = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'gray';
function Button({
  themeColor,
  type,
  text,
  size,
  addIcon,
  isDisabled,
}: {
  themeColor: ThemeColorTypes;
  type?: 'icon' | 'text' | 'outline' | 'default';
  size?: 'btn-sm' | 'btn-lg' | 'default';
  text: string | null;
  addIcon: boolean;
  isDisabled: boolean;
}) {
  return (
    <button type="button" className={`btn btn${type !== 'default' ? `-${type}` : ''}-${themeColor} ${size !== 'default' && size} ${isDisabled && 'disabled'}`}>
      {addIcon && <i className={`fas fa-plus ${text ? 'me-2' : ''}`} />}
      {text}
    </button>
  );
}

// create default export to show story
export default {
  title: 'Example/Styles/Buttons',
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
  addIcon: false,
  isDisabled: false,
  type: 'default',
  size: 'default',
};

interface Iprops {
  text?: string;
  themeColor?: string;
  type?: string;
}

ButtonStory.parameters = {
  backgrounds: { default: 'light' },
  docs: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformSource: (src: string, _: unknown) => {
      const varRegex = /\w+(?=(\s)*(=))/g;
      const valueRegex = /(?<=(=)[\s'"]*)\w+/g;

      const varArr = src.match(varRegex);
      const valueArr = src.match(valueRegex);

      const props: Iprops = {};
      // eslint-disable-next-line guard-for-in
      for (const i in varArr) {
        props[varArr[i]] = valueArr[i];
      }

      return `<button type="button" className="btn${props.type ? `-${props.type}` : ''}${props.themeColor ? `-${props.themeColor}` : ''}">
      ${props.text}
      </button>`;
    },
  },
};
