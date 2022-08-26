from typing import List, Optional

from rdkit.Chem import Mol, TemplateAlign, rdFMCS


def maximum_common_substructure_query_mol(mols: List[Mol]) -> Optional[Mol]:
    """https://www.rdkit.org/docs/GettingStartedInPython.html#maximum-common-substructure"""
    return rdFMCS.FindMCS(mols, matchValences=True, ringMatchesRingOnly=True, completeRingsOnly=True).queryMol


def aligned(structure, align):
    """modifies the passed in structure itself"""
    if not align:
        return None
    TemplateAlign.rdDepictor.Compute2DCoords(structure)
    mcs = maximum_common_substructure_query_mol([structure, align])
    if mcs:
        TemplateAlign.rdDepictor.Compute2DCoords(mcs)
        # this modifies the structure, no return required
        TemplateAlign.AlignMolToTemplate2D(structure, mcs, clearConfs=True)
        # Enable this to show substructore highlights of alignment
        # return mcs
