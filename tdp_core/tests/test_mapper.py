import pytest

from tdp_core.id_mapping.manager import MappingManager


@pytest.fixture(scope="module")
def mapper():
    mapper = MappingManager(
        [
            ("ID1", "ID2", OneToTwoMappingTable("ID1", "ID2")),
            ("ID2", "ID1", TwoToOneMappingTable("ID1", "ID2")),
            ("ID2", "ID3", TwoToOneMappingTable("ID2", "ID3")),
            ("ID3", "ID2", OneToTwoMappingTable("ID3", "ID2")),
            ("ID1", "ID4", OneToTwoMappingTable("ID1", "ID4")),
            ("ID4", "ID1", TwoToOneMappingTable("ID4", "ID1")),
            ("ID3", "ID4", OneToTwoMappingTable("ID3", "ID4")),
            ("ID4", "ID3", TwoToOneMappingTable("ID4", "ID3")),
            ("ID5", "ID6", OneToMoreMappingTable("ID5", "ID6")),
            ("ID6", "ID7", OneToMoreMappingTable("ID6", "ID7")),
        ]
    )
    return mapper


def test_merge_2d_arrays(mapper):
    # Simple cases
    assert mapper.merge_2d_arrays([], []) == []
    assert mapper.merge_2d_arrays([[]], [1]) == [[]]
    assert mapper.merge_2d_arrays([[], []], [2]) == [[]]
    assert mapper.merge_2d_arrays([[], []], [1, 1]) == [[], []]
    # Number cases
    assert mapper.merge_2d_arrays([[1]], [1]) == [[1]]
    assert mapper.merge_2d_arrays([[1], [2]], [2]) == [[1, 2]]
    assert mapper.merge_2d_arrays([[1], [2]], [1, 1]) == [[1], [2]]
    # Nested array cases
    assert mapper.merge_2d_arrays([[[1]]], [1]) == [[[1]]]
    assert mapper.merge_2d_arrays([[1], [[2]]], [2]) == [[1, [2]]]
    # Longer cases
    assert mapper.merge_2d_arrays([[1], [2], [3], [4]], [2, 1, 1]) == [[1, 2], [3], [4]]
    assert mapper.merge_2d_arrays([[1], [2], [3], [4]], [1, 2, 1]) == [[1], [2, 3], [4]]
    assert mapper.merge_2d_arrays([[1], [2], [3], [4]], [1, 1, 2]) == [[1], [2], [3, 4]]
    assert mapper.merge_2d_arrays([[1], [2], [3], [4]], [3, 1]) == [[1, 2, 3], [4]]
    assert mapper.merge_2d_arrays([[1], [2], [3], [4]], [1, 3]) == [[1], [2, 3, 4]]
    assert mapper.merge_2d_arrays([[1], [2], [3], [4]], [4]) == [[1, 2, 3, 4]]


def test_merge_2d_arrays_length_mismatch(mapper):
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([], [1])
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([[]], [])
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([[]], [2])
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([[], []], [1, 2])
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([[], []], [1, 1, 1])


def test_merge_2d_arrays_invalid_length(mapper):
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([[]], [0, 1])
    with pytest.raises(AssertionError):
        mapper.merge_2d_arrays([[]], [-1, 1])


def test_known_idtypes(mapper):
    assert mapper.known_idtypes() == {"ID1", "ID2", "ID3", "ID4", "ID5", "ID6", "ID7"}


def test_maps_to(mapper):
    assert set(mapper.maps_to("ID1")) == {"ID2", "ID3", "ID4"}
    assert set(mapper.maps_to("ID2")) == {"ID1", "ID3", "ID4"}
    assert set(mapper.maps_to("ID3")) == {"ID1", "ID2", "ID4"}
    assert set(mapper.maps_to("ID4")) == {"ID1", "ID2", "ID3"}
    assert set(mapper.maps_to("ID5")) == {"ID6", "ID7"}
    assert set(mapper.maps_to("ID6")) == {"ID7"}


def test_single_mapping(mapper):
    assert mapper("ID1", "ID2", [2]) == [[4]]
    assert mapper("ID1", "ID4", [2]) == [[4]]
    assert mapper("ID2", "ID1", [4]) == [[2]]
    assert mapper("ID4", "ID1", [4]) == [[2]]

    assert mapper("ID1", "ID2", [2, 4]) == [[4], [8]]
    assert mapper("ID1", "ID4", [2, 4]) == [[4], [8]]
    assert mapper("ID2", "ID1", [2, 4]) == [[1], [2]]
    assert mapper("ID4", "ID1", [2, 4]) == [[1], [2]]

    assert mapper("ID5", "ID6", [2, 4]) == [[2, 4, 6], [4, 8, 12]]
    assert mapper("ID6", "ID7", [2, 4, 6]) == [[2, 4, 6], [4, 8, 12], [6, 12, 18]]
    assert mapper("ID6", "ID7", [4, 8, 12]) == [[4, 8, 12], [8, 16, 24], [12, 24, 36]]


def test_transitive_mapping(mapper):
    assert mapper("ID1", "ID3", [2]) == [[2]]
    assert mapper("ID3", "ID1", [2]) == [[2]]


def test_transitive_merge_mapping(mapper):
    assert mapper("ID5", "ID7", [2, 4]) == [[2, 4, 6, 4, 8, 12, 6, 12, 18], [4, 8, 12, 8, 16, 24, 12, 24, 36]]


class OneToOneMappingTable:
    def __init__(self, from_idtype, to_idtype):
        self.from_idtype = from_idtype
        self.to_idtype = to_idtype

    def __call__(self, ids):
        return [[id] for id in ids]


class OneToTwoMappingTable:
    def __init__(self, from_idtype, to_idtype):
        self.from_idtype = from_idtype
        self.to_idtype = to_idtype

    def __call__(self, ids):
        return [[id * 2] for id in ids]


class TwoToOneMappingTable:
    def __init__(self, from_idtype, to_idtype):
        self.from_idtype = from_idtype
        self.to_idtype = to_idtype

    def __call__(self, ids):
        return [[id / 2] for id in ids]


class OneToMoreMappingTable:
    def __init__(self, from_idtype, to_idtype):
        self.from_idtype = from_idtype
        self.to_idtype = to_idtype

    def __call__(self, ids):
        return [[id, id * 2, id * 3] for id in ids]
