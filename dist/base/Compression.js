export class Compression {
    /**
     * Removes all ActionNodes from the given path that matches the given function id and key.
     * Only the very last item is kept and all previous ones are removed,
     * independent of intermediate, non-matching items.
     *
     * @param path Array of ActionNodes
     * @param functionId Apply removal only on ActionNodes with the given function id
     * @param toKey Unique key to check the consecutive duplicates
     * @returns A copy of the path which can be mutated in the number of items
     */
    static lastOnly(path, functionId, toKey) {
        const lastOnes = new Map();
        path.forEach((p) => {
            if (p.f_id === functionId) {
                lastOnes.set(toKey(p), p);
            }
        });
        return path.filter((p) => {
            if (p.f_id !== functionId) {
                return true;
            }
            const key = toKey(p);
            // last one remains
            return lastOnes.get(key) === p;
        });
    }
    /**
     * Remove consecutive items from a path array.
     * The removal is only applied on nodes with the given function id
     * and checks the key with the given key function.
     *
     * @param path Array of ActionNodes
     * @param functionId Apply removal only on ActionNodes with the given function id
     * @param toKey Unique key to check the consecutive duplicates
     * @returns A copy of the path which can be mutated in the number of items
     */
    static lastConsecutive(path, functionId, toKey) {
        // recursive function that mutates the input array
        const compress = (arr, len = 0, deletable = false) => {
            if (len < arr.length) {
                if (deletable) {
                    arr.splice(len, 1);
                    len--;
                }
                // TODO: check if this comparison has an error
                // eslint-disable-next-line no-self-compare
                const canDelete = arr[len + 1] && arr[len].f_id === functionId && arr[len + 1].f_id === functionId && toKey(arr[len]) === toKey(arr[len]);
                return compress(arr, len + 1, canDelete);
            }
            return undefined;
        };
        const pathCopy = path.slice(0); // copy path because path is mutated
        pathCopy.reverse(); // reverse array to keep the last consecutive item and remove the first ones
        compress(pathCopy);
        pathCopy.reverse(); // reverse array to return the original order
        return pathCopy;
    }
    static createRemove(path, createFunctionId, removeFunctionId) {
        const r = [];
        // eslint-disable-next-line no-labels
        outer: for (const act of path) {
            if (act.f_id === removeFunctionId) {
                const removed = act.removes[0];
                // removed view delete intermediate change and optional creation
                for (let j = r.length - 1; j >= 0; --j) {
                    // back to forth for better removal
                    const previous = r[j];
                    const { requires } = previous;
                    const usesView = requires.indexOf(removed) >= 0;
                    if (usesView) {
                        r.splice(j, 1);
                    }
                    else if (previous.f_id === createFunctionId && previous.creates[0] === removed) {
                        // found adding remove both
                        r.splice(j, 1);
                        // eslint-disable-next-line no-labels
                        continue outer;
                    }
                }
            }
            r.push(act);
        }
        return r;
    }
}
//# sourceMappingURL=Compression.js.map