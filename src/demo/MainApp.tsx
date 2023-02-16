import { Menu } from '@mantine/core';
import * as React from 'react';
import {
  Vis,
  LoginUtils,
  VisynHeader,
  VisynApp,
  useVisynAppContext,
  ESupportedPlotlyVis,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  IVisConfig,
} from '..';
import { fetchIrisData } from '../vis/stories/fetchIrisData';

const irisData = fetchIrisData();

export function MainApp() {
  const { user } = useVisynAppContext();
  const [visConfig, setVisConfig] = React.useState<IVisConfig>({
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [
      {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
    ],
    color: {
      description: '',
      id: 'species',
      name: 'Species',
    },
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 1,
  });

  return (
    <VisynApp
      header={
        <VisynHeader
          components={{
            userMenu: user ? (
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
            ) : null,
          }}
          backgroundColor="dark"
        />
      }
      appShellProps={{}}
    >
      {user ? <Vis columns={irisData} showSidebarDefault externalConfig={visConfig} setExternalConfig={setVisConfig} /> : null}
    </VisynApp>
  );
}
