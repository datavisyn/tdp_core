import { buildStringColumn } from 'lineupjs';
import * as React from 'react';
import { ATDPApplication } from '../ATDPApplication';
import { ProvenanceGraph, ObjectRefUtils } from '../clue';
import { useAsync } from '../hooks';
import { IDTypeManager } from '../idtype';
import { initializeLibrary } from '../initialize';
import { fetchIrisData } from '../vis/stories/utils';
import { AEmbeddedRanking } from '../wrapper/AEmbeddedRanking';
const VisLazy = React.lazy(() => import('../vis/Vis').then((m) => ({ default: m.Vis })));
const irisData = fetchIrisData();
class MyRanking extends AEmbeddedRanking {
    constructor(node) {
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
    createInitialRanking(lineup) {
        // ...
    }
    async loadColumnDescs() {
        return [buildStringColumn('title').build([])];
    }
    async loadRows() {
        return [
            {
                id: 'ENS',
                title: 'Hello world',
            },
        ];
    }
}
class App extends ATDPApplication {
    createApp(graph, manager, main) {
        const rootNode = document.getElementById('appRoot');
        rootNode.innerHTML = 'Hello world';
        return null;
    }
    initSessionImpl(app) {
        // empty
    }
}
export function MainApp() {
    const { status } = useAsync(initializeLibrary, []);
    const rankingParent = React.useRef(null);
    React.useEffect(() => {
        // const app = new App({});
        const ranking = new MyRanking(rankingParent.current);
        return () => {
            ranking.getInstance().destroy();
            ranking.node.innerHTML = '';
        };
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { ref: rankingParent, style: { width: '100vw', height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' } })));
}
//# sourceMappingURL=MainApp.js.map