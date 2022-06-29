from typing import List, Optional, Set

from fastapi import APIRouter, FastAPI

from .models import SmilesMolecule, SmilesSmartsMolecule, SubstructuresResponse, SvgResponse
from .util.draw import draw, draw_similarity
from .util.molecule import aligned, maximum_common_substructure_query_mol, murcko

app = APIRouter()


@app.get("/{structure}", response_class=SvgResponse)
def draw_smiles(structure: SmilesMolecule, substructure: Optional[SmilesMolecule] = None, align: Optional[SmilesMolecule] = None):
    return draw(structure.mol, aligned(structure.mol, align and align.mol) or substructure and substructure.mol)


@app.get("/murcko/{structure}", response_class=SvgResponse)
def draw_murcko(structure: SmilesMolecule):
    """https://www.rdkit.org/docs/GettingStartedInPython.html#murcko-decomposition"""
    return draw(murcko(structure.mol))


@app.get("/similarity/{probe}/{reference}", response_class=SvgResponse)
def draw_molecule_similarity(probe: SmilesMolecule, reference: SmilesMolecule):
    return draw_similarity(probe.mol, reference.mol)


#######################
# Multi mol endpoints #
#######################


@app.post("/mcs", response_class=SvgResponse)
def draw_maximum_common_substructure_molecule(structures: List[SmilesMolecule]):
    unique = [m.mol for m in set(structures)]
    mcs = maximum_common_substructure_query_mol(unique)
    print(mcs)
    return draw(mcs)


@app.post("/substructures/{substructure}")
def substructures_count(structures: Set[SmilesMolecule], substructure: SmilesSmartsMolecule) -> SubstructuresResponse:
    """TODO: maybe put to another file"""
    ssr = SubstructuresResponse()
    for smiles in set(structures):
        ssr.valid[smiles] = smiles.mol.HasSubstructMatch(substructure.mol)
        # returns the indices of molecules matching
        ssr.count[smiles] = len(smiles.mol.GetSubstructMatch(substructure.mol))
    return ssr


@app.post("/")
def multiple_images(structures: Set[SmilesMolecule]):
    return {m: draw(m.mol) for m in structures}


def create_api():
    return app
