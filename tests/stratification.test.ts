/// <reference types="jest" />
import {Stratification} from '../src/stratification';

/*
  TODO: StratificationGroup:
    accumulateEvents,
    clear,
    constructor,
    desc,
    dim,
    fillAndSend,
    fire,
    fireEvent,
    fromIdRange,
    group,
    groupDesc,
    groupIndex,
    groups,
    handlers,
    hist,
    idRange,
    idView,
    ids,
    idtype,
    idtypes,
    length,
    list,
    names,
    ngroups,
    numSelectListeners,
    off,
    on,
    origin,
    persist,
    propagate,
    range,
    rangeGroup,
    restore,
    root,
    select,
    selectImpl,
    selectionCache,
    selectionListener,
    selectionListeners,
    selections,
    singleSelectionListener,
    size,
    toString,
    vector
*/

describe('guessColor', () => {
  it('male -> blue', () => expect(Stratification.guessColor('unused', 'MALE')).toEqual('blue'));
  it('female -> red', () => expect(Stratification.guessColor('unused', 'female')).toEqual('red'));
  it('deceased -> reddish', () => expect(Stratification.guessColor('unused', 'Deceased')).toEqual('#e41a1b'));
  it('living -> greenish', () => expect(Stratification.guessColor('unused', 'lIvIng')).toEqual('#377eb8'));
  it('other -> gray', () => expect(Stratification.guessColor('unused', 'other-unknown-whatever')).toEqual('gray'));
});
