import { IRegistry, EP_PHOVEA_CORE_LOCALE, PluginRegistry, ILocaleEPDesc, EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT } from 'visyn_core/plugin';
import { FormElementType } from './form/interfaces';
import { EP_PHOVEA_CLUE_PROVENANCE_GRAPH, EP_TDP_CORE_FORM_ELEMENT } from './base/extensions';

export default function (registry: IRegistry) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  function actionFunction(id: string, factory: string, loader: () => any, options?: {}) {
    registry.push('actionFunction', id, loader, { factory, ...options });
  }

  function actionCompressor(id: string, factory: string, matches: string, loader: () => any) {
    registry.push('actionCompressor', id, loader, { factory, matches });
  }

  function formElements(id: string, loader: () => any, options?: any) {
    registry.push(EP_TDP_CORE_FORM_ELEMENT, id, loader, options);
  }

  actionFunction('tdpInitSession', 'initSessionImpl', () => import('./utils/TDPApplicationUtils').then((t) => t.TDPApplicationUtils), {
    analytics: {
      category: 'session',
      action: 'init',
    },
  });
  actionFunction('tdpSetParameter', 'setParameterImpl', () => import('./utils/TDPApplicationUtils').then((t) => t.TDPApplicationUtils), {
    analytics: {
      category: 'view',
      action: 'setParameter',
    },
  });
  actionCompressor('tdpCompressSetParameter', 'compressSetParameter', '(tdpSetParameter)', () =>
    import('./utils/TDPApplicationUtils').then((t) => t.TDPApplicationUtils),
  );

  // compatibility
  actionFunction('targidInitSession', 'initSessionImpl', () => import('./utils/TDPApplicationUtils').then((t) => t.TDPApplicationUtils));
  actionFunction('targidSetParameter', 'setParameterImpl', () => import('./utils/TDPApplicationUtils').then((t) => t.TDPApplicationUtils));
  actionCompressor('targidCompressSetParameter', 'compressSetParameterOld', '(targidSetParameter)', () =>
    import('./utils/TDPApplicationUtils').then((t) => t.TDPApplicationUtils),
  );

  actionFunction('tdpAddScore', 'addScoreImpl', () => import('./lineup/internal/ScoreUtils').then((s) => s.ScoreUtils), {
    analytics: {
      category: 'score',
      action: 'add',
    },
  });
  actionFunction('tdpRemoveScore', 'removeScoreImpl', () => import('./lineup/internal/ScoreUtils').then((s) => s.ScoreUtils), {
    analytics: {
      category: 'score',
      action: 'remove',
    },
  });
  actionCompressor('tdpScoreCompressor', 'compress', '(tdpAddScore|tdpRemoveScore)', () => import('./lineup/internal/ScoreUtils').then((s) => s.ScoreUtils));

  // compatibility
  actionFunction('ordinoAddScore', 'addScoreImpl', () => import('./lineup/internal/ScoreUtils').then((s) => s.ScoreUtils));
  actionFunction('ordinoRemoveScore', 'removeScoreImpl', () => import('./lineup/internal/ScoreUtils').then((s) => s.ScoreUtils));
  actionCompressor('ordinoScoreCompressor', 'compressComp', '(ordinoAddScore|ordinoRemoveScore)', () =>
    import('./lineup/internal/ScoreUtils').then((s) => s.ScoreUtils),
  );

  actionFunction('lineupAddRanking', 'addRankingImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'addRanking',
    },
  });
  actionFunction('lineupSetRankingSortCriteria', 'setRankingSortCriteriaImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'setRankingSortCriteria',
    },
  });
  actionFunction('lineupSetAggregation', 'setAggregationImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'setAggregation',
    },
  });
  actionFunction('lineupSetSortCriteria', 'setSortCriteriaImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'setSortCriteria',
    },
  });
  actionFunction('lineupSetGroupCriteria', 'setGroupCriteriaImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'setGroupCriteria',
    },
  });
  actionFunction('lineupSetColumn', 'setColumnImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'setColumn',
    },
  });
  actionFunction('lineupAddColumn', 'addColumnImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'addColumn',
    },
  });
  actionFunction('lineupMoveColumn', 'moveColumnImpl', () => import('./lineup/internal/cmds').then((l) => l.LineupTrackingManager), {
    analytics: {
      category: 'lineup',
      action: 'moveColumn',
    },
  });

  formElements(FormElementType.SELECT, () => import('./form/elements/FormSelect'), {
    factory: 'new FormSelect',
  });
  formElements(FormElementType.SELECT2, () => import('./form/elements/FormSelect2'), {
    factory: 'new FormSelect2',
    selection: 'single',
  });
  formElements(FormElementType.SELECT2_MULTIPLE, () => import('./form/elements/FormSelect2'), {
    factory: 'new FormSelect2',
    selection: 'multiple',
  });
  formElements(FormElementType.SELECT3, () => import('./form/elements/FormSelect3'), {
    factory: 'new FormSelect3',
    selection: 'single',
  });
  formElements(FormElementType.SELECT3_MULTIPLE, () => import('./form/elements/FormSelect3'), {
    factory: 'new FormSelect3',
    selection: 'multiple',
  });
  formElements(FormElementType.INPUT_TEXT, () => import('./form/elements/FormInputText'), {
    factory: 'new FormInputText',
  });
  formElements(FormElementType.MAP, () => import('./form/elements/FormMap'), {
    factory: 'new FormMap',
  });
  formElements(FormElementType.BUTTON, () => import('./form/elements/FormButton'), {
    factory: 'new FormButton',
  });
  formElements(FormElementType.CHECKBOX, () => import('./form/elements/FormCheckBox'), {
    factory: 'new FormCheckBox',
  });
  formElements(FormElementType.RADIO, () => import('./form/elements/FormRadio'), {
    factory: 'new FormRadio',
  });

  registry.push(
    EP_PHOVEA_CORE_LOCALE,
    'tdpCoreLocaleEN',
    function () {
      return import('./locales/en/tdp.json').then(PluginRegistry.getInstance().asResource);
    },
    <ILocaleEPDesc>{
      ns: 'tdp',
    },
  );

  /* phovea_clue */

  /// #if include('clue', 'selection')
  registry.push(
    'actionFunction',
    'select',
    function () {
      return import('./base/Selection').then((s) => s.Selection);
    },
    {
      factory: 'select',
    },
  );

  registry.push(
    'actionCompressor',
    'idtype-selection',
    function () {
      return import('./base/Selection').then((s) => s.Selection);
    },
    {
      factory: 'compressSelection',
      matches: 'select',
    },
  );
  /// #endif

  registry.push(
    EP_PHOVEA_CORE_LOCALE,
    'phoveaClueLocaleEN',
    function () {
      return import('./locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
    },
    <ILocaleEPDesc>{
      ns: 'phovea',
    },
  );

  /* phovea_core */
  /// #if include('datatype', 'graph')
  registry.push(
    'datatype',
    'graph',
    function () {
      return import('./clue/graph/GraphProxy').then((m) => m.GraphProxy);
    },
    {
      factory: 'create',
    },
  );
  /// #endif
  /* tdp_matomo */
  registry.push(EP_PHOVEA_CORE_LOGIN, 'matomoLogin', () => import('./app/Matomo').then((m) => m.Matomo), {
    factory: 'trackLogin',
  });

  registry.push(EP_PHOVEA_CORE_LOGOUT, 'matomoLogout', () => import('./app/Matomo').then((m) => m.Matomo), {
    factory: 'trackLogout',
  });

  registry.push(EP_PHOVEA_CLUE_PROVENANCE_GRAPH, 'matomoAnalytics', () => import('./app/Matomo').then((m) => m.Matomo), {
    factory: 'trackProvenance',
  });

  /* phovea_importer */
  registry.push(
    'importer_value_type',
    'boolean',
    function () {
      return import('./import/valuetype/valuetypes').then((v) => v.PHOVEA_IMPORTER_ValueTypeUtils);
    },
    {
      factory: 'boolean',
      name: 'Boolean',
      priority: 30, // test first for boolean then for categorical
    },
  );

  registry.push(
    'importer_value_type',
    'categorical',
    function () {
      return import('./import/valuetype/valuetypes').then((v) => v.PHOVEA_IMPORTER_ValueTypeUtils);
    },
    {
      factory: 'categorical',
      name: 'Categorical',
      priority: 40, // test first for boolean then for categorical
    },
  );

  registry.push(
    'importer_value_type',
    'real',
    function () {
      return import('./import/valuetype/valuetypes').then((v) => v.PHOVEA_IMPORTER_ValueTypeUtils);
    },
    {
      factory: 'numerical',
      name: 'Float',
      priority: 10,
    },
  );

  registry.push(
    'importer_value_type',
    'int',
    function () {
      return import('./import/valuetype/valuetypes').then((v) => v.PHOVEA_IMPORTER_ValueTypeUtils);
    },
    {
      factory: 'numerical',
      name: 'Integer',
      priority: 20,
    },
  );

  registry.push(
    'importer_value_type',
    'string',
    function () {
      return import('./import/valuetype/valuetypes').then((v) => v.PHOVEA_IMPORTER_ValueTypeUtils);
    },
    {
      factory: 'string_',
      name: 'String',
      priority: 100,
    },
  );

  registry.push(
    'importer_value_type',
    'idType',
    function () {
      return import('./import/valuetype/idtypes').then((v) => v.IDTypeUtils);
    },
    {
      factory: 'idType',
      name: 'IDType',
      priority: 50,
      implicit: true,
    },
  );

  /*
  registry.pushVisynView<DemoVisynViewPluginType>(
    'LazyVisynDemoView',
    () => import('./views/visyn/demo/LazyVisynDemoView').then((m) => m.createLazyVisynDemoView),
    {
      visynViewType: 'simple',
      selection: 'any',
      idtype: '.*',
      name: 'Vis Demo (Lazy)',
      description: 'Demo view showcasing Vis with randomly generated data',
      includeInDashboardView: true,
      group: {
        name: 'Demo',
        order: 99,
      },
    },
  );

  registry.pushVisynView<DemoVisynViewPluginType>('VisynDemoView', () => import('./views/visyn/demo/VisynDemoView').then((m) => m.createVisynDemoView), {
    visynViewType: 'simple',
    selection: 'any',
    idtype: '.*',
    name: 'Vis Demo',
    description: 'Demo view showcasing Vis with randomly generated data',
    includeInDashboardView: true,
    group: {
      name: 'Demo',
      order: 99,
    },
  });
  */
}
