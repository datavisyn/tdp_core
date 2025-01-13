import * as React from 'react';

import { IBaseViewPluginDesc } from 'visyn_core/base';

import { BaseUtils } from '../base/BaseUtils';
import { ViewUtils } from '../views/ViewUtils';

export interface ITreeGroup {
  name: string;
  items: ITreeElement[];
  defaultOpen: boolean;
}

export interface ITreeElement {
  name: string;
  group: string;
  id: string;
}

// convert a view plugin description (i.e. of detail views) to the form we need for the renderer
export function viewPluginDescToTreeElementHelper(views: IBaseViewPluginDesc[], openGroups: string[] = []): ITreeGroup[] {
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

function inputNameArrayConventionForm(name: string): string {
  return name.endsWith('[]') ? name : `${name}[]`;
}

interface IGroupHeaderProps {
  name: string;
  defaultOpen: boolean;
  index: number;
  randomIdSuffix: string;
}

function GroupHeader(props: IGroupHeaderProps) {
  return (
    <header
      className={props.defaultOpen ? '' : 'collapsed'}
      data-bs-toggle="collapse"
      data-bs-target={`#collapse-${props.index}-${props.randomIdSuffix}`}
      data-group={props.name}
      aria-expanded="true"
      aria-controls={`collapse-${props.index}`}
    >
      <h6 className="mt-1 mb-1">{props.name}</h6>
    </header>
  );
}

// TODO: implement Toolbar
function Toolbar(props) {
  return <div className="toolbar" />;
}

interface ILeafProps {
  element: ITreeElement;
  isActive: boolean;
  isSelected: boolean;
  readOnly: boolean;
  selection: {
    isSelectable: boolean;
    inputNameAttribute: string;
  };
  action(e: React.MouseEvent, item: ITreeElement): void;
  getItemURL(id: string): string;
  selectionChanged?(selected: boolean): void;
}

function Leaf(props: ILeafProps): JSX.Element {
  let leaf: JSX.Element = (
    <a href={props.getItemURL(props.element.id)} title={props.element.name} onClick={(e) => props.action(e, props.element)}>
      <span>{props.element.name}</span>
    </a>
  );
  if (props.selection.isSelectable) {
    leaf = (
      <div className="form-check">
        <input
          className="form-check-input"
          id="treeRenderer_checkbox_1"
          type="checkbox"
          checked={props.isSelected}
          disabled={props.readOnly}
          onChange={(e) => props.selectionChanged && props.selectionChanged(e.target.checked)}
          value={props.element.id}
          name={inputNameArrayConventionForm(props.selection.inputNameAttribute)}
        />
        <label className="form-check-label" htmlFor="treeRenderer_checkbox_1">
          {props.element.name}
        </label>
      </div>
    );
  }

  return (
    <li className="dashboard-node item" data-state={props.isActive ? 'active' : ''}>
      {leaf}
      <Toolbar />
    </li>
  );
}

export interface ITreeRendererProps {
  groups: ITreeGroup[];
  selection: {
    isSelectable: boolean;
    inputNameAttribute: string;
  };
  readOnly: boolean;
  activeElement: ITreeElement;
  securityNotAllowedText: string;
  getItemURL(id: string): string;
  itemAction(item: ITreeElement): void;
  itemSelectAction(item: ITreeElement, group: ITreeGroup, selected: boolean): void;
  selectionChanged(items: ITreeElement[]): void;
}

interface ITreeRendererState {
  activeElement: ITreeElement;
  selectedElements: ITreeElement[];
}

export class TreeRenderer extends React.Component<Partial<ITreeRendererProps>, ITreeRendererState> {
  static defaultProps = {
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
    getItemURL: (item: ITreeElement) => '#',

    /**
     * determines what should happen when an item is clicked
     */
    itemAction: (item: ITreeElement) => null,

    /**
     * determines what should happen when an items checkbox status is changed
     */
    itemSelectAction: (item: ITreeElement, group: ITreeGroup, selected: boolean) => null,

    /**
     * determines what should happen when an items checkbox status is changed
     */
    selectionChanged: (items: ITreeElement[]) => null,
  };

  constructor(props) {
    super(props);

    this.state = {
      activeElement: null,
      selectedElements: [],
    };
  }

  handleItemClick = (e: React.MouseEvent, item: ITreeElement) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      activeElement: item,
    });

    this.props.itemAction(item);
  };

  handleSelectionChanged = (item, group, selected) => {
    if (this.props.itemSelectAction) {
      this.props.itemSelectAction(item, group, selected);
    }
    if (this.props.selectionChanged) {
      this.props.selectionChanged(this.state.selectedElements);
    }
  };

  setSelectedIds = (itemIds: string[] = []) => {
    const { groups } = this.props;
    this.setState({
      selectedElements: groups
        .map((group) => group.items)
        .reduce((acc, val) => acc.concat(val), [])
        .filter((item) => itemIds.includes(item.id)),
    });
  };

  render() {
    const randomIdSuffix = BaseUtils.randomId();
    return (
      <div className="tree-renderer">
        {this.props.groups.map((g: ITreeGroup, i: number) => {
          return (
            <section key={g.name} data-group={g.name} className="group">
              <GroupHeader name={g.name} defaultOpen={g.defaultOpen} index={i} randomIdSuffix={randomIdSuffix} />
              <main id={`collapse-${i}-${randomIdSuffix}`} className={`collapse ${g.defaultOpen ? 'in' : ''}`} aria-labelledby={`heading-${i}`}>
                <ul>
                  {g.items.map((d: ITreeElement) => (
                    <Leaf
                      key={d.name}
                      element={d}
                      readOnly={this.props.readOnly}
                      getItemURL={this.props.getItemURL}
                      isActive={this.state.activeElement === d}
                      isSelected={this.state.selectedElements.includes(d)}
                      selection={this.props.selection}
                      action={this.handleItemClick}
                      selectionChanged={(selected) => {
                        const stateChangedCallback = () => this.handleSelectionChanged(d, g, selected);
                        if (selected) {
                          this.setState((prevState) => ({ selectedElements: [...prevState.selectedElements, d] }), stateChangedCallback);
                        } else {
                          this.setState((prevState) => ({ selectedElements: prevState.selectedElements.filter((elem) => elem !== d) }), stateChangedCallback);
                        }
                      }}
                    />
                  ))}
                </ul>
              </main>
            </section>
          );
        })}
      </div>
    );
  }
}
