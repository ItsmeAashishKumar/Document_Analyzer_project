from dataclasses import dataclass
from typing import Callable, Union

@dataclass
class PIIPattern:
    name: str
    pattern: str
    replacement: Union[str, Callable]
    description: str
