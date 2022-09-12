import { Avatar, createStyles, Menu } from '@mantine/core';
import React from 'react';

const useStyles = createStyles(() => ({
  cursorPointer: {
    cursor: 'pointer',
  },
}));

export function UserAvatar({ menu, userName, color }: { menu: JSX.Element; userName: string; color: string }) {
  const { classes } = useStyles();
  return (
    <Menu shadow="md">
      <Menu.Target>
        <Avatar className={classes.cursorPointer} color={color} radius="xl">
          {userName
            .split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>{menu}</Menu.Dropdown>
    </Menu>
  );
}
