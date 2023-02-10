import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Menu, Modal, Text } from '@mantine/core';
import { VisynHeader } from './VisynHeader';
import { VisynAppContext } from '../VisynAppContext';
import { IUser } from '../../security';
import caleydoAsCustomerLogo from '../../assets/caleydo_c.svg';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Ui/VisynHeader',
  component: VisynHeader,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof VisynHeader>;

const user: IUser = {
  name: 'Jaimy Peters',
  roles: [],
};

const customerLogo = <img src={caleydoAsCustomerLogo} alt="customer-logo" style={{ height: '24px' }} />;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof VisynHeader> = (args) => {
  const visynAppContextValue = React.useMemo(
    () => ({
      user,
      appName: 'Demo Application',
      clientConfig: {},
    }),
    [],
  );
  return (
    <VisynAppContext.Provider value={visynAppContextValue}>
      <VisynHeader {...args} />
    </VisynAppContext.Provider>
  );
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic = Template.bind({}) as typeof Template;
Basic.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
  },
};

export const CustomerLogo = Template.bind({}) as typeof Template;
CustomerLogo.args = {
  components: {
    beforeRight: customerLogo,
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      customerLogo,
    },
  },
};

export const ProjectName = Template.bind({}) as typeof Template;
ProjectName.args = {
  components: {
    afterTitle: (
      <Text weight={500} size="md" c="white">
        Project A
      </Text>
    ),
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
  },
};

export const BurgerMenu = Template.bind({}) as typeof Template;
BurgerMenu.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
    burgerMenu: (
      <Menu.Dropdown>
        <Menu.Item>Page A</Menu.Item>
        <Menu.Item>Page B</Menu.Item>
        <Menu.Divider />
        <Menu.Item>Page C</Menu.Item>
      </Menu.Dropdown>
    ),
  },
};

// appname should have a link to the homepage to the app
// project name should be in a specific style
