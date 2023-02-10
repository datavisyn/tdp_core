import { Header, Group, Title, ActionIcon, TextInput, Transition, useMantineTheme, createStyles } from '@mantine/core';
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
const useStyles = createStyles(() => ({
    a: {
        '& > a': {
            '&:hover': {
                color: 'currentColor',
            },
        },
    },
}));
export function VisynHeader({ color = 'white', backgroundColor = 'gray', components, undoCallback = null, redoCallback = null, searchCallback = null, }) {
    const { appName, user } = useVisynAppContext();
    const theme = useMantineTheme();
    const { classes } = useStyles();
    const [isSearching, setIsSearching] = useState(false);
    const [searchString, setSearchString] = useState('');
    const onSearch = useCallback((event) => {
        setSearchString(event.currentTarget.value);
        searchCallback(event.currentTarget.value);
    }, [searchCallback]);
    return (React.createElement(Header, { height: HEADER_HEIGHT, style: { backgroundColor: theme.colors[backgroundColor][7] || backgroundColor } },
        React.createElement(Group, { grow: true, pl: "sm", pr: "sm", sx: {
                height: HEADER_HEIGHT,
                display: 'flex',
                justifyContent: 'space-between',
            }, noWrap: true },
            React.createElement(Group, { align: "center", position: "left", noWrap: true },
                components?.beforeLeft,
                components?.burgerMenu ? React.createElement(BurgerButton, { menu: components.burgerMenu }) : null,
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
                components?.title === undefined ? (React.createElement(Title, { className: classes.a, order: 3, weight: 100, color: color, truncate: true }, appName)) : (components?.title),
                components?.afterTitle),
            React.createElement(Group, { align: "center", position: "right", noWrap: true },
                components?.beforeRight,
                components?.logo === undefined ? React.createElement(DatavisynLogo, { color: backgroundColor === 'white' ? 'black' : 'white' }) : components?.logo,
                components?.userAvatar === undefined ? (user ? (React.createElement(UserAvatar, { menu: components?.userMenu, user: user.name, color: backgroundColor, dvLogo: components?.logo === undefined ? React.createElement(DatavisynLogo, { color: "color" }) : components?.logo, aboutAppModal: components?.aboutAppModal })) : null) : (components?.userAvatar),
                components?.afterRight))));
}
//# sourceMappingURL=VisynHeader.js.map