export class BaseUtils {
    // fixes a javascript bug on using "%" with negative numbers
    static mod(n, m) {
        return ((n % m) + m) % m;
    }
    /**
     * generates a random id of the given length
     * @param length length of the id
     * @returns {string}
     */
    static randomId(length = 8) {
        let id = '';
        while (id.length < length) {
            id += Math.random().toString(36).slice(-8);
        }
        return id.substring(0, length);
    }
    /**
     * fixes a given name by converting it to plain camelcase
     * @param name
     * @return {string}
     */
    static fixId(name) {
        // eslint-disable-next-line no-useless-escape
        const clean = name.replace(/[\s!#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~_-]/g, ' ');
        const words = clean.trim().split(/\s+/); // remove heading and trailing spaces and combine multiple one during split
        return words.map((w, i) => (i === 0 ? w[0].toLowerCase() : w[0].toUpperCase()) + w.slice(1)).join('');
    }
    /**
     * create a debounce call, can be called multiple times but only the last one at most delayed by timeToDelay will be executed
     * @param callback
     * @param timeToDelay
     * @return {function(...[any]): undefined}
     */
    static debounce(callback, timeToDelay = 100) {
        let tm = -1;
        return function (...args) {
            if (tm >= 0) {
                window.clearTimeout(tm);
                tm = -1;
            }
            args.unshift(this);
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            tm = window.setTimeout(callback.bind.apply(callback, args), timeToDelay);
        };
    }
    /**
     * computes the absolute offset of the given element
     * @param element
     * @return {{left: number, top: number, width: number, height: number}}
     */
    static offset(element) {
        if (!element) {
            return { left: 0, top: 0, width: 0, height: 0 };
        }
        const obj = element.getBoundingClientRect();
        const w = element.ownerDocument.defaultView;
        return {
            left: obj.left + w.pageXOffset,
            top: obj.top + w.pageYOffset,
            width: obj.width,
            height: obj.height,
        };
    }
    /**
     * returns the bounding box of a given element similar to offset
     * @param element
     * @returns {{x: number, y: number, w: number, h: number}}
     */
    static bounds(element) {
        if (!element) {
            return { x: 0, y: 0, w: 0, h: 0 };
        }
        const obj = element.getBoundingClientRect();
        return {
            x: obj.left,
            y: obj.top,
            w: obj.width,
            h: obj.height,
        };
    }
    /**
     * returns a promise that resolves in the given number of milliseconds
     * @param milliseconds the number of milliseconds to resolve
     */
    static resolveIn(milliseconds) {
        if (milliseconds <= 0) {
            return Promise.resolve(null);
        }
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }
    /**
     * computes the extent [min, max] for the given array, in case of empty array [NaN, NaN] is returned
     * @param arr the array
     * @return {[number,number]} [min, max]
     */
    static extent(arr) {
        let min = NaN;
        let max = NaN;
        arr.forEach((v) => {
            if (Number.isNaN(v)) {
                return;
            }
            if (Number.isNaN(min) || min > v) {
                min = v;
            }
            if (Number.isNaN(max) || min < v) {
                max = v;
            }
        });
        return [min, max];
    }
}
/**
 * Debounces a function returning a promise and properly returns a promise resolving when the function is finally evaluated.
 * See https://github.com/lodash/lodash/issues/4400 for details why lodash#debounce does not work in cases like this.
 * @param callback Function to be debounced.
 * @param wait Wait time in milliseconds.
 */
export function debounceAsync(callback, wait) {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
        return new Promise((resolve) => {
            const timeoutPromise = new Promise((r) => {
                timeoutId = window.setTimeout(r, wait);
            });
            timeoutPromise.then(async () => {
                resolve(await callback(...args));
            });
        });
    };
}
//# sourceMappingURL=BaseUtils.js.map