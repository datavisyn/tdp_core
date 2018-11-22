import {resolveTours, ITourContext} from './Tour';
import Tour from './Tour';
import {IStep, GLOBAL_EVENT_START_TOUR} from './extensions';
import Popper, {PopperOptions, ReferenceObject} from 'popper.js';
import {AppHeader} from 'phovea_ui/src/header';
import {on} from 'phovea_core/src/event';

const LOCALSTORAGE_FINISHED_TOURS = 'tdpFinishedTours';
const SESSION_STORAGE_MEMORIZED_TOUR = 'tdpMemorizeTour';

export interface ITourManagerContext {
  doc: Document;
  app(): Promise<any>; // the TDP App
  header(): AppHeader;
}

interface IBoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default class TourManager {

  private readonly keyListener = (evt: KeyboardEvent) => {
    if (evt.which === 27) { // esc
      this.hideTour();
    }
  }

  private readonly backdrop: HTMLElement;
  private readonly backdropBlocker: HTMLElement;
  private readonly step: HTMLElement;
  private readonly stepCount: HTMLElement;
  private stepPopper: Popper;
  readonly chooser: HTMLElement;

  private readonly tours: Tour[];
  private readonly tourContext: ITourContext;
  private activeTour: Tour | null = null;
  private activeTourContext: ITourContext | null = null;

  constructor(context: ITourManagerContext) {
    this.tourContext = {
      app: context.app,
      header: context.header,
      steps: (count) => this.setSteps(count),
      hide: (finished?: boolean) => this.hideTour(finished),
      show: (stepNumber, step) => this.showStep(stepNumber, step)
    };

    this.backdrop = context.doc.createElement('div');
    this.backdrop.classList.add('tdp-tour-backdrop');

    this.backdropBlocker = context.doc.createElement('div');
    this.backdropBlocker.classList.add('tdp-tour-backdrop-blocker');
    // this.backdrop.onclick = () => {
    //   this.hideTour();
    // };
    this.step = context.doc.createElement('div');
    this.step.classList.add('tdp-tour-step');
    this.step.dataset.step = '0';
      this.step.innerHTML = `
    <div class="tdp-tour-step-content">
    </div>
    <div class="tdp-tour-step-navigation">
      <div class="tdp-tour-step-dots">
      </div>
      <div class="btn-group" role="group">
        <button type="button" data-switch="--" class="btn-xs btn btn-default"><i class="fa fa-fast-backward"></i> Restart</button>
        <button type="button" data-switch="-" class="btn-xs btn btn-default"><i class="fa fa-step-backward"></i> Back</button>
        <button type="button" data-switch="0" class="btn-xs btn btn-default"><i class="fa fa-stop"></i> Cancel</button>
        <button type="button" data-switch="+" class="btn-xs btn btn-default"><i class="fa fa-step-forward"></i> Next</button>
      </div>
    </div>
    `;

    Array.from(this.step.querySelectorAll('.btn-group button')).forEach((button: HTMLElement) => {
      button.onclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.activeTour) {
          return;
        }
        switch(button.dataset.switch) {
        case '--':
          this.activeTour.jumpTo(0, this.activeTourContext);
          break;
        case '-':
          this.activeTour.previous(this.activeTourContext);
          break;
        case '0':
          this.hideTour();
          break;
        default:
          this.activeTour.next(this.activeTourContext);
          break;
        }
      };
    });

    this.stepCount = context.doc.createElement('div');
    this.stepCount.classList.add('tdp-tour-step-count');

    this.tours = resolveTours();
    this.chooser = context.doc.createElement('div');
    this.chooser.classList.add('modal', 'fade');
    this.chooser.tabIndex = -1;
    this.chooser.setAttribute('role', 'dialog');
    this.chooser.id = `tdpTourChooser`;
    const finished = this.getRememberedFinishedTours();
    this.chooser.innerHTML = `
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
                <h4 class="modal-title">Help Tours</h4>
            </div>
            <div class="modal-body">
              <ul class="fa-ul">
                ${this.tours.filter((d) => d.canBeListed()).map((d) => `<li data-id="${d.id}">
                  <i class="fa-li fa ${finished.has(d.id) ? 'fa-check-square' : 'fa-square-o'}"></i>
                  <a href="#" title="show tour" data-dismiss="modal" data-name="${d.name}">${d.name}</a>
                  ${d.description ? `<p>${d.description}</p>` : ''}
                </li>`).join('')}
              </ul>
            </div>
        </div>
    </div>`;

    Array.from(this.chooser.querySelectorAll('.modal-body a')).forEach((a: HTMLElement) => {
      a.onclick = (evt) => {
        evt.preventDefault();
        const tour = this.tours.find((d) => d.name === a.dataset.name);
        this.showTour(tour);
      };
    });

    document.body.appendChild(this.backdropBlocker);
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.step);
    document.body.appendChild(this.stepCount);
    document.body.appendChild(this.chooser);

    // listen to events
    on(GLOBAL_EVENT_START_TOUR, (_, tourId) => {
      const tour = this.tours.find((d) => d.id === tourId);
      if (tour) {
        this.showTour(tour);
      } else {
        console.warn('invalid tour to start:', tourId, this.tours.map((d) => d.id));
      }
    });

    // auto restart stored multi page tour
    this.continueTour();
  }

  hasTours() {
    return this.tours.some((d) => d.canBeListed());
  }

  private setHighlight(mask: IBoundingBox) {
    // @see http://bennettfeely.com/clippy/ -> select `Frame` example
    this.backdrop.style.clipPath = `polygon(
      0% 0%,
      0% 100%,
      ${mask.left}px 100%,
      ${mask.left}px ${mask.top}px,
      ${mask.left + mask.width}px ${mask.top}px,
      ${mask.left + mask.width}px ${mask.top + mask.height}px,
      ${mask.left}px ${mask.top + mask.height}px,
      ${mask.left}px 100%,
      100% 100%,
      100% 0%
    )`;
  }

  private clearHighlight() {
    this.backdrop.style.clipPath = null;
  }

  private setFocusElement(bb: IBoundingBox) {
    if (!bb) {
      this.clearHighlight();
      return;
    }
    this.setHighlight(bb);
  }

  private setSteps(count: number) {
    const dots = this.step.querySelector<HTMLElement>('.tdp-tour-step-dots');
    dots.innerHTML = '';
    for (let i = 0; i < count; ++i) {
      dots.insertAdjacentHTML('beforeend', `<div title="Jump to step ${i + 1}" data-step="${i}" class="fa fa-circle"></div>`);
    }

    Array.from(this.step.querySelectorAll('.tdp-tour-step-dots div')).forEach((button: HTMLElement) => {
      button.onclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.activeTour) {
          return;
        }
        this.activeTour.jumpTo(parseInt(button.dataset.step, 10), this.activeTourContext);
      };
    });
  }

  private selectHighlight(selector?: string | string[]): ReferenceObject | null {
    if (!selector) {
      return null;
    }
    if (typeof selector === 'string') {
      return this.step.ownerDocument.querySelector(selector);
    }
    const all = (<HTMLElement[]>[]).concat(...selector.map((d) => Array.from(this.step.ownerDocument.querySelectorAll<HTMLElement>(d))));
    if (all.length === 0) {
      return null;
    }
    if (all.length === 1) {
      return all[0];
    }
    // merge to one big bounding box
    const base = all[0].getBoundingClientRect();
    let top = base.top;
    let left = base.left;
    let bottom = base.bottom;
    let right = base.right;
    for (const elem of all) {
      const bb = elem.getBoundingClientRect();
      if (bb.top < top) {
        top = bb.top;
      }
      if (bb.left < left) {
        left = bb.left;
      }
      if (bb.right > right) {
        right = bb.right;
      }
      if (bb.bottom > bottom) {
        bottom = bb.bottom;
      }
    }
    return {
      clientWidth: right - left,
      clientHeight: bottom - top,
      getBoundingClientRect: () => ({left, right, top, bottom, width: right - left, height: bottom - top})
    };
  }

  private showStep(stepNumber: number, step: IStep) {
    const focus = this.selectHighlight(step.selector);
    this.setFocusElement(focus ? focus.getBoundingClientRect() : null);

    this.backdropBlocker.style.display = step.allowUserInteraction ? null : 'block';

    const steps = this.step.querySelectorAll('.tdp-tour-step-dots div');
    Array.from(steps).forEach((button: HTMLElement, i) => {
      button.classList.toggle('fa-circle', i !== stepNumber);
      button.classList.toggle('fa-circle-o', i === stepNumber);
    });

    const next = this.step.querySelector<HTMLButtonElement>('button[data-switch="+"]');
    {
      this.step.querySelector<HTMLButtonElement>('button[data-switch="--"]').disabled = stepNumber === 0;
      this.step.querySelector<HTMLButtonElement>('button[data-switch="-"]').disabled = stepNumber === 0 || this.activeTour.desc.canJumpAround === false;

      next.innerHTML = stepNumber === steps.length - 1 ? `<i class="fa fa-step-forward"></i> Finish` : `<i class="fa fa-step-forward"></i> Next`;
      next.disabled = false;
      if (step.pageBreak === 'user' && this.activeTour.multiPage) {
        next.disabled = true;
      } else if (step.waitFor) {
        next.disabled = true;
        step.waitFor.call(step, this.activeTourContext).then((r) => {
          if (this.stepCount.innerText !== String(stepNumber + 1)) {
            return; // step has changed in the mean while
          }
          next.disabled = false;
          if (r === 'next') {
            next.click();
          }
        });
      }
    }

    const content = this.step.querySelector<HTMLElement>('.tdp-tour-step-content')!;
    if (typeof step.html === 'function') {
      content.innerHTML = '';
      step.html(content);
    } else {
      content.innerHTML = step.html;
    }

    if (this.stepPopper) {
      this.stepPopper.destroy();
      this.stepPopper = null;
    }
    this.step.style.display = 'flex';
    this.stepCount.style.display = 'flex';

    {
      next.focus();
      if (!step.allowUserInteraction) {
        // force focus on next button
        next.onblur = () => next.focus();
      }
    }

    if (focus) {
      const options: PopperOptions =  {
        modifiers: {
          preventOverflow: {boundariesElement: 'window'}
        }
      };
      if (step.placement === 'centered') {
        // center but avoid the focus element
        const base = focus.getBoundingClientRect();
        const bb = this.step.getBoundingClientRect();
        const parent = this.step.ownerDocument.body.getBoundingClientRect();
        const centerLeft = (parent.width / 2 - bb.width / 2);
        let centerTop = (parent.height / 2 - bb.height / 2);
        const centerBottom = centerTop + bb.height;

        if (!(base.bottom < centerTop || base.top > centerBottom) && !(base.right < centerLeft || base.left > (centerLeft + bb.width))) {
          // overlap with the focus element shift step vertically
          if ((base.bottom + bb.height) < parent.height) {
            // can shift down
            centerTop = base.bottom + 5; // space
          } else if ((base.top - bb.height) >= 0) {
            // above is ok
            centerTop = base.top - bb.height;
          } else {
            // no where to fit put down
            centerTop = parent.height - bb.height;
          }
        }
        this.step.style.transform = `translate(${centerLeft}px, ${centerTop}px)`;
      } else {
        if (typeof step.placement === 'string') {
          options.placement = step.placement;
        } else if (typeof step.placement === 'function') {
          step.placement(options);
        }
        this.stepPopper = new Popper(focus, this.step, options);
      }
    } else {
      // center
      const bb = this.step.getBoundingClientRect();
      const parent = this.step.ownerDocument.body.getBoundingClientRect();
      this.step.style.transform = `translate(${(parent.width / 2 - bb.width / 2)}px, ${(parent.height / 2 - bb.height / 2)}px)`;
    }
    this.step.scrollIntoView(true);

    this.stepCount.innerText = String(stepNumber + 1);
    if (focus) {
      const base = focus.getBoundingClientRect();
      this.stepCount.style.transform = `translate(${base.left}px, ${base.top}px)`;
    } else {
      this.stepCount.style.transform = this.step.style.transform;
    }

    if (this.activeTour.multiPage && step.pageBreak) {
      this.memorizeActiveStep(stepNumber + 1);
    }
  }


  private setUp(tour: Tour, context: any = {}) {
    this.backdrop.ownerDocument.addEventListener('keyup', this.keyListener, {
      passive: true
    });
    this.backdrop.style.display = 'block';

    this.activeTour = tour;
    this.activeTourContext = Object.assign({}, context, this.tourContext);
    this.step.classList.toggle('tdp-tour-back-disabled', tour.desc.canJumpAround === false);
  }

  private takeDown() {
    this.clearHighlight();
    this.backdrop.ownerDocument.removeEventListener('keyup', this.keyListener);
    this.backdrop.style.display = null;
    this.backdropBlocker.style.display = null;

    this.step.style.display = 'none';
    this.step.style.transform = null;
    this.stepCount.style.display = 'none';
    this.stepCount.style.transform = null;

    if (this.stepPopper) {
      this.stepPopper.destroy();
      this.stepPopper = null;
    }
    if (this.activeTour) {
      this.activeTour.reset();
    }
  }

  showTour(tour: Tour, context: any = {}) {
    this.setUp(tour, context);
    this.activeTour.start(this.activeTourContext);
  }

  hideTour(finished: boolean = false) {
    this.clearHighlight();
    this.takeDown();
    if (finished) {
      this.rememberFinished(this.activeTour);
      const finished = this.chooser.querySelector<HTMLElement>(`li[data-id="${this.activeTour.id}"] > i`);
      finished.classList.remove('fa-square-o');
      finished.classList.add('fa-check-square');
    }
    this.activeTour = null;
    this.activeTourContext = null;
    this.clearStepMemorize();
  }

  private rememberFinished(tour: Tour) {
    const old = this.getRememberedFinishedTours();
    old.add(tour.id);
    localStorage.setItem(LOCALSTORAGE_FINISHED_TOURS, Array.from(old).join(','));
  }

  private getRememberedFinishedTours() {
    return new Set((localStorage.getItem(LOCALSTORAGE_FINISHED_TOURS) || '').split(','));
  }

  private memorizeActiveStep(stepNumber: number) {
    if (!this.activeTour) {
      return;
    }
    sessionStorage.setItem(SESSION_STORAGE_MEMORIZED_TOUR, `${this.activeTour.id}#${stepNumber}`);
  }

  private clearStepMemorize() {
    sessionStorage.removeItem(SESSION_STORAGE_MEMORIZED_TOUR);
  }

  private continueTour() {
    const memorized = sessionStorage.getItem(SESSION_STORAGE_MEMORIZED_TOUR);
    sessionStorage.removeItem(SESSION_STORAGE_MEMORIZED_TOUR);
    if (!memorized) {
      return;
    }
    const [tourId, stepString] = memorized.split('#');

    const tour = this.tours.find((d) => d.id === tourId);
    if (!tour) {
      console.warn('memorized invalid tour', tourId);
      return;
    }

    this.setUp(tour, {});
    this.activeTour.jumpTo(parseInt(stepString, 10), this.activeTourContext);
  }
}
