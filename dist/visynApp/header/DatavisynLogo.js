import * as React from 'react';
import datavisynLogoWhite from '../../assets/datavisyn_white.svg';
import datavisynLogoBlack from '../../assets/datavisyn_black.svg';
import datavisynLogoColor from '../../assets/datavisyn_color.svg';
export function DatavisynLogo({ color }) {
    const source = color === 'white' ? datavisynLogoWhite : color === 'black' ? datavisynLogoBlack : datavisynLogoColor;
    return (React.createElement("a", { href: "https://datavisyn.io/", rel: "noreferrer", target: "_blank" },
        React.createElement("img", { src: source, alt: "logo", style: { height: '24px' } })));
}
//# sourceMappingURL=DatavisynLogo.js.map