import { Menu } from '@mantine/core';
import * as React from 'react';
import { LoginUtils } from '../base/LoginUtils';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { Vis } from '../vis/Vis';
import { VisynHeader } from '../visynApp';
import { VisynApp } from '../visynApp/VisynApp';
import { VisynAppContext } from '../visynApp/VisynAppContext';

const irisData = fetchIrisData();

export function MainApp() {
  const { user } = React.useContext(VisynAppContext);

  return (
    <VisynApp
      header={
        <VisynHeader
          userMenu={
            user ? (
              <>
                <Menu.Label>Logged in as {user.name}</Menu.Label>
                <Menu.Item
                  onClick={() => {
                    LoginUtils.logout();
                  }}
                >
                  Logout
                </Menu.Item>
              </>
            ) : null
          }
          userName={user ? user.name : null}
          backgroundColor="dark"
        />
      }
      appShellProps={{}}
    >
      {user ? <Vis columns={irisData} /> : null}
    </VisynApp>
  );
}
