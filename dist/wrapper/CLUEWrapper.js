/**
 * provides a template wrapper around an application for including CLUE. Includes the common frame for switching modes, provenance, and story visualizations
 */
/// <amd-dependency path='font-awesome' />
/// <amd-dependency path='bootstrap' />
import { MixedStorageProvenanceGraphManager, ProvenanceGraph } from '../provenance';
import { select } from 'd3';
import { SelectionRecorder } from '../base/Selection';
import { CLUEMode, ButtonModeSelector, ModeWrapper } from '../base/mode';
import { VisLoader } from '../vis/VisLoader';
import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { ProvenanceGraphMenu } from '../menu/ProvenanceGraphMenu';
import { LoginMenu } from '../base/LoginMenu';
import { ACLUEWrapper } from './ACLUEWrapper';
import * as d3 from 'd3';
import { AppHeader, AppHeaderLink } from '../components';
import { BaseUtils, ResolveNow } from '../base';
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
            headerOptions: {}
        };
        BaseUtils.mixin(this.options, options);
        this.build(body, options);
        this.on('jumped_to,loaded_graph', () => this.header.ready());
    }
    buildImpl(body) {
        //create the common header
        const headerOptions = BaseUtils.mixin(this.options.headerOptions, {
            showOptionsLink: true,
            appLink: this.options.appLink
        });
        this.header = AppHeader.create(body.querySelector('div.box'), headerOptions);
        //load all available provenance graphs
        const manager = new MixedStorageProvenanceGraphManager({
            prefix: this.options.id,
            storage: sessionStorage,
            application: this.options.application
        });
        const clueManager = new CLUEGraphManager(manager);
        this.header.wait();
        const _ = new LoginMenu(this.header, {
            loginForm: this.options.loginForm,
            insertIntoHeader: true
        });
        const provenanceMenu = new ProvenanceGraphMenu(clueManager, body, false);
        this.header.insertCustomRightMenu(provenanceMenu.node);
        const phoveaNavbar = document.body.querySelector('.phovea-navbar');
        const modeSelector = phoveaNavbar.appendChild(document.createElement('header'));
        modeSelector.classList.add('clue-modeselector');
        ButtonModeSelector.createButton(modeSelector, {
            size: 'sm'
        });
        this.$main = select(body).select('main');
        const graph = clueManager.list().then((graphs) => {
            provenanceMenu.build(graphs);
            return clueManager.choose(graphs);
        });
        graph.then((graph) => {
            provenanceMenu.setGraph(graph);
            this.$mainRef = graph.findOrAddObject(this.$main, 'Application', 'visual');
            graph.on('sync_start,sync', (event) => {
                select('nav span.glyphicon-cog').classed('fa-spin', event.type !== 'sync');
            });
            if (this.options.recordSelectionTypes) {
                //record selections of the given type
                SelectionRecorder.createSelectionRecorder(graph, this.options.recordSelectionTypes, {
                    filter(idtype) {
                        return idtype && idtype.name[0] !== '_';
                    },
                    animated: this.options.animatedSelections
                });
            }
        });
        const provVis = VisLoader.loadProvenanceGraphVis(graph, body.querySelector('div.content'), {
            thumbnails: this.options.thumbnails,
            provVisCollapsed: this.options.provVisCollapsed
        });
        const storyVis = VisLoader.loadStoryVis(graph, body.querySelector('div.content'), this.$main.node(), {
            thumbnails: this.options.thumbnails
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
            inverse: true
        });
        const $main = d3.select(body).append('main').style('height', '92vh');
        const graph = ProvenanceGraph.createDummy();
        return {
            on: (...args) => 0,
            $main,
            graph: ResolveNow.resolveImmediately(graph),
            jumpToStored: () => 0
        };
    }
}
//# sourceMappingURL=CLUEWrapper.js.map