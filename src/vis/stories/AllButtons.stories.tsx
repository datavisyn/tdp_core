import React from 'react';
import { ComponentStory } from '@storybook/react';
import { AllButtons } from '../buttons/AllButtons';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Styles/Buttons',
  component: AllButtons,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof AllButtons> = (args) => {
  return <AllButtons {...args} />;
};

export const AllButtonsStory = Template.bind({}) as typeof Template;
AllButtonsStory.parameters = {
  backgrounds: { default: 'light' },
};
