import React from 'react';
import { ComponentStory } from '@storybook/react';
import { Button } from '../buttons/Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Styles/Buttons',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: {
      options: ['bg-light', 'bg-dark'],
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
ButtonStory.args = {
  backgroundColor: 'bg-light',
  text: 'Test Button',
  themeColor: 'primary',
  type: 'normal',
};
