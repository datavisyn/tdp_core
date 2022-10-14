import { Burger, Menu } from '@mantine/core';
import React from 'react';

export function BurgerButton({ menu }: { menu: JSX.Element }) {
  return (
    <Menu shadow="md">
      <Menu.Target>
        <Burger opened={false} color="white" />
      </Menu.Target>

      <Menu.Dropdown m={10}>{menu}</Menu.Dropdown>
    </Menu>
  );
}
