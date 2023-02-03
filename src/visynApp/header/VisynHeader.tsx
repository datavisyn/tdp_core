import { Header, Group, Title, ActionIcon, TextInput, Transition, useMantineTheme, MantineColor } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { BurgerButton } from './BurgerButton';
import { DatavisynLogo } from './DatavisynLogo';
import { UserAvatar } from './UserAvatar';
import { useVisynAppContext } from '../VisynAppContext';

const HEADER_HEIGHT = 50;

const cardTransition = {
  in: { opacity: 1, width: '200px' },
  out: { opacity: 0, width: '0px' },
  transitionProperty: 'opacity, width',
};

export function VisynHeader({
  burgerMenu = null,
  userMenu = null,
  color = 'white',
  backgroundColor = 'dark',
  dvLogo = <DatavisynLogo color={backgroundColor === 'white' ? 'black' : 'white'} />, // TODO: Use d3 to determine the better variant
  components,
  undoCallback = null,
  redoCallback = null,
  searchCallback = null,
}: {
  /**
   * Optional change of default dv logo as JSX element. If not provided, normal logo will be displayed.
   */
  dvLogo?: JSX.Element;
  /**
   * Optional JSX Element to be displayed when the burgerMenu is clicked. If not provided, burger menu is hidden.
   */
  burgerMenu?: JSX.Element;
  userMenu?: JSX.Element;
  /**
   * Optional color to be used for the background. This color must match an entry in the mantine theme colors array. Uses the 7th element in the mantine color array.
   */
  backgroundColor?: MantineColor;
  /**
   * Optional color to be used for the text. This must be in contrast with the given `backgroundColor`.
   */
  color?: MantineColor;
  /**
   * Extension components to be rendered within the header.
   */
  components?: {
    beforeTitle?: JSX.Element;
    title?: JSX.Element;
    afterTitle?: JSX.Element;
    beforeRight?: JSX.Element;
    afterRight?: JSX.Element;
    beforeLeft?: JSX.Element;
    afterLeft?: JSX.Element;
  };
  /**
   * Optional callback functioned which is called when the undo button is clicked. If not given, undo button is not created
   */
  undoCallback?: () => void;
  /**
   * Optional callback functioned which is called when the redo button is clicked. If not given, redo button is not created
   */
  redoCallback?: () => void;
  /**
   * Optional callback called when the search is changed, passing the current search value. If not given, no search icon is created
   * @param s Search string.
   */
  searchCallback?: (s: string) => void;
}) {
  const { appName } = useVisynAppContext();
  const theme = useMantineTheme();
  const { user } = useVisynAppContext();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');

  const onSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.currentTarget.value);
      searchCallback(event.currentTarget.value);
    },
    [searchCallback],
  );

  return (
    <Header height={HEADER_HEIGHT} style={{ backgroundColor: theme.colors[backgroundColor]?.[theme.fn.primaryShade()] || backgroundColor }}>
      <Group
        grow
        pl="sm"
        pr="sm"
        sx={{
          height: HEADER_HEIGHT,
          display: 'flex',
          justifyContent: 'space-between',
        }}
        noWrap
      >
        <Group align="center" position="left" noWrap>
          {components?.beforeLeft}
          {burgerMenu ? <BurgerButton menu={burgerMenu} /> : null}
          {undoCallback ? (
            <ActionIcon color={color} variant="transparent" onClick={undoCallback}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </ActionIcon>
          ) : null}
          {redoCallback ? (
            <ActionIcon color={color} variant="transparent" onClick={redoCallback}>
              <FontAwesomeIcon icon={faArrowRight} size="lg" />
            </ActionIcon>
          ) : null}
          {searchCallback ? (
            <>
              <ActionIcon color={color} variant="transparent" onClick={() => setIsSearching(!isSearching)}>
                <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" />
              </ActionIcon>
              <Transition mounted={isSearching} transition={cardTransition} duration={400} timingFunction="ease">
                {(styles) => <TextInput variant="filled" style={styles} placeholder="Search" value={searchString} onChange={onSearch} />}
              </Transition>
            </>
          ) : null}
          {components?.afterLeft}
        </Group>
        <Group align="center" position="center" noWrap>
          {components?.beforeTitle}
          {components?.title !== undefined ? (
            components?.title
          ) : (
            <Title order={3} weight={100} color={color} truncate>
              {appName}
            </Title>
          )}
          {components?.afterTitle}
        </Group>

        <Group align="center" position="right" noWrap>
          {components?.beforeRight}
          {dvLogo}
          {user ? <UserAvatar menu={userMenu} user={user.name} color={backgroundColor} /> : null}
          {components?.afterRight}
        </Group>
      </Group>
    </Header>
  );
}
