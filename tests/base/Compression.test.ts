/**
 * @jest-environment jsdom
 */

/// <reference types="jest" />
import { Compression } from '../../src/clue/base/Compression';
import { ActionMetaData, ActionNode } from '../../src/clue/provenance';

describe('action compressor', () => {
  const path: ActionNode[] = [
    new ActionNode(new ActionMetaData('', '', 'action1'), 'selection1', () => null),
    new ActionNode(new ActionMetaData('', '', 'action2'), 'selection2', () => null),
    new ActionNode(new ActionMetaData('', '', 'action3'), 'selection2', () => null), // consecutive duplicate
    new ActionNode(new ActionMetaData('', '', 'action4'), 'selection3', () => null),
    new ActionNode(new ActionMetaData('', '', 'action5'), 'selection3', () => null), // consecutive duplicate
    new ActionNode(new ActionMetaData('', '', 'action6'), 'selection2', () => null),
  ];

  it('ground truth', () => {
    expect(path.length).toBe(6);
    expect(path.toString()).toBe('action1,action2,action3,action4,action5,action6');
  });

  it('lastOnly()', () => {
    // remove only consecutive nodes of `selection2` but not `selection3`
    const newPath = Compression.lastOnly(path, 'selection2', (p) => p.f_id);
    expect(newPath.length).toBe(4);
    expect(newPath.toString()).toBe('action1,action4,action5,action6'); // missing action2 and action3
  });

  it('lastConsecutive()', () => {
    // remove only consecutive nodes of `selection2` but not `selection3`
    const newPath = Compression.lastConsecutive(path, 'selection2', (p) => p.f_id);
    expect(newPath.length).toBe(5);
    expect(newPath.toString()).toBe('action1,action3,action4,action5,action6'); // missing action2 only
  });
});
