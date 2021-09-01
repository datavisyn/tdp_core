import * as React from 'react';
/**
 * Uses a `React.useRef` to store a given value and update it on every render.
 * @param value Value to be stored and synced.
 * @returns Ref containing the always up-to-date value.
 */
export function useSyncedRef(value) {
    const ref = React.useRef(value);
    ref.current = value;
    return ref;
}
//# sourceMappingURL=useSyncedRef.js.map