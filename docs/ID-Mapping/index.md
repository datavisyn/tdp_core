# ID-Mapping introduction

## What is an ID-type?

## Adding a mapping between two ID-types

In your `__init__.py` of your plugin, you can add a new mapping via the `mapping_provider` extension point:

```python
registry.append('mapping_provider', '<my_mapping_provider_id>', '<my_plugin>.my_mapping_provider')
```

The new file `<my_plugin>.my_mapping_provider.py` containing the mapping provider, i.e. a create
function returning mapping tuples (these can be dynamically generated, coming from a db, request, ...):

```python
def create():
  return [
    ('from', 'to', lambda ids: [[f'converted_{id}'] for id in ids]),
    ('to', 'from', lambda ids: [[id[10:]] for id in ids]),
  ]
```

Each tuple is basically `(from_idtype, to_idtype, mapping_function receiving multiple ids returning multiple ids for each id)`. Generally, the first id returned by the mapping function is preferred, however all are returned by default.

!!! note

    By simply defining tuples between id-types, powerful transitive mappings can be resolved by traversing the resulting graph. Visyn Core utilizing such a graph to allow for transitive mappings. 
    
    Example:
    Imagine registering the tuples `IDTypeA -> IDTypeB` and `IDTypeB -> IDTypeC`. With that, the transitive connection between `ÌDTypeA -> IDTypeC` is possible by first executing `IDTypeA -> IDTypeB`, followed by `IDTypeB -> IDTypeC`.

## Mapping between two ID-types

 * You can test it by showing all possible idtypes:

[http://localhost:9000/api/idtype](http://localhost:9000/api/idtype)

 * Or where 'from' can be mapped to:

[http://localhost:9000/api/idtype/from](http://localhost:9000/api/idtype/from)

 * Or mapping 'from' to 'to' for some ids:

[http://localhost:9000/api/idtype/from/to?q=1,2,3](http://localhost:9000/api/idtype/from/to?q=1,2,3)

 * Or mapping 'to' to 'from' for some ids:

[http://localhost:9000/api/idtype/to/from?q=converted_1,converted_2,converted_3](http://localhost:9000/api/idtype/to/from?q=converted_1,converted_2,converted_3)

 * Or mapping 'from' to 'to' for some ids and only wanting the first mapped id each:

[http://localhost:9000/api/idtype/from/to?q=1,2,3&mode=first](http://localhost:9000/api/idtype/from/to?q=1,2,3&mode=first
)
