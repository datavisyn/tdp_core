export class IParentLayoutContainerUtils {
    static canDrop(area) {
        return false;
    }
    static get rootParent() {
        let p = this;
        while (p.parent !== null) {
            p = p.parent;
        }
        return p;
    }
}
//# sourceMappingURL=IParentLayoutContainer.js.map