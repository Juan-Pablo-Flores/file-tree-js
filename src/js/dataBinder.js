import FileTree from "./file_tree";

export default class DataBinder {
    constructor(elementId, tree) {
        this.tree = tree;
        FileTree.renderRoot(tree, elementId);
    }

    handleEvent(event) {
        if (event.type === 'click') {
            if (event.target.classList.contains(['switcher'])) {
                this.handleSwitcherClick(event);
            }

            if (event.target.classList.contains(['node-label'])) {
                this.handleNodeLabelClick(event);
            }

            if (event.target.id === 'panel-subscribe-btn') {
                this.handleSubscriptionClick(event);
            }
        }
    }

    handleNodeLabelClick(event) {
        const liNode = event.target.closest('li');
        const liTreeNode = this.tree.getDescendant(liNode.dataset.path);

        if (!liTreeNode.visible) return;

        FileTree.renderPanel(liTreeNode);

        const button = document.getElementById('panel-subscribe-btn');
        button.style = 'visibility: visible;';
    }

    handleSwitcherClick(event) {
        const liNode = event.target.closest('li');
        const liTreeNode = this.tree.getDescendant(liNode.dataset.path);
        const liNodeList = liNode.querySelector('ul');
        const parentList = liNode.closest('ul');
        const switcher = event.target;

        if (liNodeList.dataset.collapsed === 'false') {
            FileTree.collapseSection(liNodeList);
            FileTree.renderChildren(liNode, liTreeNode);
        } else {
            const expandedSiblingLiNodeList = parentList.querySelector('li > ul[data-collapsed="false"]');
            if (expandedSiblingLiNodeList !== null) {
                const expandedSiblingLiNode = expandedSiblingLiNodeList.closest('li');
                const expandedSiblingTreeNode = this.tree.getDescendant(expandedSiblingLiNode.dataset.path);
                FileTree.collapseSection(expandedSiblingLiNodeList);
                FileTree.renderChildren(expandedSiblingLiNode, expandedSiblingTreeNode);

                const switchers = expandedSiblingLiNode.querySelectorAll('span.switcher.expanded');
                switchers.forEach(switcher => switcher.classList.remove('expanded'));
            }

            FileTree.expandSection(liNodeList);
            for (let child of liTreeNode.children) {
                let childNode = document.querySelector('[data-path="' + child.path + '"]');
                FileTree.renderChildren(childNode, child);
            }
        }

        switcher.classList.toggle('expanded');
    }

    handleSubscriptionClick(event) {
        const treeNode = this.tree.getDescendant(event.target.dataset.path);

        treeNode.updateSubtreeSubscriptions();
        treeNode.updateParentSubscriptions();
        FileTree.UpdateDOMSubtreeSubscriptions(treeNode);
        FileTree.updateDOMParentSubscriptions(treeNode);

        event.target.textContent = !treeNode.subscribed ? 'Notify on pull request' : 'Stop notifications';
    }
}