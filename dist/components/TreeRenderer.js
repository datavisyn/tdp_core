import * as React from 'react';
import { BaseUtils } from '../base/BaseUtils';
import { ViewUtils } from '../views/ViewUtils';
// convert a view plugin description (i.e. of detail views) to the form we need for the renderer
export function viewPluginDescToTreeElementHelper(views, openGroups = []) {
    const normalizedGroups = openGroups.map((g) => g.toLowerCase());
    return ViewUtils.groupByCategory(views).map((g) => ({
        name: g.name,
        items: g.views.map((v) => ({
            name: v.name,
            group: v.group.name,
            id: v.id,
        })),
        defaultOpen: normalizedGroups.includes(g.name.toLowerCase()),
    }));
}
function inputNameArrayConventionForm(name) {
    return name.endsWith('[]') ? name : `${name}[]`;
}
function GroupHeader(props) {
    return (React.createElement("header", { className: props.defaultOpen ? '' : 'collapsed', "data-bs-toggle": "collapse", "data-bs-target": `#collapse-${props.index}-${props.randomIdSuffix}`, "data-group": props.name, "aria-expanded": "true", "aria-controls": `collapse-${props.index}` },
        React.createElement("h6", { className: "mt-1 mb-1" }, props.name)));
}
// TODO: implement Toolbar
function Toolbar(props) {
    return React.createElement("div", { className: "toolbar" });
}
function Leaf(props) {
    let leaf = (React.createElement("a", { href: props.getItemURL(props.element.id), title: props.element.name, onClick: (e) => props.action(e, props.element) },
        React.createElement("span", null, props.element.name)));
    if (props.selection.isSelectable) {
        leaf = (React.createElement("div", { className: "form-check" },
            React.createElement("input", { className: "form-check-input", id: "treeRenderer_checkbox_1", type: "checkbox", checked: props.isSelected, disabled: props.readOnly, onChange: (e) => props.selectionChanged && props.selectionChanged(e.target.checked), value: props.element.id, name: inputNameArrayConventionForm(props.selection.inputNameAttribute) }),
            React.createElement("label", { className: "form-check-label", htmlFor: "treeRenderer_checkbox_1" }, props.element.name)));
    }
    return (React.createElement("li", { className: "dashboard-node item", "data-state": props.isActive ? 'active' : '' },
        leaf,
        React.createElement(Toolbar, null)));
}
export class TreeRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.handleItemClick = (e, item) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({
                activeElement: item,
            });
            this.props.itemAction(item);
        };
        this.handleSelectionChanged = (item, group, selected) => {
            if (this.props.itemSelectAction) {
                this.props.itemSelectAction(item, group, selected);
            }
            if (this.props.selectionChanged) {
                this.props.selectionChanged(this.state.selectedElements);
            }
        };
        this.setSelectedIds = (itemIds = []) => {
            const { groups } = this.props;
            this.setState({
                selectedElements: groups
                    .map((group) => group.items)
                    .reduce((acc, val) => acc.concat(val), [])
                    .filter((item) => itemIds.includes(item.id)),
            });
        };
        this.state = {
            activeElement: null,
            selectedElements: [],
        };
    }
    render() {
        const randomIdSuffix = BaseUtils.randomId();
        return (React.createElement("div", { className: "tree-renderer" }, this.props.groups.map((g, i) => {
            return (React.createElement("section", { key: g.name, "data-group": g.name, className: "group" },
                React.createElement(GroupHeader, { name: g.name, defaultOpen: g.defaultOpen, index: i, randomIdSuffix: randomIdSuffix }),
                React.createElement("main", { id: `collapse-${i}-${randomIdSuffix}`, className: `collapse ${g.defaultOpen ? 'in' : ''}`, "aria-labelledby": `heading-${i}` },
                    React.createElement("ul", null, g.items.map((d) => (React.createElement(Leaf, { key: d.name, element: d, readOnly: this.props.readOnly, getItemURL: this.props.getItemURL, isActive: this.state.activeElement === d, isSelected: this.state.selectedElements.includes(d), selection: this.props.selection, action: this.handleItemClick, selectionChanged: (selected) => {
                            const stateChangedCallback = () => this.handleSelectionChanged(d, g, selected);
                            if (selected) {
                                this.setState((prevState) => ({ selectedElements: [...prevState.selectedElements, d] }), stateChangedCallback);
                            }
                            else {
                                this.setState((prevState) => ({ selectedElements: prevState.selectedElements.filter((elem) => elem !== d) }), stateChangedCallback);
                            }
                        } })))))));
        })));
    }
}
TreeRenderer.defaultProps = {
    /**
     * specify if the tree should be rendered as read only
     */
    readOnly: false,
    selection: {
        isSelectable: false,
        inputNameAttribute: 'treeItem[]', // usually an array of items
    },
    securityNotAllowedText: `Not allowed`,
    /**
     * specify the URL when an item is clicked if any
     */
    getItemURL: (item) => '#',
    /**
     * determines what should happen when an item is clicked
     */
    itemAction: (item) => null,
    /**
     * determines what should happen when an items checkbox status is changed
     */
    itemSelectAction: (item, group, selected) => null,
    /**
     * determines what should happen when an items checkbox status is changed
     */
    selectionChanged: (items) => null,
};
//# sourceMappingURL=TreeRenderer.js.map