from tdp_core.utils import to_json


def test_nan_values(app):
    # single variable
    test_var = float("nan")
    # simple list
    test_list_simple = [13, 5, 7, 12, test_var, 22]
    # simple dictionary
    test_dict = {"first": [4, 6, 2, test_var], "second": 3, "third": [test_var, 3, 78, 6, 3, 2]}
    # list that contains dictionary
    test_list_nested = [13, 5, 7, 12, test_dict, 22]
    # convert with to_json
    test_result_simple = to_json({"myNum": test_var})
    test_result_list_simple = to_json({"myNum": test_list_simple})
    test_result_list_nested = to_json({"myNum": test_list_nested})

    # make assertions
    assert test_result_simple == '{"myNum": null}'
    assert test_result_list_simple == '{"myNum": [13, 5, 7, 12, null, 22]}'
    assert (
        test_result_list_nested == '{"myNum": [13, 5, 7, 12, {"first": [4, 6, 2, null], "second": 3, "third": [null, 3, 78, 6, 3, 2]}, 22]}'
    )
