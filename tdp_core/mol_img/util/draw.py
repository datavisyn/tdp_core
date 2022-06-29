from typing import Callable

from rdkit.Chem import Mol
from rdkit.Chem.Draw import SimilarityMaps, rdMolDraw2D
from rdkit.Chem.Draw.rdMolDraw2D import MolDraw2DSVG
from rdkit.Chem.Draw.SimilarityMaps import GetSimilarityMapForFingerprint


def _draw_wrapper(draw_inner: Callable[[MolDraw2DSVG, ...], None]) -> Callable[..., str]:
    """Function wrapper for drawing

    Can annotate any function that takes a drawer as first arg, ignores its return type
    Passes a drawer into annotated function
    Passes on args and kwargs
    Returns a svg as string
    """

    def inner(*args, **kwargs):
        drawer = rdMolDraw2D.MolDraw2DSVG(300, 300)
        _options = drawer.drawOptions()
        _options.clearBackground = False

        draw_inner(drawer, *args, **kwargs)

        drawer.FinishDrawing()
        return drawer.GetDrawingText().replace("<?xml version='1.0' encoding='iso-8859-1'?>\n", "")

    return inner


@_draw_wrapper
def draw(drawer: MolDraw2DSVG, structure, substructure=None):
    highlight_atoms = structure.GetSubstructMatch(substructure) if substructure else None
    drawer.DrawMolecule(structure, highlightAtoms=highlight_atoms, highlightBonds=None, highlightAtomColors=None, highlightBondColors=None)


def _similarity(m, i):
    """https://github.com/rdkit/rdkit/blob/master/rdkit/Chem/Draw/SimilarityMaps.py"""
    return SimilarityMaps.GetMorganFingerprint(m, i, radius=2, fpType="bv")


@_draw_wrapper
def draw_similarity(drawer: MolDraw2DSVG, ref: Mol, probe=Mol, *_):  # ignore args after probe
    GetSimilarityMapForFingerprint(ref, probe, fpFunction=_similarity, draw2d=drawer)
