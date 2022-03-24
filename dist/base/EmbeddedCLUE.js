export class EmbeddedCLUE {
    constructor(parent, url, readyCallback) {
        this.readyCallback = readyCallback;
        this.l = this.onMessage.bind(this);
        this.callbacks = {};
        this.ready = false;
        this.iframe = document.createElement('iframe');
        this.iframe.src = url;
        window.addEventListener('message', this.l);
        parent.appendChild(this.iframe);
    }
    onMessage(event) {
        if (event.data.type !== 'caleydo' || !event.data.clue) {
            return;
        }
        this.onCLUEMessage(event.data.clue, event.data);
    }
    send(type, msg) {
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
    showSlide(slide) {
        return this.send('show_slide', { slide });
    }
    jumpToState(state) {
        return this.send('jump_to', { state });
    }
    nextSlide() {
        return this.send('next_slide', {});
    }
    previousSlide() {
        return this.send('previous_slide', {});
    }
    onCLUEMessage(type, data) {
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
        }
        else {
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
    static embedCLUE(parent, server, app, provenanceGraph) {
        const url = `${server}/${app}/#clue_graph=${provenanceGraph}&clue_contained=T&clue=P`;
        return new Promise((resolve) => {
            const clue = new EmbeddedCLUE(parent, url, resolve);
        });
    }
}
//# sourceMappingURL=EmbeddedCLUE.js.map