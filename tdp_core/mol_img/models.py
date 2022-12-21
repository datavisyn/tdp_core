from typing import Dict, Optional

from pydantic import BaseModel
from rdkit.Chem import Mol, MolFromSmarts, MolFromSmiles  # type: ignore
from starlette.responses import Response


class SmilesMolecule(str):
    """We can't directly extend mol, as this would break swagger"""

    parsers = [MolFromSmiles]
    _mol: Mol

    @property
    def mol(self):
        return self._mol

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value: Optional[str]) -> "SmilesMolecule":
        for parser in cls.parsers:
            mol = parser(value)
            if mol:
                sm = SmilesMolecule(value)
                sm._mol = mol
                return sm
        else:
            raise ValueError("Unparsable smiles")


class SmilesSmartsMolecule(SmilesMolecule):
    """Try parings smiles first, then smarts"""

    parsers = [MolFromSmiles, MolFromSmarts]


class SvgResponse(Response):
    media_type = "image/svg+xml"


class SubstructuresResponse(BaseModel):
    count: Dict[str, int] = dict()
    valid: Dict[str, bool] = dict()
