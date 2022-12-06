import { merge } from 'lodash';
import { UserSession } from '../app/UserSession';
import { I18nextManager } from '../i18n';
import { BuildInfo } from './buildInfo';
import { AppMetaDataUtils } from './metaData';
/**
 * header html template declared inline so we can use i18next
 */
const getTemplate = () => {
    return `<nav class="navbar phovea-navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" data-testid="logo-tab" href="#" data-header="appLink"></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#headerNavBar" aria-controls="headerNavBar" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="headerNavBar">
        <ul class="navbar-nav me-auto" data-header="mainMenu">

        </ul>
        <ul class="navbar-nav" data-header="rightMenu">
            <li class="nav-item" hidden data-header="optionsLink">
                <a href="#" class="nav-link" data-bs-toggle="modal" data-bs-target="#headerOptionsDialog" title="${I18nextManager.getInstance().i18n.t('phovea:ui.options')}">
                    <i class="fas fa-cog fa-fw" aria-hidden="true"></i>
                    <span class="visually-hidden">${I18nextManager.getInstance().i18n.t('phovea:ui.openOptionsDialog')}</span>
                </a>
            </li>
            <li class="nav-item" hidden data-header="aboutLink">
                <a href="#" class="nav-link" data-bs-toggle="modal" data-bs-target="#headerAboutDialog" data-testid="header-about-link" title="${I18nextManager.getInstance().i18n.t('phovea:ui.about')}">
                    <i class="fas fa-info fa-fw" aria-hidden="true"></i>
                    <span class="visually-hidden">${I18nextManager.getInstance().i18n.t('phovea:ui.openAboutDialog')}</span>
                </a>
            </li>
            <li class="nav-item" hidden data-header="bugLink">
                <a href="#" class="nav-link" data-bs-toggle="modal" data-bs-target="#headerReportBugDialog" data-testid="header-report-bug-link" title="${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}">
                    <i class="fas fa-bug fa-fw" aria-hidden="true"></i>
                    <span class="visually-hidden">${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}</span>
                </a>
            </li>
            <li class="nav-item" hidden data-header="helpLink">
                <a href="//caleydo.org" target="_blank" class="nav-link" title="${I18nextManager.getInstance().i18n.t('phovea:ui.openHelpPage')}">
                    <span class="fa-stack" style="font-size: 0.5em; height: 2.3em;">
                      <i class="fas fa-book-open fa-stack-2x"></i>
                      <i class="fas fa-info fa-stack-1x" style="left: 20%; filter:invert(100%);"></i>
                    </span>
                    <span class="visually-hidden">${I18nextManager.getInstance().i18n.t('phovea:ui.openHelpPage')}</span>
                </a>
            </li>
        </ul>
    </div>
  </div>
</nav>

<!-- About Dialog -->
<div class="modal fade" id="headerAboutDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <h4 class="modal-title"> ${I18nextManager.getInstance().i18n.t('phovea:ui.about')}</h4>
              <button type="button" class="btn-close" data-testid="close-button" data-bs-dismiss="modal" aria-label=" ${I18nextManager.getInstance().i18n.t('phovea:ui.close')}">
              </button>
          </div>
          <div class="modal-body" data-header="about">
              <div class="metaData">${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}</div>
              <div class="caleydoInfo">
                  <p class="info">
                  ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart1')}
                   <strong><a href="http://phovea.caleydo.org/"  target="_blank"> ${I18nextManager.getInstance().i18n.t('phovea:ui.phoveaName')}</a></strong>
                        ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart2')}
                      <a href="http://phovea.caleydo.org" target="_blank"> ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart3')}</a>.
                  </p>
              </div>
          </div>
      </div>
  </div>
</div>

<!-- Report A Bug Dialog -->
<div class="modal fade" id="headerReportBugDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <h4 class="modal-title"> ${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}</h4>
              <button type="button" class="btn-close" data-bs-dismiss="modal" data-testid="close-button" aria-label=" ${I18nextManager.getInstance().i18n.t('phovea:ui.close')}">
              </button>
          </div>
          <div class="modal-body" data-header="bug">
          ${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}
          </div>
      </div>
  </div>
</div>

<!-- Options Dialog -->
<div class="modal fade" id="headerOptionsDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <h4 class="modal-title"> ${I18nextManager.getInstance().i18n.t('phovea:ui.options')}</h4>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label=" ${I18nextManager.getInstance().i18n.t('phovea:ui.close')}">
              </button>
          </div>
          <div class="modal-body" data-header="options">
          ${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}
          </div>
      </div>
  </div>
</div>

<div id="headerWaitingOverlay" class="phovea-busy" hidden>
</div>
`;
};
/**
 * Header link extends the header link with a  flag for disabling the logo
 */
export class AppHeaderLink {
    constructor(name = 'Phovea', action = (event) => false, href = '#', addLogo = true) {
        this.name = name;
        this.action = action;
        this.href = href;
        this.addLogo = addLogo;
    }
}
/**
 * Helper function to create a list item for the header menus
 * @param name
 * @param action
 * @param href
 * @returns {HTMLElement}
 */
function createLi(name, action, href = '#') {
    const li = document.createElement('li');
    li.classList.add('nav-item');
    li.innerHTML = `<a href="${href}" class="nav-link">${name}</a>`;
    if (action) {
        li.querySelector('a').onclick = action;
    }
    return li;
}
function defaultBuildInfo(_title, content) {
    BuildInfo.build()
        .then((buildInfo) => {
        content.innerHTML = buildInfo.toHTML();
    })
        .catch((error) => {
        content.innerHTML = error.toString();
    });
}
function defaultAboutInfo(title, content) {
    content = content.querySelector('.metaData');
    AppMetaDataUtils.getMetaData().then((metaData) => {
        title.innerHTML = (metaData.displayName || metaData.name).replace('_', ' ');
        let contentTpl = `<p class="description">${metaData.description}</p>`;
        if (metaData.homepage) {
            contentTpl += `<p class="homepage"><strong>${I18nextManager.getInstance().i18n.t('phovea:ui.homepage')}</strong>: <a href="${metaData.homepage}" target="_blank" rel="noopener">${metaData.homepage}</a></p>`;
        }
        contentTpl += `<p class="version"><strong>${I18nextManager.getInstance().i18n.t('phovea:ui.version')}</strong>: ${metaData.version}</p>`;
        if (metaData.screenshot) {
            contentTpl += `<img src="${metaData.screenshot}" class="mx-auto img-fluid img-thumbnail"/>`;
        }
        content.innerHTML = contentTpl;
    });
}
function defaultOptionsInfo(_title, content) {
    content.innerHTML = I18nextManager.getInstance().i18n.t('phovea:ui.noOptionsAvailable');
}
/**
 * The Caleydo App Header provides an app name and customizable menus
 */
export class AppHeader {
    /**
     * Constructor overrides the default options with the given options
     * @param parent
     * @param options
     */
    constructor(parent, options = {}) {
        this.parent = parent;
        /**
         * Default options that can be overridden in the constructor
         * @private
         */
        this.options = {
            /**
             * insert as first-child or append as child node to the given parent node
             */
            prepend: true,
            /**
             * color scheme: bright (= false) or dark (= true)
             */
            inverse: true,
            /**
             * position of the header: static (= false) or fixed at the top (= true)
             */
            positionFixed: false,
            /**
             * @DEPRECATED use `appLink.name` instead
             */
            // app: 'Caleydo Web',
            /**
             * @DEPRECATED use `appLink.addLogo` instead
             */
            // addLogo: true,
            /**
             * the app link with the app name
             */
            appLink: new AppHeaderLink(),
            /**
             * a list of links that should be shown in the main menu
             */
            mainMenu: [],
            /**
             * a list of links that should be shown in the right menu
             */
            rightMenu: [],
            /**
             * show/hide the options link
             */
            showOptionsLink: false,
            /**
             * show/hide the bug report link
             */
            showReportBugLink: true,
            /**
             * show/hide the EU cookie disclaimer bar from `cookie-bar.eu`
             */
            showCookieDisclaimer: false,
            /**
             * show help link
             */
            showHelpLink: false,
        };
        merge(this.options, options);
        this.addEUCookieDisclaimer();
        this.build();
    }
    addEUCookieDisclaimer() {
        if (!this.options.showCookieDisclaimer) {
            return;
        }
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://cdn.jsdelivr.net/npm/cookie-bar/cookiebar-latest.min.js?theme=flying';
        script.onload = () => {
            setupCookieBar();
        };
        this.parent.ownerDocument.body.appendChild(script);
    }
    async build() {
        // legacy support
        if (this.options.app !== undefined && this.options.appLink === undefined) {
            this.options.appLink.name = this.options.app;
        }
        if (this.options.addLogo !== undefined && !this.options.appLink === undefined) {
            this.options.appLink.addLogo = this.options.addLogo;
        }
        // create the content and copy it in the parent
        const helper = document.createElement('div');
        helper.innerHTML = getTemplate();
        while (helper.lastChild) {
            this.parent.insertBefore(helper.lastChild, this.parent.firstChild);
        }
        // use the inverse color scheme
        this.toggleDarkTheme(this.options.inverse);
        // modify app header link
        const appLink = this.parent.querySelector('*[data-header="appLink"]');
        appLink.innerHTML = this.options.appLink.name;
        appLink.onclick = this.options.appLink.action;
        appLink.setAttribute('href', this.options.appLink.href);
        if (this.options.appLink.addLogo) {
            appLink.classList.add('caleydo_app');
        }
        this.mainMenu = this.parent.querySelector('*[data-header="mainMenu"]');
        this.rightMenu = this.parent.querySelector('*[data-header="rightMenu"]');
        this.aboutDialog = this.parent.querySelector('*[data-header="about"]');
        this.optionsDialog = this.parent.querySelector('*[data-header="options"]');
        // show/hide links
        this.toggleOptionsLink(this.options.showOptionsLink !== false, typeof this.options.showOptionsLink === 'function' ? this.options.showOptionsLink : null);
        this.toggleAboutLink(this.options.showAboutLink !== false, typeof this.options.showAboutLink === 'function' ? this.options.showAboutLink : null);
        this.toggleReportBugLink(this.options.showReportBugLink !== false, typeof this.options.showReportBugLink === 'function' ? this.options.showReportBugLink : null);
        this.toggleHelpLink(this.options.showHelpLink !== false, typeof this.options.showHelpLink === 'string' ? this.options.showHelpLink : null);
        this.options.mainMenu.forEach((l) => this.addMainMenu(l.name, l.action, l.href));
        this.options.rightMenu.forEach((l) => this.addRightMenu(l.name, l.action, l.href));
    }
    addMainMenu(name, action, href = '#') {
        const li = createLi(name, action, href);
        this.mainMenu.appendChild(li);
        return li;
    }
    addRightMenu(name, action, href = '#') {
        const li = createLi(name, action, href);
        this.rightMenu.insertBefore(li, this.rightMenu.firstChild);
        return li;
    }
    insertCustomMenu(element) {
        this.rightMenu.parentElement.insertBefore(element, this.rightMenu);
    }
    insertCustomRightMenu(element) {
        this.rightMenu.parentElement.appendChild(element);
    }
    toggleDarkTheme(force) {
        const navbarElement = this.parent.querySelector('nav.navbar');
        this.options.inverse = force !== undefined ? force : !this.options.inverse;
        if (this.options.inverse) {
            navbarElement.classList.remove('navbar-light', 'bg-light');
            navbarElement.classList.add('navbar-dark', 'bg-dark');
        }
        else {
            navbarElement.classList.add('navbar-light', 'bg-light');
            navbarElement.classList.remove('navbar-dark', 'bg-dark');
        }
    }
    togglePositionFixed(force) {
        const navbarElement = this.parent.querySelector('nav.navbar');
        this.options.positionFixed = force !== undefined ? force : !this.options.positionFixed;
        navbarElement.classList.toggle('fixed-top', this.options.positionFixed);
    }
    wait() {
        AppHeader.setVisibility(document.querySelector('#headerWaitingOverlay'), true);
    }
    ready() {
        AppHeader.setVisibility(document.querySelector('#headerWaitingOverlay'), false);
    }
    static setVisibility(element, isVisible) {
        element.toggleAttribute('hidden', !isVisible);
    }
    toggleOptionsLink(isVisible, contentGenerator) {
        const link = this.parent.querySelector('*[data-header="optionsLink"]');
        AppHeader.setVisibility(link, isVisible);
        // set the URL to GitHub issues dynamically
        if (isVisible) {
            contentGenerator = contentGenerator || defaultOptionsInfo;
            import('jquery').then((jquery) => {
                $('#headerOptionsDialog').one('show.bs.modal', () => {
                    const content = this.parent.querySelector('*[data-header="options"]');
                    const title = this.parent.querySelector('#headerOptionsDialog .modal-title');
                    content.innerHTML = 'Loading...';
                    contentGenerator(title, content);
                });
            });
        }
    }
    toggleHelpLink(isVisible, helpUrl) {
        const link = this.parent.querySelector('*[data-header="helpLink"]');
        AppHeader.setVisibility(link, isVisible);
        if (isVisible && helpUrl) {
            link.querySelector('a').href = helpUrl;
        }
    }
    toggleReportBugLink(isVisible, contentGenerator) {
        const link = this.parent.querySelector('*[data-header="bugLink"]');
        AppHeader.setVisibility(link, isVisible);
        // set the URL to GitHub issues dynamically
        if (isVisible) {
            contentGenerator = contentGenerator || defaultBuildInfo;
            import('jquery').then((jquery) => {
                $('#headerReportBugDialog').one('show.bs.modal', () => {
                    const content = this.parent.querySelector('*[data-header="bug"]');
                    const title = this.parent.querySelector('#headerReportBugDialog .modal-title');
                    content.innerHTML = 'Loading...';
                    contentGenerator(title, content);
                });
            });
        }
    }
    toggleAboutLink(isVisible, contentGenerator) {
        const link = this.parent.querySelector('*[data-header="aboutLink"]');
        AppHeader.setVisibility(link, isVisible);
        if (isVisible) {
            contentGenerator = contentGenerator || defaultAboutInfo;
            const modifyDialogOnce = () => {
                // request last deployment data
                const content = this.aboutDialog;
                const title = this.aboutDialog.parentElement.querySelector('.modal-title');
                contentGenerator(title, content);
                // remove event listener to prevent another DOM modification
                link.removeEventListener('click', modifyDialogOnce);
            };
            link.addEventListener('click', modifyDialogOnce);
        }
    }
    hideDialog(selector) {
        import('jquery').then((jquery) => {
            $(selector).modal('hide');
        });
    }
    async showAndFocusOn(selector, focusSelector) {
        await import('jquery');
        const $selector = $(selector);
        $selector
            .modal('show')
            // @ts-ignore
            .on('shown.bs.modal', () => {
            // Because the modal is async we should check if we were logged in
            // exactly when the animation of opening the modal was happening
            if (UserSession.getInstance().isLoggedIn()) {
                this.hideDialog(selector);
            }
            else {
                $($selector).trigger('focus');
            }
        });
    }
    static create(parent, options = {}) {
        return new AppHeader(parent, options);
    }
}
//# sourceMappingURL=header.js.map