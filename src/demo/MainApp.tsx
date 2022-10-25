import { buildStringColumn, IColumnDesc, LocalDataProvider } from 'lineupjs';
import * as React from 'react';
import { ATDPApplication } from '../ATDPApplication';
import { IRow } from '../base';
import { ProvenanceGraph, CLUEGraphManager, ObjectRefUtils } from '../clue';
import { useAsync } from '../hooks';
import { IDTypeManager } from '../idtype';
import { initializeLibrary } from '../initialize';
import { fetchIrisData } from '../vis/stories/utils';
import { AEmbeddedRanking } from '../wrapper/AEmbeddedRanking';

const VisLazy = React.lazy(() => import('../vis/Vis').then((m) => ({ default: m.Vis })));

const irisData = fetchIrisData();

class MyRanking extends AEmbeddedRanking<IRow> {

  constructor(node: HTMLElement) {
    super(node);

    const graph = ProvenanceGraph.createDummy();
    const ref = graph.findOrAddObject(this, 'MyRankingRef', ObjectRefUtils.category.visual);

    this.buildRanking(graph, ref.name, {
      itemIDType: IDTypeManager.getInstance().resolveIdType('ENS'),
      itemName: 'hit',
      itemRowHeight: 36,
      clueifyRanking: false,
      enableVisPanel: true,
    });
  }

  protected createInitialRanking(lineup: LocalDataProvider): void {
    // ...
  }

  protected async loadColumnDescs(): Promise<IColumnDesc[]> {
    return [buildStringColumn('title').build([])];
  }

  protected async loadRows(): Promise<IRow[]> {
    return [
      {
        id: 'ENS',
        title: 'Hello world',
      },
    ];
  }
}

class App extends ATDPApplication<null> {
  protected createApp(graph: ProvenanceGraph, manager: CLUEGraphManager, main: HTMLElement) {
    const rootNode = document.getElementById('appRoot');

    rootNode.innerHTML = 'Hello world';
    return null;
  }

  protected initSessionImpl(app) {
    // empty
  }
}

export function MainApp() {
  const { status } = useAsync(initializeLibrary, []);
  const rankingParent = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // const app = new App({});

    const ranking = new MyRanking(rankingParent.current);

    return () => {
      ranking.getInstance().destroy();
      ranking.node.innerHTML = '';
    };
  }, []);

  return (
    <>
      <div ref={rankingParent} style={{ width: '100vw', height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }} />
      {/* <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
        {status === 'success' ? (
          <React.Suspense fallback={<div />}>
            <VisLazy columns={irisData} />
          </React.Suspense>
        ) : null}
      </div> */}
    </>
  );
}
