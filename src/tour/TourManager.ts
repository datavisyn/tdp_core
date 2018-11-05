import {resolveTours, ITourContext} from './Tour';
import Tour from './Tour';
import {IStep} from './extensions';
import Popper, {PopperOptions} from 'popper.js';

const LOCALSTORAGE_FINISHED_TOURS = 'tdpFinishedTours';

export default class TourManager {

  private readonly escKeyListener = (evt: KeyboardEvent) => {
    if (evt.which === 27) { // esc
      this.hideTour();
    }
  }

  private readonly backdrop: HTMLElement;
  private readonly step: HTMLElement;
  private stepPopper: Popper;
  readonly chooser: HTMLElement;

  private readonly tours: Tour[];
  private activeTour: Tour | null = null;
  private tourContext: ITourContext = {
    steps: (count) => this.setSteps(count),
    hide: (finished?: boolean) => this.hideTour(finished),
    show: (stepNumber, step) => this.showStep(stepNumber, step)
  };

  constructor(doc = document) {
    this.backdrop = doc.createElement('div');
    this.backdrop.classList.add('tdp-tour-backdrop');
    this.backdrop.innerHTML = `<div></div>`;
    this.backdrop.onclick = () => {
      this.hideTour();
    };
    this.step = doc.createElement('div');
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
          this.activeTour.jumpTo(0, this.tourContext);
          break;
        case '-':
          this.activeTour.previous(this.tourContext);
          break;
        case '0':
          this.hideTour();
          break;
        default:
          this.activeTour.next(this.tourContext);
          break;
        }
      };
    });

    this.tours = resolveTours();
    this.chooser = doc.createElement('div');
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
                ${this.tours.map((d) => `<li data-id="${d.id}"><i class="fa-li fa ${finished.has(d.id) ? 'fa-check-square' : 'fa-square-o'}"></i><a href="#" title="show tour" data-dismiss="modal" data-name="${d.name}">${d.name}</a></li>`).join('')}
              </ul>
            </div>
        </div>
    </div>`;

    Array.from(this.chooser.querySelectorAll('.modal-body a')).forEach((a: HTMLElement) => {
      a.onclick = () => {
        const tour = this.tours.find((d) => d.name === a.dataset.name);
        this.showTour(tour);
      };
    });

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.step);
    document.body.appendChild(this.chooser);
  }

  hasTours() {
    return this.tours.length > 0;
  }

  private setHighlight(mask: { left: number, top: number, width: number, height: number }) {
    const area = <HTMLElement>this.backdrop.firstElementChild;
    // @see http://bennettfeely.com/clippy/ -> select `Frame` example
    area.style.clipPath = `polygon(
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
    const area = <HTMLElement>this.backdrop.firstElementChild;
    area.style.clipPath = null;
  }

  private setFocusElement(elem: HTMLElement) {
    if (!elem) {
      this.clearHighlight();
      return;
    }
    const base = elem.getBoundingClientRect();
    this.setHighlight(base);
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
        this.activeTour.jumpTo(parseInt(button.dataset.step, 10), this.tourContext);
      };
    });
  }

  private showStep(stepNumber: number, step: IStep) {
    const focus: HTMLElement = step.selector ? this.step.ownerDocument.querySelector(step.selector) : null;
    this.setFocusElement(focus);
    this.step.dataset.step = String(stepNumber + 1);

    const steps = this.step.querySelectorAll('.tdp-tour-step-dots div');
    Array.from(steps).forEach((button: HTMLElement, i) => {
      button.classList.toggle('fa-circle', i !== stepNumber);
      button.classList.toggle('fa-circle-o', i === stepNumber);
    });

    this.step.querySelector<HTMLButtonElement>('button[data-switch="--"]').disabled = stepNumber === 0;
    this.step.querySelector<HTMLButtonElement>('button[data-switch="-"]').disabled = stepNumber === 0;
    this.step.querySelector<HTMLButtonElement>('button[data-switch="+"]').innerHTML = stepNumber === steps.length - 1 ? `<i class="fa fa-step-forward"></i> Finish` : `<i class="fa fa-step-forward"></i> Next`;


    this.step.querySelector<HTMLElement>('.tdp-tour-step-content')!.innerHTML = step.html;

    if (this.stepPopper) {
      this.stepPopper.destroy();
      this.stepPopper = null;
    }
    this.step.style.display = 'flex';
    const options: PopperOptions =  {};
    if (step.placement) {
      options.placement = step.placement;
    }
    if (focus) {
      this.stepPopper = new Popper(focus, this.step, options);
    } else {
      // center
      const bb = this.step.getBoundingClientRect();
      const parent = this.step.ownerDocument.body.getBoundingClientRect();
      this.step.style.left = `${(parent.width / 2 - bb.width / 2)}px`;
      this.step.style.top = `${(parent.height / 2 - bb.height / 2)}px`;
    }
  }


  private setUp() {
    this.backdrop.ownerDocument.addEventListener('keyup', this.escKeyListener, {
      passive: true
    });
    this.backdrop.style.display = 'block';
  }

  private takeDown() {
    this.clearHighlight();
    this.backdrop.ownerDocument.removeEventListener('keyup', this.escKeyListener);
    this.backdrop.style.display = null;
    this.step.style.display = null;
    if (this.stepPopper) {
      this.stepPopper.destroy();
      this.stepPopper = null;
    }
  }

  showTour(tour: Tour) {
    this.activeTour = tour;
    this.setUp();
    this.activeTour.start(this.tourContext);
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
  }

  private rememberFinished(tour: Tour) {
    const old = this.getRememberedFinishedTours();
    old.add(tour.id);
    localStorage.setItem(LOCALSTORAGE_FINISHED_TOURS, Array.from(old).join(','));
  }

  private getRememberedFinishedTours() {
    return new Set((localStorage.getItem(LOCALSTORAGE_FINISHED_TOURS) || '').split(','));
  }
}
