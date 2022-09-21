import { AppShell, AppShellProps } from '@mantine/core';
import * as React from 'react';
import { JSXElementConstructor, ReactElement } from 'react';
import { VisynHeader } from './header/VisynHeader';
import { VisynLoginMenu } from './login/LoginMenu';
import { useInitVisynApp } from './useInitVisynApp';

/**
 *
 * @param header Optional custom header to be passed to the AppShell. If not provided, will use an empty VisynHeader.
 * @param navbar Optional navbar component to be passed to AppShell.
 * @param aside Optional aside component to be passed to AppShell
 * @param footer Optional footer component to be passed to AppShell
 * @param appShellProps Optional props to be passed directly to AppShell
 * @param loginMenu Optional custom login menu. If not passed, will default to the VisynLoginMenu.
 * @param headerHeight Optional height for the header, so that you can properly use 100% inside of your application. Does not set the height of the header, just calculates height elsewhere based on this number
 * @param appName Name of application. Used in default login menu and header.
 * @returns
 */
export function VisynApp({
  header = null,
  navbar = null,
  aside = null,
  footer = null,
  appShellProps = null,
  children,
  appName,
  headerHeight = 0,
  loginMenu = <VisynLoginMenu watch appName={appName} />,
}: {
  header?: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  navbar?: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  aside?: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  footer?: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  appShellProps?: Partial<AppShellProps & React.RefAttributes<HTMLDivElement>>;
  loginMenu?: JSX.Element;
  children?: React.ReactChild;
  headerHeight?: number;
  appName: string;
}) {
  const { status } = useInitVisynApp();

  return status === 'success' ? (
    <AppShell
      styles={{ root: { height: '100%' }, body: { height: `calc(100% - ${headerHeight}px)` }, main: { minHeight: '0px' } }}
      {...appShellProps}
      navbar={navbar}
      aside={aside}
      footer={footer}
      header={header || <VisynHeader appName={appName} />}
    >
      {loginMenu}
      {children}
    </AppShell>
  ) : null;
}
