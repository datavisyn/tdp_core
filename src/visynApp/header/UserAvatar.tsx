import { Avatar, Menu } from '@mantine/core';
import React from 'react';
import { LoginUtils } from '../../base/LoginUtils';

export function UserAvatar({ menu, user, color }: { menu: JSX.Element; user: string; color: string }) {
  return (
    <Menu shadow="md" data-testid="visyn-user-avatar">
      <Menu.Target>
        <Avatar role="button" color={color} radius="xl">
          {user
            .split(' ')
            .map((name) => name[0])
            .slice(0, 3)
            .join('')
            .toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        {menu || (
          <>
            <Menu.Label>Logged in as {user}</Menu.Label>
            <Menu.Item
              onClick={() => {
                LoginUtils.logout();
              }}
            >
              Logout
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
