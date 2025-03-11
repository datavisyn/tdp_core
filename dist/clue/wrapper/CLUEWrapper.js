/**
 * provides a template wrapper around an application for including CLUE. Includes the common frame for switching modes, provenance, and story visualizations
 */
/// <amd-dependency path='font-awesome' />
/// <amd-dependency path='bootstrap' />
import { select } from 'd3v3';
import * as d3v3 from 'd3v3';
import merge from 'lodash/merge';
import { ACLUEWrapper } from './ACLUEWrapper';
import { LoginMenu } from '../../base/LoginMenu';
import { SelectionRecorder } from '../../base/Selection';
import { AppHeader, AppHeaderLink } from '../../components';
import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { ButtonModeSelector, CLUEMode, ModeWrapper } from '../base/mode';
import { MixedStorageProvenanceGraphManager, ProvenanceGraph } from '../provenance';
import { ProvenanceGraphMenu } from '../provenance/ProvenanceGraphMenu';
import { VisLoader } from '../provvis/VisLoader';
export class CLUEWrapper extends ACLUEWrapper {
    constructor(body, options = {}) {
        super();
        this.options = {
            app: 'CLUE',
            application: '/clue',
            id: 'clue',
            recordSelectionTypes: 'selected',
            animatedSelections: false,
            thumbnails: true,
            appLink: new AppHeaderLink('CLUE'),
            provVisCollapsed: false,
            headerOptions: {},
        };
        merge(this.options, options);
        this.build(body, options);
        this.on('jumped_to,loaded_graph', () => this.header.ready());
    }
    buildImpl(body) {
        // create the common header
        const headerOptions = merge(this.options.headerOptions, {
            showOptionsLink: true, // always activate options
            appLink: this.options.appLink,
        });
        this.header = AppHeader.create(body.querySelector('div.box'), headerOptions);
        // load all available provenance graphs
        const manager = new MixedStorageProvenanceGraphManager({
            prefix: this.options.id,
            storage: sessionStorage,
            application: this.options.application,
        });
        const clueManager = new CLUEGraphManager(manager);
        this.header.wait();
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const _ = new LoginMenu(this.header, {
            loginForm: this.options.loginForm,
            insertIntoHeader: true,
        });
        const provenanceMenu = new ProvenanceGraphMenu(clueManager, body, false);
        this.header.insertCustomRightMenu(provenanceMenu.node);
        const phoveaNavbar = document.body.querySelector('.phovea-navbar');
        const modeSelector = phoveaNavbar.appendChild(document.createElement('header'));
        modeSelector.classList.add('clue-modeselector');
        ButtonModeSelector.createButton(modeSelector, {
            size: 'sm',
        });
        this.$main = select(body).select('main');
        const graph = clueManager.list().then((graphs) => {
            provenanceMenu.build(graphs);
            return clueManager.choose(graphs);
        });
        graph.then((g) => {
            provenanceMenu.setGraph(g);
            this.$mainRef = g.findOrAddObject(this.$main, 'Application', 'visual');
            g.on('sync_start,sync', (event) => {
                select('nav span.glyphicon-cog').classed('fa-spin', event.type !== 'sync');
            });
            if (this.options.recordSelectionTypes) {
                // record selections of the given type
                SelectionRecorder.createSelectionRecorder(g, this.options.recordSelectionTypes, {
                    filter(idtype) {
                        return idtype && idtype.name[0] !== '_';
                    },
                    animated: this.options.animatedSelections,
                });
            }
        });
        const provVis = VisLoader.loadProvenanceGraphVis(graph, body.querySelector('div.content'), {
            thumbnails: this.options.thumbnails,
            provVisCollapsed: this.options.provVisCollapsed,
        });
        const storyVis = VisLoader.loadStoryVis(graph, body.querySelector('div.content'), this.$main.node(), {
            thumbnails: this.options.thumbnails,
        });
        return { graph, manager: clueManager, storyVis, provVis };
    }
    reset() {
        this.graph.then((graph) => {
            graph.jumpTo(graph.states[0]).then(() => {
                graph.clear();
                this.$mainRef = graph.findOrAddObject(this.$main, 'Application', 'visual');
                ModeWrapper.getInstance().setMode(CLUEMode.modes.Exploration);
            });
        });
    }
    /**
     * factory method creating a CLUEWrapper instance
     * @param body
     * @param options
     * @returns {CLUEWrapper}
     */
    static createCLUEWrapper(body, options = {}) {
        return new CLUEWrapper(body, options);
    }
    /**
     * factory method creating a CLUEWrapper instance
     * @param body
     * @param options
     * @returns {CLUEWrapper}
     */
    static createWrapperFactory(body, options = {}) {
        AppHeader.create(body, {
            appLink: new AppHeaderLink(options.app || 'Caleydo'),
            inverse: true,
        });
        const $main = d3v3.select(body).append('main').style('height', '92vh');
        const graph = ProvenanceGraph.createDummy();
        return {
            on: (...args) => 0,
            $main,
            graph: Promise.resolve(graph),
            jumpToStored: () => 0,
        };
    }
}
//# sourceMappingURL=CLUEWrapper.js.map