import {resolveTours} from './Tour';
import Tour from './Tour';

export default class TourManager {

  private readonly escKeyListener = (evt: KeyboardEvent) => {
    if (evt.which === 27) { // esc
      this.hideTour();
    }
  }

  private readonly backdrop: HTMLElement;
  private readonly step: HTMLElement;
  readonly chooser: HTMLElement;

  private readonly tours: Tour[];

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
      Test Content
    </div>
    <div class="tdp-tour-step-navigation">
      <div class="tdp-tour-step-dots">
        <div title="1" class="fa fa-circle"></div>
        <div title="2" class="fa fa-circle"></div>
        <div title="3" class="fa fa-circle-o"></div>
        <div title="4" class="fa fa-circle"></div>
      </div>
      <div class="btn-group" role="group">
        <button type="button" class="btn-xs btn btn-default"><i class="fa fa-step-backward"></i> Back</button>
        <button type="button" class="btn-xs btn btn-default"><i class="fa fa-stop"></i> Cancel</button>
        <button type="button" class="btn-xs btn btn-default"><i class="fa fa-step-forward"></i> Next</button>
      </div>
    </div>
    `;

    this.tours = resolveTours();
    this.chooser = doc.createElement('div');
    this.chooser.classList.add('modal', 'fade');
    this.chooser.tabIndex = -1;
    this.chooser.setAttribute('role', 'dialog');
    this.chooser.id = `tdpTourChooser`;
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

            </div>
        </div>
    </div>`;

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.step);
    document.body.appendChild(this.chooser);
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
  }

  hideTour() {
    this.clearHighlight();
    this.takeDown();
    // TODO
  }
}
