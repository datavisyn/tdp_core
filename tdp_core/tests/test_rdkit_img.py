from hashlib import sha3_256
from urllib.parse import quote

import pytest

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


def hash_compare(svg, expected):
    assert sha3_256(svg).hexdigest() == expected


@pytest.mark.parametrize("s", ["H", "He"])
def test_invalid(client, s):
    """A single H atom isn't a valid molecule"""
    res = client.get(f"/api/image/{s}")
    assert res.status_code == 422


@pytest.mark.parametrize("mol, expected", mol_expected.items())
def test_valid(client, mol, expected):
    res = client.get(f"/api/image/{mol}")
    assert res.status_code == 200
    assert res.headers.get("content-type").startswith("image/svg")
    hash_compare(res.content, expected)


def test_align(client):
    res = client.get(f"/api/image/C?align=C")
    hash_compare(res.content, "6d435ada2a36f00980347aef78f309de71544180a293f5970d7e257dd88f9270")


def test_substructure(client):
    res = client.get(f"/api/image/C?substructure=C")
    hash_compare(res.content, "7b22e41b1fdf3385454b6ae2655e13e49436ce9812e7392bbc389f4f149b055c")


def test_murcko(client):
    curcumin = quote("O=C(\\C=C\\c1ccc(O)c(OC)c1)CC(=O)\\C=C\\c2cc(OC)c(O)cc2")
    res = client.get(f"/api/image/C?substructure={curcumin}")
    assert res.status_code == 200
    hash_compare(res.content, "6d435ada2a36f00980347aef78f309de71544180a293f5970d7e257dd88f9270")


@pytest.mark.parametrize("mol, ref, expected", similarity_data)
def test_similarity(client, mol, ref, expected):
    res = client.get(f"/api/image/similarity/{mol}/{ref}")
    assert res.status_code == 200
    hash_compare(res.content, expected)


# MULTI TESTS


def test_maximum_common_substructure(client):
    res = client.post(f"/api/image/mcs", json=["C#CCP", "C=CCO"])
    assert res.status_code == 200
    hash_compare(res.content, "97d425b6bbe74b15f2b72e2fde973b0780f301281b1a7b2ee154bb0f3dd86c20")


def test_substructures(client):
    res = client.post("/api/image/substructures/C", json=["CCC", "[He]", "CC"])
    assert res.status_code == 200
    assert res.json() == {"count": {"CCC": 1, "[He]": 0, "CC": 1}, "valid": {"CCC": True, "[He]": False, "CC": True}}


def test_draw_multi(client):
    res = client.post("/api/image/", json=list(mol_expected.keys()))
    assert res.status_code == 200
    assert set(mol_expected.keys()) == set(res.json().keys())
    for mol, svg in res.json().items():
        hash_compare(svg.encode(), mol_expected[mol])
    print(res.json())
