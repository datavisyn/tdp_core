import { select, event as d3event } from 'd3v3';
import { PHOVEA_UI_FormDialog } from '../components';
import { StoreUtils } from './StoreUtils';
import { RestStorageUtils } from './rest';
import { ENamedSetType } from './interfaces';
import { ErrorAlertHandler } from '../base/ErrorAlertHandler';
import { EXTENSION_POINT_TDP_LIST_FILTERS } from '../base/extensions';
import { NotificationHandler } from '../base/NotificationHandler';
import { UserSession, PluginRegistry } from '../app';
import { I18nextManager } from '../i18n';
import { EEntity } from '../security';
export class NamedSetList {
    constructor(idType, sessionCreator, doc = document) {
        this.idType = idType;
        this.sessionCreator = sessionCreator;
        this.data = [];
        this.filter = () => true;
        this.loaded = false;
        this.node = doc.createElement('div');
        this.node.classList.add('named-sets-wrapper');
        this.build();
    }
    get(index) {
        return this.data[index];
    }
    async build() {
        this.node.innerHTML = `
      <section class="predefined-named-sets"><header>${I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.predefinedSets')}</header><ul class="loading"></ul></section>
      <section class="custom-named-sets"><header> ${I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.mySets')}</header><ul class="loading"></ul></section>
      <section class="other-named-sets"><header> ${I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.publicSets')}</header><ul class="loading"></ul></section>`;
        this.filter = await this.findFilters();
        const data = await this.list();
        // store
        this.data.push(...data);
        this.loaded = true;
        this.update();
    }
    edit(namedSet) {
        if (!UserSession.getInstance().canWrite(namedSet)) {
            return;
        }
        StoreUtils.editDialog(namedSet, I18nextManager.getInstance().i18n.t(`tdp:core.editDialog.listOfEntities.default`), async (name, description, sec) => {
            const params = { name, description, ...sec };
            const editedSet = await RestStorageUtils.editNamedSet(namedSet.id, params);
            NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.namedSet'), name);
            this.replace(namedSet, editedSet);
        });
    }
    update() {
        const data = this.data.filter((datum) => this.filter({ [datum.subTypeKey]: datum.subTypeValue }));
        const predefinedNamedSets = data.filter((d) => d.type !== ENamedSetType.NAMEDSET);
        const me = UserSession.getInstance().currentUserNameOrAnonymous();
        const customNamedSets = data.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me);
        const otherNamedSets = data.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me);
        const $node = select(this.node);
        // append the list items
        this.updateGroup($node.select('.predefined-named-sets ul'), predefinedNamedSets);
        this.updateGroup($node.select('.custom-named-sets ul'), customNamedSets);
        this.updateGroup($node.select('.other-named-sets ul'), otherNamedSets);
    }
    updateGroup($base, data) {
        const $options = $base
            .classed('loading', data.length === 0 && !this.loaded)
            .selectAll('li')
            .data(data);
        const $enter = $options
            .enter()
            .append('li')
            .classed('namedset', (d) => d.type === ENamedSetType.NAMEDSET);
        $enter
            .append('a')
            .classed('goto', true)
            .attr('href', '#')
            .on('click', (namedSet) => {
            // prevent changing the hash (href)
            d3event.preventDefault();
            this.sessionCreator(namedSet);
        });
        $enter
            .append('a')
            .classed('public', true)
            .attr('href', '#')
            .html(`<i class="fas fa-fw" aria-hidden="true"></i> <span class="visually-hidden"></span>`)
            .on('click', (namedSet) => {
            // prevent changing the hash (href)
            d3event.preventDefault();
            this.edit(namedSet);
        });
        $enter
            .append('a')
            .classed('edit', true)
            .attr('href', '#')
            .html(`<i class="fas fa-edit" aria-hidden="true"></i> <span class="visually-hidden"> ${I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.edit')}</span>`)
            .attr('title', I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.edit'))
            .on('click', (namedSet) => {
            // prevent changing the hash (href)
            d3event.preventDefault();
            this.edit(namedSet);
        });
        $enter
            .append('a')
            .classed('delete', true)
            .attr('href', '#')
            .html(`<i class="fas fa-trash" aria-hidden="true"></i> <span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.delete')}</span>`)
            .attr('title', I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.delete'))
            .on('click', async (namedSet) => {
            // prevent changing the hash (href)
            d3event.preventDefault();
            if (!UserSession.getInstance().canWrite(namedSet)) {
                return;
            }
            const deleteIt = await PHOVEA_UI_FormDialog.areyousure(I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.dialogText', { name: namedSet.name }), { title: I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.deleteSet') });
            if (deleteIt) {
                await RestStorageUtils.deleteNamedSet(namedSet.id);
                NotificationHandler.successfullyDeleted(I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.dashboard'), namedSet.name);
                this.remove(namedSet);
            }
        });
        // update
        $options
            .select('a.goto')
            .text((d) => d.name)
            .attr('title', (d) => {
            const extendedData = d.type === ENamedSetType.NAMEDSET
                ? {
                    context: 'extended',
                    creator: d.creator,
                    public: UserSession.getInstance().hasPermission(d, EEntity.OTHERS),
                }
                : {};
            return I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.title', { name: d.name, description: d.description, ...extendedData }); // i18next context feature
        });
        $options.select('a.delete').attr('hidden', (d) => (d.type !== ENamedSetType.NAMEDSET || !UserSession.getInstance().canWrite(d) ? '' : null));
        $options.select('a.edit').attr('hidden', (d) => (d.type !== ENamedSetType.NAMEDSET || !UserSession.getInstance().canWrite(d) ? '' : null));
        $options
            .select('a.public')
            .attr('hidden', (d) => (d.type !== ENamedSetType.NAMEDSET || !UserSession.getInstance().canWrite(d) ? '' : null))
            .html((d) => {
            const isPublic = d.type === ENamedSetType.NAMEDSET && UserSession.getInstance().hasPermission(d, EEntity.OTHERS);
            const publicOrPrivate = I18nextManager.getInstance().i18n.t('tdp:core.NamedSetList.status', { context: isPublic ? '' : 'private' });
            return `<i class="fas ${isPublic ? 'fa-users' : 'fa-user'}" aria-hidden="true" title="${publicOrPrivate}"></i> <span class="visually-hidden">${publicOrPrivate}</span>`;
        });
        $options.exit().remove();
    }
    push(...namedSet) {
        this.data.push(...namedSet);
        this.update();
    }
    remove(namedSet) {
        this.data.splice(this.data.indexOf(namedSet), 1);
        this.update();
    }
    replace(oldNamedSet, newNamedSet) {
        this.data.splice(this.data.indexOf(oldNamedSet), 1, newNamedSet);
        this.update();
    }
    findFilters() {
        return Promise.all(PluginRegistry.getInstance()
            .listPlugins(EXTENSION_POINT_TDP_LIST_FILTERS)
            .map((plugin) => plugin.load())).then((filters) => {
            return (metaData) => filters.every((f) => f.factory(metaData));
        });
    }
    list() {
        return RestStorageUtils.listNamedSets(this.idType)
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch((error) => {
            console.error(error);
            return [];
        });
    }
}
//# sourceMappingURL=NamedSetList.js.map