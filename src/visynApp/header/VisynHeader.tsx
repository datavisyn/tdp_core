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
  color = 'white',
  backgroundColor = 'dark',
  components,
  undoCallback = null,
  redoCallback = null,
  searchCallback = null,
}: {
  /**
   * Optional color to be used for the background. If it is part of the mantine colors, it uses the primary shade, otherwise it is interpreted as CSS color.
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
    beforeLeft?: JSX.Element;
    burgerMenu?: JSX.Element;
    afterLeft?: JSX.Element;
    beforeTitle?: JSX.Element;
    title?: JSX.Element;
    afterTitle?: JSX.Element;
    beforeRight?: JSX.Element;
    logo?: JSX.Element;
    userAvatar?: JSX.Element;
    userMenu?: JSX.Element;
    afterRight?: JSX.Element;
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
          {components?.burgerMenu ? <BurgerButton menu={components.burgerMenu} /> : null}
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
          {components?.title === undefined ? (
            <Title order={3} weight={100} color={color} truncate>
              {appName}
            </Title>
          ) : (
            components?.title
          )}
          {components?.afterTitle}
        </Group>

        <Group align="center" position="right" noWrap>
          {components?.beforeRight}
          {components?.logo === undefined ? <DatavisynLogo color={backgroundColor === 'white' ? 'black' : 'white'} /> : components?.logo}
          {components?.userAvatar === undefined ? (
            user ? (
              <UserAvatar menu={components?.userMenu} user={user.name} color={backgroundColor} />
            ) : null
          ) : (
            components?.userAvatar
          )}
          {components?.afterRight}
        </Group>
      </Group>
    </Header>
  );
}
