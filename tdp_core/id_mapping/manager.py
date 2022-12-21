import logging
from builtins import object, set
from itertools import chain
from typing import List

from .. import manager

_log = logging.getLogger(__name__)


class MappingManager(object):
    """
    Mapping manager creating a graph of all available id-2-id mappings, allowing for transitive id-mappings.
    This graph is traversed via shortest path when mapping from one id-(type) to another.
    """

    def __init__(self, providers):
        self.mappers = {}
        self.paths = {}
        graph = {}
        for (from_idtype, to_idtype, mapper) in providers:
            # generate mapper mapping
            from_mappings = self.mappers.get(from_idtype, {})
            self.mappers[from_idtype] = from_mappings
            to_mappings = from_mappings.get(to_idtype, [])
            from_mappings[to_idtype] = to_mappings
            to_mappings.append(mapper)
            # generate type graph
            from_graph = graph.get(from_idtype, [])
            from_graph.append(to_idtype)
            graph[from_idtype] = from_graph
        # generate path map
        entries = self.known_idtypes()
        for _from in entries:
            # calculate all paths
            all_paths = {_to: self.__find_all_paths(graph, _from, _to) for _to in entries if _to != _from}
            # remove missing paths
            for key, value in list(all_paths.items()):
                if not value:
                    del all_paths[key]
            self.paths[_from] = all_paths

    def known_idtypes(self):
        """
        returns a set of a all known id types in this mapping graph
        :return:
        """
        s = set()
        for from_, v in self.mappers.items():
            s.add(from_)
            for to_ in list(v.keys()):
                s.add(to_)
        return s

    def __find_all_paths(self, graph, start, end, path=[]):
        """
        Returns all possible paths in the graph from start to end
        :return: Array of all possible paths (string arrays) sorted by shortest path first
        """
        path = path + [start]
        if start == end:
            return [path]
        if start not in graph:
            return []
        paths = []
        for node in graph[start]:
            if node not in path:
                newpaths = self.__find_all_paths(graph, node, end, path)
                for newpath in newpaths:
                    paths.append(newpath)
        return sorted(paths, key=len)

    def __resolve_single(self, from_idtype, to_idtype, ids) -> list:
        from_mappings = self.mappers.get(from_idtype, {})
        to_mappings = from_mappings.get(to_idtype, [])
        if not to_mappings:
            _log.warn("cannot find mapping from %s to %s", from_idtype, to_idtype)
            return [None for _ in ids]

        def apply_mapping(mapper, ids: List[str]):
            # Each mapper can define if it preserves the order of the incoming ids.
            if hasattr(mapper, "preserves_order") and mapper.preserves_order:
                return mapper(ids)
            else:
                # If this is not the case, we need to map every single id separately
                return [mapper([id])[0] for id in ids]

        if len(to_mappings) == 1:
            # single mapping no need for merging
            return apply_mapping(to_mappings[0], ids)

        # two way to preserve the order of the results
        r = [[] for _ in ids]
        rset = [set() for _ in ids]
        for mapper in to_mappings:
            mapped_ids = apply_mapping(mapper, ids)
            for mapped_id, rlist, rhash in zip(mapped_ids, r, rset):
                for id in mapped_id:
                    if id not in rhash:
                        rlist.append(id)
                        rhash.add(id)
        return r

    def merge_2d_arrays(self, source, lengths):
        """
        Merges the arrays of the source array according to the lengths array
        For example, [[1], [2], [3]] with lengths [2, 1] becomes [[1, 2], [3]]
        :return: Merged arrays
        """
        if len(lengths) == 0 and len(source) == 0:
            return []
        assert len(lengths) > 0 and min(lengths) >= 1
        assert sum(lengths) == len(source)
        result = []
        i = 0
        for length in lengths:
            next_i = i + length
            result.append(source[i] if length == 1 else list(chain.from_iterable(source[i:next_i])))
            i = next_i
        return result

    def can_map(self, from_idtype, to_idtype):
        return self.paths.get(from_idtype, {}).get(to_idtype)

    def maps_to(self, from_idtype):
        return list(self.paths.get(from_idtype, {}).keys())

    def __call__(self, from_idtype, to_idtype, ids) -> list:
        # If both id types are the same, simply return
        if from_idtype == to_idtype:
            return ids

        # Get stored path instead of calculating them "on the fly"
        # paths = self.__find_all_paths(self.graph, from_idtype, to_idtype)
        paths = self.paths.get(from_idtype, {}).get(to_idtype)

        if not paths:
            _log.warn("Cannot find mapping from %s to %s", from_idtype, to_idtype)
            return [None for _ in ids]

        # Traverse shortest path only for now
        path = paths[0]
        if len(path) < 2:
            _log.warn("Invalid path given: %s", path)
            return [None for _ in ids]

        values = ids
        needs_merging = False
        lengths = []
        # Iterate over from, to tuples
        for i in range(1, len(path)):
            from_type = path[i - 1]
            to_type = path[i]
            result = self.__resolve_single(from_type, to_type, values)

            # Check if needs merging
            if needs_merging:
                result = self.merge_2d_arrays(result, lengths)

            # Return on last iteration
            if i == len(path) - 1:
                return result

            # Otherwise, check if every mapping was 1 to 1
            lengths = [len(x) for x in result]  # type: ignore
            # If any result array is longer than 1, we need to flatten and later merge it
            needs_merging = max(lengths, default=0) > 1
            # Flatten result and assign to values
            values = list(chain.from_iterable(result))
        return result  # type: ignore

    def search(self, from_idtype, to_idtype, query, max_results=None):
        """
        Searches for matches in the names of the given idtype.
        This operation does not resolve transitive mappings.
        :param query:
        :param max_results
        :return:
        """
        from_mappings = self.mappers.get(from_idtype, {})
        to_mappings = from_mappings.get(to_idtype, [])
        to_mappings = [m for m in to_mappings if hasattr(m, "search")]

        if not to_mappings:
            _log.warn("cannot find mapping from %s to %s", from_idtype, to_idtype)
            return []

        if len(to_mappings) == 1:
            # single mapping no need for merging
            return to_mappings[0].search(query, max_results)

        rset = set()
        for mapper in to_mappings:
            results = mapper.search(query, max_results)
            for r in results:
                rset.add(r)
        return list(rset)


def create_id_mapping_manager() -> MappingManager:
    _log.info("Creating mapping_manager")
    # Load mapping providers
    providers = []
    for plugin in manager.registry.list("mapping_provider"):
        providers = providers + list(plugin.load().factory())
    return MappingManager(providers)
