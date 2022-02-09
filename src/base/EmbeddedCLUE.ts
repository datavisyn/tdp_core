export class EmbeddedCLUE {
  private iframe: HTMLIFrameElement;

  private l = this.onMessage.bind(this);

  private callbacks: { [key: string]: any } = {};

  ready = false;

  constructor(parent: HTMLElement, url: string, private readyCallback: (c: EmbeddedCLUE) => void) {
    this.iframe = document.createElement('iframe');
    this.iframe.src = url;

    window.addEventListener('message', this.l);
    parent.appendChild(this.iframe);
  }

  private onMessage(event: MessageEvent) {
    if (event.data.type !== 'caleydo' || !event.data.clue) {
      return;
    }
    this.onCLUEMessage(event.data.clue, event.data);
  }

  send(type: string, msg: any) {
    msg.type = 'caleydo';
    msg.clue = type;
    msg.ref = this.clue_random_id();
    return new Promise((resolve, reject) => {
      this.callbacks[msg.ref] = {
        resolve,
        reject,
        type,
      };
      this.iframe.contentWindow.postMessage(msg, '*');
    });
  }

  showSlide(slide: number) {
    return this.send('show_slide', { slide });
  }

  jumpToState(state: number) {
    return this.send('jump_to', { state });
  }

  nextSlide() {
    return this.send('next_slide', {});
  }

  previousSlide() {
    return this.send('previous_slide', {});
  }

  private onCLUEMessage(type: string, data: any) {
    if (type === 'jumped_to_initial') {
      // ready
      this.ready = true;
      this.readyCallback(this);
      return;
    }
    const d = this.callbacks[data.ref];
    delete this.callbacks[data.ref];
    if (/.*_error/.test(type)) {
      d.reject(data);
    } else {
      d.resolve(data);
    }
  }

  clue_random_id(length = 8) {
    let id = '';
    while (id.length < length) {
      id += Math.random().toString(36).slice(-8);
    }
    return id.substr(0, length);
  }

  static embedCLUE(parent: HTMLElement, server: string, app: string, provenanceGraph: string) {
    const url = `${server}/${app}/#clue_graph=${provenanceGraph}&clue_contained=T&clue=P`;
    return new Promise((resolve) => {
      const clue = new EmbeddedCLUE(parent, url, resolve);
    });
  }
}
