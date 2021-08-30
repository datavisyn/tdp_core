import * as React from 'react';

/**
 * Uses a `React.useRef` to store a given value and update it on every render.
 * @param value Value to be stored and synced.
 * @returns Ref containing the always up-to-date value.
 */
export function useSyncedRef<T>(value: T) {
    const ref = React.useRef<T>(value);
    ref.current = value;
    return ref;
}
