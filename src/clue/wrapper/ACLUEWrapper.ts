import { ModeWrapper, CLUEMode } from '../base';
import { LayoutedProvVis, VerticalStoryVis } from '../provvis';
import { ProvenanceGraph, StateNode, SlideNode } from '../provenance';
import { CLUEGraphManager, IClueState } from '../base/CLUEGraphManager';
import { WrapperUtils } from '../base/WrapperUtils';
import { EP_PHOVEA_CLUE_PROVENANCE_GRAPH, IProvenanceGraphEPDesc, IProvenanceGraphEP } from '../../base/extensions';
import { EventHandler } from '../../base';
import { I18nextManager } from '../../i18n';
import { PluginRegistry } from '../../app';

const getTemplate = () => `<div class="box">
  <div class="content">
    <main data-anchor="main"></main>
    <!--annotation toolbar-->
    <aside class="annotations">
      <div>
        <h2>${I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.annotations')}</h2>
      </div>
      <div class="btn-group" role="group" aria-label="annotations">
        <button class="btn btn-light btn-sm" title="${I18nextManager.getInstance().i18n.t(
          'phovea:clue.ClueWrapper.addTextAnnotation',
        )}" data-ann="text"><i class="fas fa-font"></i>
        </button>
        <button class="btn btn-light btn-sm" title="${I18nextManager.getInstance().i18n.t(
          'phovea:clue.ClueWrapper.addArrow',
        )}" data-ann="arrow"><i class="fas fa-arrow-right"></i>
        </button>
        <button class="btn btn-light btn-sm" title="${I18nextManager.getInstance().i18n.t(
          'phovea:clue.ClueWrapper.addFrame',
        )}" data-ann="frame"><i class="far fa-square"></i>
        </button>
      </div>
    </aside>
  </div>
</div>`;

export interface IACLUEWrapperOptions {
  replaceBody?: boolean;
}

enum EUrlTracking {
  ENABLE,
  DISABLE_JUMPING,
  DISABLE_RESTORING,
}

export abstract class ACLUEWrapper extends EventHandler {
  static readonly EVENT_MODE_CHANGED = 'modeChanged';

  static readonly EVENT_JUMPED_TO = 'jumped_to';

  clueManager: CLUEGraphManager;

  graph: Promise<ProvenanceGraph>;

  private storyVis: () => Promise<VerticalStoryVis>;

  private provVis: () => Promise<LayoutedProvVis>;

  private urlTracking = EUrlTracking.ENABLE;

  protected async build(body: HTMLElement, options: IACLUEWrapperOptions) {
    if (options.replaceBody !== false) {
      body.innerHTML = getTemplate();
    } else {
      body.insertAdjacentHTML('afterbegin', getTemplate());
    }
    WrapperUtils.handleMagicHashElements(body, this);
    const { graph, storyVis, manager, provVis } = this.buildImpl(body);

    this.graph = graph;
    this.clueManager = manager;
    this.storyVis = storyVis;
    this.provVis = provVis;

    this.graph.then((g) => {
      // load registered extensions and pass the ready graph to extension
      PluginRegistry.getInstance()
        .listPlugins(EP_PHOVEA_CLUE_PROVENANCE_GRAPH)
        .forEach((desc: IProvenanceGraphEPDesc) => {
          desc.load().then((plugin: IProvenanceGraphEP) => plugin.factory(g));
        });

      g.on('run_chain', () => {
        if (this.urlTracking === EUrlTracking.ENABLE) {
          this.urlTracking = EUrlTracking.DISABLE_JUMPING;
        }
      });
      g.on('ran_chain', (event: any, state: StateNode) => {
        if (this.urlTracking === EUrlTracking.DISABLE_JUMPING) {
          manager.storedState = state ? state.id : null;
          this.urlTracking = EUrlTracking.ENABLE;
        }
      });
      g.on('switch_state', (event: any, state: StateNode) => {
        if (this.urlTracking === EUrlTracking.ENABLE) {
          manager.storedState = state ? state.id : null;
        }
      });
      g.on('select_slide_selected', (event: any, state: SlideNode) => {
        if (this.urlTracking === EUrlTracking.ENABLE) {
          manager.storedSlide = state ? state.id : null;
        }
      });

      manager.on(CLUEGraphManager.EVENT_EXTERNAL_STATE_CHANGE, (_, state: IClueState) => {
        if (state.graph !== g.desc.id) {
          // switch to a completely different graph -> reload page
          CLUEGraphManager.reloadPage();
        }
        const slide = g.selectedSlides()[0];
        const currentSlide = slide ? slide.id : null;
        if (state.slide != null && currentSlide !== state.slide) {
          return this.jumpToStory(state.slide, false);
        }
        const currentState = g.act ? g.act.id : null;
        if (state.state != null && currentState !== state.state) {
          return this.jumpToState(state.state);
        }
        return undefined;
      });

      WrapperUtils.enableKeyboardShortcuts(g);
      this.handleModeChange();

      this.fire('loaded_graph', g);
    });
  }

  protected abstract buildImpl(body: HTMLElement): {
    graph: Promise<ProvenanceGraph>;
    storyVis: () => Promise<VerticalStoryVis>;
    provVis: () => Promise<LayoutedProvVis>;
    manager: CLUEGraphManager;
  };

  private handleModeChange() {
    const $right = <HTMLElement>document.querySelector('aside.provenance-layout-vis');
    const $rightStory = <HTMLElement>document.querySelector('aside.provenance-story-vis');
    this.propagate(ModeWrapper.getInstance(), 'modeChanged');
    const update = (newMode: CLUEMode) => {
      document.body.dataset.clue = newMode.toString();
      // lazy jquery
      import('jquery').then((jquery) => {
        // $('nav').css('background-color', d3v3.rgb(255 * new_.exploration, 255 * new_.authoring, 255 * new_.presentation).darker().darker().toString());
        if (newMode.presentation > 0.8) {
          $($right).animate({ width: 'hide' }, 'fast');
        } else {
          $($right).animate({ width: 'show' }, 'fast');
          if (this.provVis) {
            this.provVis();
          }
        }
        if (newMode.exploration > 0.8) {
          $($rightStory).animate({ width: 'hide' }, 'fast');
        } else {
          $($rightStory).animate({ width: 'show' }, 'fast');
          if (this.storyVis) {
            this.storyVis();
          }
        }
      });
    };
    ModeWrapper.getInstance().on('modeChanged', (event, newMode) => update(newMode));
    this.fire(ACLUEWrapper.EVENT_MODE_CHANGED, ModeWrapper.getInstance().getMode());
    {
      // no animation initially
      const mode = ModeWrapper.getInstance().getMode();
      document.body.dataset.clue = mode.toString();
      // $('nav').css('background-color', d3v3.rgb(255 * new_.exploration, 255 * new_.authoring, 255 * new_.presentation).darker().darker().toString());
      if (mode.presentation > 0.8) {
        $right.style.display = 'none';
      } else {
        $right.style.display = null;
        if (this.provVis) {
          this.provVis();
        }
      }
      if (mode.exploration > 0.8) {
        $rightStory.style.display = 'none';
      } else {
        $rightStory.style.display = null;
        if (this.storyVis) {
          this.storyVis();
        }
      }
    }
  }

  async nextSlide() {
    if (!this.storyVis) {
      return Promise.reject(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.noPlayerAvailable'));
    }
    const story = await this.storyVis();
    return story.player.forward();
  }

  async previousSlide() {
    if (!this.storyVis) {
      return Promise.reject(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.noPlayerAvailable'));
    }
    const story = await this.storyVis();
    return story.player.backward();
  }

  async jumpToStory(story: number, autoPlay = this.clueManager.isAutoPlay) {
    console.log(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.jumpToStoredStory'), story);
    if (!this.storyVis) {
      return Promise.reject(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.noPlayerAvailable'));
    }
    const graph = await this.graph;
    const storyVis = await this.storyVis();
    const s = graph.getSlideById(story);
    if (s) {
      this.urlTracking = EUrlTracking.DISABLE_RESTORING;
      storyVis.switchTo(s);
      if (autoPlay) {
        storyVis.player.start();
      } else {
        await storyVis.player.render(s);
      }
      this.urlTracking = EUrlTracking.ENABLE;
      this.clueManager.storedState = graph.act.id;
      this.clueManager.storedSlide = s.id;
      this.fire(ACLUEWrapper.EVENT_JUMPED_TO, s);
      return this;
    }
    this.fire(ACLUEWrapper.EVENT_JUMPED_TO, null);
    return Promise.reject(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.storyNotFound'));
  }

  async jumpToState(state: number) {
    console.log(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.jumpToStoredState'), state);
    const graph = await this.graph;
    const s = graph.getStateById(state);
    if (s) {
      console.log(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.jumpToStored'), s.id);
      this.urlTracking = EUrlTracking.DISABLE_RESTORING;
      await graph.jumpTo(s);
      this.urlTracking = EUrlTracking.ENABLE;
      this.clueManager.storedState = graph.act.id;
      console.log(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.jumpedToStored'), s.id);
      this.fire(ACLUEWrapper.EVENT_JUMPED_TO, s);
      return this;
    }
    this.fire(ACLUEWrapper.EVENT_JUMPED_TO, null);
    return Promise.reject(I18nextManager.getInstance().i18n.t('phovea:clue.ClueWrapper.stateNotFound'));
  }

  jumpToStored() {
    // jump to stored state
    const targetStory = this.clueManager.storedSlide;
    if (targetStory !== null) {
      return this.jumpToStory(targetStory);
    }
    const targetState = this.clueManager.storedState;
    if (targetState !== null) {
      return this.jumpToState(targetState);
    }
    this.fire(ACLUEWrapper.EVENT_JUMPED_TO, null);
    // no stored state nothing to jump to
    return Promise.resolve(this);
  }

  jumpToStoredOrLastState() {
    // jump to stored state
    const targetStory = this.clueManager.storedSlide;
    if (targetStory !== null) {
      return this.jumpToStory(targetStory);
    }
    const targetState = this.clueManager.storedState;
    if (targetState !== null) {
      return this.jumpToState(targetState);
    }

    return this.graph.then((graph) => {
      const maxId = Math.max(...graph.states.map((s) => s.id));
      return this.jumpToState(maxId);
    });
  }
}
