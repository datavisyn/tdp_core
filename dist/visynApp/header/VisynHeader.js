import { Header, Group, Title, ActionIcon, TextInput, Transition, useMantineTheme } from '@mantine/core';
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
export function VisynHeader({ burgerMenu = null, userMenu = null, color = 'white', backgroundColor = 'dark', dvLogo = React.createElement(DatavisynLogo, { color: backgroundColor === 'white' ? 'black' : 'white' }), // TODO: Use d3 to determine the better variant
components, undoCallback = null, redoCallback = null, searchCallback = null, }) {
    const { appName } = useVisynAppContext();
    const theme = useMantineTheme();
    const { user } = useVisynAppContext();
    const [isSearching, setIsSearching] = useState(false);
    const [searchString, setSearchString] = useState('');
    const onSearch = useCallback((event) => {
        setSearchString(event.currentTarget.value);
        searchCallback(event.currentTarget.value);
    }, [searchCallback]);
    return (React.createElement(Header, { height: HEADER_HEIGHT, style: { backgroundColor: theme.colors[backgroundColor]?.[theme.fn.primaryShade()] || backgroundColor } },
        React.createElement(Group, { grow: true, pl: "sm", pr: "sm", sx: {
                height: HEADER_HEIGHT,
                display: 'flex',
                justifyContent: 'space-between',
            }, noWrap: true },
            React.createElement(Group, { align: "center", position: "left", noWrap: true },
                components?.beforeLeft,
                burgerMenu ? React.createElement(BurgerButton, { menu: burgerMenu }) : null,
                undoCallback ? (React.createElement(ActionIcon, { color: color, variant: "transparent", onClick: undoCallback },
                    React.createElement(FontAwesomeIcon, { icon: faArrowLeft, size: "lg" }))) : null,
                redoCallback ? (React.createElement(ActionIcon, { color: color, variant: "transparent", onClick: redoCallback },
                    React.createElement(FontAwesomeIcon, { icon: faArrowRight, size: "lg" }))) : null,
                searchCallback ? (React.createElement(React.Fragment, null,
                    React.createElement(ActionIcon, { color: color, variant: "transparent", onClick: () => setIsSearching(!isSearching) },
                        React.createElement(FontAwesomeIcon, { icon: faMagnifyingGlass, size: "lg" })),
                    React.createElement(Transition, { mounted: isSearching, transition: cardTransition, duration: 400, timingFunction: "ease" }, (styles) => React.createElement(TextInput, { variant: "filled", style: styles, placeholder: "Search", value: searchString, onChange: onSearch })))) : null,
                components?.afterLeft),
            React.createElement(Group, { align: "center", position: "center", noWrap: true },
                components?.beforeTitle,
                components?.title !== undefined ? (components?.title) : (React.createElement(Title, { order: 3, weight: 100, color: color, truncate: true }, appName)),
                components?.afterTitle),
            React.createElement(Group, { align: "center", position: "right", noWrap: true },
                components?.beforeRight,
                dvLogo,
                user ? React.createElement(UserAvatar, { menu: userMenu, user: user.name, color: backgroundColor }) : null,
                components?.afterRight))));
}
//# sourceMappingURL=VisynHeader.js.map