from hashlib import sha3_256

import pytest
from starlette.testclient import TestClient

mol_expected = {
    "C": "6d435ada2a36f00980347aef78f309de71544180a293f5970d7e257dd88f9270",
    "O": "0db87f49c83caba8c7f7ca36f3128f929590537d92678ced396afb4c6201ba2d",
    "OO": "fc1504931d7fde7530be739c2d4cc5083a2a77921a9b6e02df86a11761336d17",
    "[He]": "502933d4a899062be2c1aae6d14552e79a0baa8e5af349d286fdf0a8deb3a4e8",
}

similarity_data = [
    ["CC", "CCCC", "0060b251631425116dac5a98b2db41b69247fe938141cd8e8204f74af2c8ee99"],
    ["CCCC", "CC", "0c4e2d35451f1aea4c660b38e6e1cddb6ed2361f2ff35efda24bd472244e08c7"],
]

mcs_data = {
    "73e4c61270b280938b647dbad15552167f8cef259f5fc0c6f30a291c787d3b31": ["C1COCCO1", "CC(COC)OC", "CC1(OCCO1)C", "CCCCCCCO", "CCCCCCO"],
    "97d425b6bbe74b15f2b72e2fde973b0780f301281b1a7b2ee154bb0f3dd86c20": ["C#CCP", "C=CCO"],
}


def hash_compare(svg, expected):
    assert sha3_256(svg).hexdigest() == expected


@pytest.mark.parametrize("structure", ["H", "He"])
def test_invalid(client: TestClient, structure):
    """A single H atom isn't a valid molecule"""
    res = client.get("/api/rdkit/", params={"structure": structure})
    assert res.status_code == 422


@pytest.mark.parametrize("structure, expected", mol_expected.items())
def test_valid(client: TestClient, structure, expected):
    res = client.get("/api/rdkit/", params={"structure": structure})
    assert res.status_code == 200
    assert res.headers.get("content-type").startswith("image/svg")
    hash_compare(res.content, expected)


def test_align(client: TestClient):
    res = client.get("/api/rdkit/", params={"structure": "C", "align": "C"})
    hash_compare(res.content, "6d435ada2a36f00980347aef78f309de71544180a293f5970d7e257dd88f9270")


def test_substructure(client: TestClient):
    res = client.get("/api/rdkit/", params={"structure": "C", "substructure": "C"})
    hash_compare(res.content, "715c3f878882d5190eae7ec84b3cf937456f2840618256994fc6b2e9d02498ab")


def test_murcko(client: TestClient):
    curcumin = "O=C(\\C=C\\c1ccc(O)c(OC)c1)CC(=O)\\C=C\\c2cc(OC)c(O)cc2"
    res = client.get("/api/rdkit/murcko/", params={"structure": curcumin})
    assert res.status_code == 200
    hash_compare(res.content, "5ef9373dd8bcf049a3632968774345527bab7ba757da1eaab943bccfe2ce7e32")


@pytest.mark.parametrize("mol, ref, expected", similarity_data)
def test_similarity(client: TestClient, mol, ref, expected):
    res = client.get("/api/rdkit/similarity/", params={"structure": mol, "reference": ref})
    assert res.status_code == 200
    hash_compare(res.content, expected)


# MULTI TESTS


def test_maximum_common_substructure(client: TestClient):
    res = client.post("/api/rdkit/mcs/", json=["C#CCP", "C=CCO"])
    assert res.status_code == 200
    hash_compare(res.content, "94f655f787f55ebdf8bf1b85a63ed50652969ce718ffeb89a6289e739b078e3d")


def test_maximum_common_substructure_inconsistent(client: TestClient):
    """This method sometimes returns None -> 500 and sometimes a questionmark"""
    res = client.post("/api/rdkit/mcs/", json=["C1COCCO1", "CC(COC)OC", "CC1(OCCO1)C", "CCCCCCCO", "CCCCCCO"])
    print(res.content)
    if res.status_code == 200:
        hash_compare(res.content, "73e4c61270b280938b647dbad15552167f8cef259f5fc0c6f30a291c787d3b31")
    else:
        assert res.status_code == 204 and res.content == b"null"


def test_substructures(client: TestClient):
    res = client.post("/api/rdkit/substructures/", params={"substructure": "C"}, json=["CCC", "[He]", "CC"])
    assert res.status_code == 200
    assert res.json() == {"count": {"CCC": 1, "[He]": 0, "CC": 1}, "valid": {"CCC": True, "[He]": False, "CC": True}}


def test_draw_multi(client: TestClient):
    res = client.post("/api/rdkit/", json=list(mol_expected.keys()))
    assert res.status_code == 200
    assert set(mol_expected.keys()) == set(res.json().keys())
    for mol, svg in res.json().items():
        hash_compare(svg.encode(), mol_expected[mol])
