import { Avatar, Menu } from '@mantine/core';
import React from 'react';

export function UserAvatar({ menu, userName, color }: { menu: JSX.Element; userName: string; color: string }) {
  return (
    <Menu shadow="md" data-testid="visyn-user-avatar">
      <Menu.Target>
        <Avatar role="button" color={color} radius="xl">
          {userName
            .split(' ')
            .map((name) => name[0])
            .slice(0, 3)
            .join('')
            .toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>{menu}</Menu.Dropdown>
    </Menu>
  );
}
