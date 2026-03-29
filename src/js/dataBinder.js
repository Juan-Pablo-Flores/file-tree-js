import Renderer from "./renderer";

export default class DataBinder {
    constructor(elementId, tree) {
        this.tree = tree;
        Renderer.renderRoot(tree, elementId);
    }

    handleEvent(event) {
        if (event.type === 'click') {
            if (event.target.classList.contains(['form-check-input'])) {
                const li = event.target.parentNode.parentNode;
                this.changeTreeData(li);
                this.changeDom(li);
            }

            if (event.target.classList.contains(['switcher'])) {
                this.expandDOMNode(event);
            }
        }
    }

    changeTreeData(li) {
        const node = this.tree.getDescendant(li.dataset.path);
        node.updateSubtreeChecks();
        node.updateParentChecks();
    }

    changeDom(li) {
        const subtreeRoot = this.tree.getDescendant(li.dataset.path);
        for (let node of subtreeRoot) {
            const checkbox = document.getElementById(node.path);
            if (checkbox) {
                checkbox.checked = node.checked;
            }
        }
        this.changeDomParentNodes(subtreeRoot.parent);
    }

    changeDomParentNodes(treeNode) {
        if (treeNode.parent === null) return;
        const checkbox = document.getElementById(treeNode.path);
        checkbox.indeterminate = (treeNode.checked === null);
        checkbox.checked = treeNode.checked;
        this.changeDomParentNodes(treeNode.parent);
    }

    collapseSiblingDOMNodes(event) {
        const liNode = event.target.closest('li');
        const ulNode = liNode.closest('ul');
        const expandedSiblingUl = ulNode.querySelector('li:not([data-path="' + liNode.dataset.path + '"]) > ul[data-collapsed="false"]');
        const expandedSiblingSwitcher = ulNode.querySelector('li:not([data-path="' + liNode.dataset.path + '"]) > span.switcher.expanded');

        if (expandedSiblingUl) {
            Renderer.collapseSection(expandedSiblingUl);
            const expandedSiblingUlChild = expandedSiblingUl.querySelector('ul');
            if (expandedSiblingUlChild) expandedSiblingUlChild.remove();
        }

        if (expandedSiblingSwitcher) expandedSiblingSwitcher.classList.remove('expanded');

    }

    expandDOMNode(event) {
        if (event.target.classList.contains('switcher')) {
            event.target.classList.toggle('expanded');
            this.collapseSiblingDOMNodes(event);

            const liNode = event.target.closest('li');
            const treeNode = this.tree.getDescendant(liNode.dataset.path);
            for (let child of treeNode.children) {
                if (!child.isLeaf()) {
                    let childDOMNode = document.querySelector('[data-path="' + child.path + '"]');
                    Renderer.renderChildren(childDOMNode, child);
                }
            }

            const ul = liNode.querySelector('ul');
            if (ul.dataset.collapsed === 'true') {
                Renderer.expandSection(ul);
            } else {
                Renderer.collapseSection(ul);
            }

        }
    }
}