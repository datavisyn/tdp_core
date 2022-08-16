/**
 * returns the value of the computed css variable
 * @param name name of the css variable, i.e. visyn-c1, bs-primary, ...
 * @returns the value which is stored in the css variable or undefined if the variable could not be found
 */
export function getCssValue(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}
//# sourceMappingURL=getCssValue.js.map