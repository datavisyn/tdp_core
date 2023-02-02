import { Header, Group, createStyles, Title, ActionIcon, TextInput, Transition } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { BurgerButton } from './BurgerButton';
import { DatavisynLogo } from './DatavisynLogo';
import { UserAvatar } from './UserAvatar';
import { VisynAppContext } from '../VisynAppContext';
const HEADER_HEIGHT = 50;
const useStyles = createStyles((theme, { color }) => ({
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
export function VisynHeader({ projectName = null, dvLogo = React.createElement(DatavisynLogo, null), customerLogo = null, burgerMenu = null, userMenu = null, userName = null, backgroundColor = 'gray', undoCallback = null, redoCallback = null, searchCallback = null, }) {
    const { appName } = React.useContext(VisynAppContext);
    const { classes } = useStyles({ color: backgroundColor });
    const [isSearching, setIsSearching] = useState(false);
    const [searchString, setSearchString] = useState('');
    const onSearch = useCallback((event) => {
        setSearchString(event.currentTarget.value);
        searchCallback(event.currentTarget.value);
    }, [searchCallback]);
    return (React.createElement(Header, { height: HEADER_HEIGHT, className: classes.grayColor },
        React.createElement(Group, { grow: true, pl: 10, pr: 10, className: classes.inner },
            React.createElement(Group, null,
                burgerMenu ? React.createElement(BurgerButton, { menu: burgerMenu }) : null,
                undoCallback ? (React.createElement(ActionIcon, { className: classes.colorWhite, variant: "transparent", onClick: undoCallback },
                    React.createElement(FontAwesomeIcon, { icon: faArrowLeft, size: "lg" }))) : null,
                redoCallback ? (React.createElement(ActionIcon, { className: classes.colorWhite, variant: "transparent", onClick: redoCallback },
                    React.createElement(FontAwesomeIcon, { icon: faArrowRight, size: "lg" }))) : null,
                searchCallback ? (React.createElement(React.Fragment, null,
                    React.createElement(ActionIcon, { className: classes.colorWhite, variant: "transparent", onClick: () => setIsSearching(!isSearching) },
                        React.createElement(FontAwesomeIcon, { icon: faMagnifyingGlass, size: "lg" })),
                    React.createElement(Transition, { mounted: isSearching, transition: cardTransition, duration: 400, timingFunction: "ease" }, (styles) => React.createElement(TextInput, { variant: "filled", style: styles, placeholder: "Search", value: searchString, onChange: onSearch })))) : null),
            React.createElement(Group, { position: "center" },
                React.createElement(Title, { order: 3, className: classes.colorWhite }, appName),
                React.createElement(Title, { order: 6, className: classes.colorWhite }, projectName)),
            React.createElement(Group, { position: "right" },
                customerLogo || null,
                dvLogo,
                userName ? React.createElement(UserAvatar, { menu: userMenu, userName: userName, color: backgroundColor }) : null))));
}
//# sourceMappingURL=VisynHeader.js.map