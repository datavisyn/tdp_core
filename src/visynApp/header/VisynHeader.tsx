import { Header, Group, createStyles, Title, ActionIcon, TextInput, Transition, MantineThemeColors } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { BurgerButton } from './BurgerButton';
import { DatavisynLogo } from './DatavisynLogo';
import { UserAvatar } from './UserAvatar';
import { VisynAppContext } from '../VisynAppContext';

const HEADER_HEIGHT = 50;

const useStyles = createStyles((theme, { color }: { color: keyof MantineThemeColors }) => ({
  grayColor: {
    backgroundColor: theme.colors[color][6],
  },
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'space-between',
  },
  colorWhite: {
    color: 'white',
  },
}));

const cardTransition = {
  in: { opacity: 1, width: '200px' },
  out: { opacity: 0, width: '0px' },
  transitionProperty: 'opacity, width',
};

/**
 *
 * @param projectName Optional name of project to be displayed next to app name.
 * @param dvLogo Optional change of default dv logo as JSX element. If not provided, normal logo will be displayed.
 * @param customerLogo Optional customer logo as JSX element. If not provided, nothing displayed
 * @param burgerMenu Optional JSX Element to be displayed when the burgerMenu is clicked. If not provided, burger menu is hidden.
 * @param userName Optional name to be displayed in a username avatar. Expects a space between names.
 * @param backgroundColor Optional color to be used for the background. This color must match an entry in the mantine theme colors array. Uses the 7th element in the mantine color array
 * @param undoCallback Optional callback functioned which is called when the undo button is clicked. If not given, undo button is not created
 * @param redoCallback Optional callback functioned which is called when the redo button is clicked. If not given, redo button is not created
 * @param searchCallback Optional callback called when the search is changed, passing the current search value. If not given, no search icon is created
 * @returns
 */
export function VisynHeader({
  projectName = null,
  dvLogo = <DatavisynLogo />,
  customerLogo = null,
  burgerMenu = null,
  userMenu = null,
  userName = null,
  backgroundColor = 'gray',
  undoCallback = null,
  redoCallback = null,
  searchCallback = null,
}: {
  projectName?: string;
  dvLogo?: JSX.Element;
  customerLogo?: JSX.Element;
  burgerMenu?: JSX.Element;
  userMenu?: JSX.Element;
  userName?: string;
  backgroundColor?: keyof MantineThemeColors;
  undoCallback?: () => void;
  redoCallback?: () => void;
  searchCallback?: (s: string) => void;
}) {
  const { appName } = React.useContext(VisynAppContext);
  const { classes } = useStyles({ color: backgroundColor });

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');

  const onSearch = useCallback(
    (event) => {
      setSearchString(event.currentTarget.value);
      searchCallback(event.currentTarget.value);
    },
    [searchCallback],
  );

  return (
    <Header height={HEADER_HEIGHT} className={classes.grayColor}>
      <Group grow pl={10} pr={10} className={classes.inner}>
        <Group>
          {burgerMenu ? <BurgerButton menu={burgerMenu} /> : null}
          {undoCallback ? (
            <ActionIcon className={classes.colorWhite} variant="transparent" onClick={undoCallback}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </ActionIcon>
          ) : null}
          {redoCallback ? (
            <ActionIcon className={classes.colorWhite} variant="transparent" onClick={redoCallback}>
              <FontAwesomeIcon icon={faArrowRight} size="lg" />
            </ActionIcon>
          ) : null}
          {searchCallback ? (
            <>
              <ActionIcon className={classes.colorWhite} variant="transparent" onClick={() => setIsSearching(!isSearching)}>
                <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" />
              </ActionIcon>
              <Transition mounted={isSearching} transition={cardTransition} duration={400} timingFunction="ease">
                {(styles) => <TextInput variant="filled" style={styles} placeholder="Search" value={searchString} onChange={onSearch} />}
              </Transition>
            </>
          ) : null}
        </Group>
        <Group position="center">
          <Title order={3} className={classes.colorWhite}>
            {appName}
          </Title>
          <Title order={6} className={classes.colorWhite}>
            {projectName}
          </Title>
        </Group>

        <Group position="right">
          {customerLogo || null}
          {dvLogo}
          {userName ? <UserAvatar menu={userMenu} userName={userName} color={backgroundColor} /> : null}
        </Group>
      </Group>
    </Header>
  );
}
