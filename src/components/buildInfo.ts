import { AppContext } from 'visyn_core/base';
import { I18nextManager } from 'visyn_core/i18n';

interface IBuildInfo {
  name: string;
  version: string;
  resolved: string;
}

interface IServerBuildInfo extends IBuildInfo {
  dependencies: string[];
  plugins: IBuildInfo[];
}

interface IClientBuildInfo extends IBuildInfo {
  dependencies: any;
  extraDependencies: any;
}

export class BuildInfo {
  constructor(private client: IClientBuildInfo, private server?: IServerBuildInfo) {}

  toString() {
    return 'BuildInfo';
  }

  private buildBuildInfo() {
    const build = this.client;
    return `<table class="table table-bordered table-sm">
            <tbody>
              <tr><th>${I18nextManager.getInstance().i18n.t('phovea:ui.application')}</th><td>${build.name}</td></tr>
              <tr><th>${I18nextManager.getInstance().i18n.t('phovea:ui.version')}</th><td>${build.version}</td></tr>
              ${this.server ? `<tr><th>Server</th><td>${this.server.version}</td></tr>` : ''}
              <tr><th>${I18nextManager.getInstance().i18n.t('phovea:ui.url')}</th><td><code>${window.location.pathname}${window.location.hash}</code></td></tr>
              <tr><th>${I18nextManager.getInstance().i18n.t('phovea:ui.userAgent')}</th><td>${navigator.userAgent}</td></tr>
            </tbody>
            </table>`;
  }

  private buildIssuesContent() {
    // don't use location.href, since I don't wanna expose server names
    return `
    ${I18nextManager.getInstance().i18n.t('phovea:ui.issueHeader')}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.separator')}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.applicationRow', { name: this.client.name })}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.versionRow', { version: this.client.version, resolved: this.client.resolved })}${
      this.server ? I18nextManager.getInstance().i18n.t('phovea:ui.serverRow', { version: this.server.version, resolved: this.server.resolved }) : ''
    }
    ${I18nextManager.getInstance().i18n.t('phovea:ui.urlRow', { pathname: window.location.pathname, hash: window.location.hash })}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.userAgentRow', { userAgent: navigator.userAgent })}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.platformRow', { platform: navigator.platform })}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.screenSizeRow', { width: window.screen.width, height: window.screen.height })}
    ${I18nextManager.getInstance().i18n.t('phovea:ui.windowSizeRow', { innerWidth: window.innerWidth, innerHeight: window.innerHeight })}

~~~json\n${JSON.stringify(this.client, null, ' ')}\n${this.server ? `\n${JSON.stringify(this.server, null, ' ')}\n` : ''}~~~`;
  }

  toHTML() {
    return `
      <h4>${I18nextManager.getInstance().i18n.t('phovea:ui.buildInfo')}</h4>
      ${this.buildBuildInfo()}
      <h4>${I18nextManager.getInstance().i18n.t('phovea:ui.buildDetails')}</h4>
      <textarea readonly="readonly">${this.buildIssuesContent()}</textarea>
    `;
  }

  static build(): Promise<BuildInfo> {
    const buildInfos = Promise.all([
      (<any>window).fetch('./buildInfo.json').then((response) => response.json()),
      AppContext.getInstance().offline
        ? null
        : AppContext.getInstance()
            .getAPIJSON('/buildInfo.json')
            .catch((e) => {
              console.error('Error fetching /api/buildInfo.json', e);
              return null;
            }),
    ]);
    return buildInfos.then((args: any[]) => new BuildInfo(args[0], args[1]));
  }
}
