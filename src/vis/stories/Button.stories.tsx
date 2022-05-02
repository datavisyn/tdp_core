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
}: {
  themeColor: ThemeColorTypes;
  type?: 'icon' | 'text' | 'outline' | null;
  size?: 'btn-sm' | 'btn-lg' | null;
  text: string | null;
  addIcon: boolean;
}) {
  return (
    <button type="button" className={`btn btn${type ? `-${type}` : ''}-${themeColor} ${size || ''}`}>
      {addIcon && <i className="fas fa-plus me-1" />}
      {text}
    </button>
  );
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
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
      options: ['icon', 'text', 'outline', null],
      control: { type: 'radio' },
    },
    size: {
      options: ['btn-sm', 'btn-lg', null],
      control: { type: 'radio' },
    },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Button> = (args) => {
  return <Button {...args} />;
};

export const ButtonStory = Template.bind({}) as typeof Template;
ButtonStory.parameters = {
  backgrounds: { default: 'light' },
};

ButtonStory.args = {
  text: 'Test Button',
  themeColor: 'primary',
  addIcon: false,
};
