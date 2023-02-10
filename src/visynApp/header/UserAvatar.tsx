import { Avatar, Menu, Modal } from '@mantine/core';
import React from 'react';
import { LoginUtils } from '../../base/LoginUtils';
import { useVisynAppContext } from '../VisynAppContext';
import { AboutAppModal, IAboutAppModalConfig } from './AboutAppModal';

export function UserAvatar({
  menu,
  user,
  color,
  dvLogo,
  aboutAppModal,
}: {
  menu: JSX.Element;
  user: string;
  color: string;
  dvLogo: JSX.Element;
  aboutAppModal?: JSX.Element | IAboutAppModalConfig;
}) {
  const { appName } = useVisynAppContext();
  const [showAboutModal, setShowAboutModal] = React.useState(false);

  return (
    <>
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
              <Menu.Divider />
              <Menu.Item onClick={() => setShowAboutModal(true)}>About {appName}</Menu.Item>
              <Menu.Divider />
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
      {aboutAppModal && React.isValidElement(aboutAppModal) ? (
        aboutAppModal
      ) : (
        <AboutAppModal
          opened={showAboutModal}
          onClose={() => setShowAboutModal(false)}
          dvLogo={dvLogo}
          customerLogo={(aboutAppModal as IAboutAppModalConfig)?.customerLogo}
          content={(aboutAppModal as IAboutAppModalConfig)?.content}
          size={(aboutAppModal as IAboutAppModalConfig)?.size}
        />
      )}
    </>
  );
}
