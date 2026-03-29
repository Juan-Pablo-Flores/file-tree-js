import Path from "./path";

export default class TreeNode {
    constructor({ parent, path, checked }) {
        this.parent = parent;
        this.path = path;
        this.label = Path.baseName(path);
        this.checked = checked; // null checked value means indeterminiate checkbox;
        this.children = [];
    }

    // path should be relative to project root
    getChild(path) {
        for (let child of this.children) {
            if (child.path === path) {
                return child;
            }
        }

        return null;
    }

    hasChild(path) {
        return this.children.some(child => child.path === path);
    }

    // The path should be relative to the project root
    getDescendant(path) {
        let commonPrefix = Path.commonPrefix(this.path, path);
        let trailingPath = Path.trailingPath(path, commonPrefix);

        const trailingCrumbs = Path.crumbs(trailingPath);
        let currentPath = commonPrefix;
        let descendant = this;
        for (let crumb of trailingCrumbs) {
            currentPath = Path.join(currentPath, crumb);
            descendant = descendant.getChild(currentPath);

            if (descendant === null) break;
        }

        return descendant;
    }

    addChildNode(node) {
        this.children.push(node);
    }

    isLeaf() {
        return this.children.length === 0;
    }

    // This function adds a child Node with the subtree built from path. That is to say that path
    // is relative to the node insert was invoked on.
    insert(path) {
        const crumbs = Path.crumbs(path);

        let currentPath = this.path;
        let node = this;
        let child;
        for (let crumb of crumbs) {
            currentPath = Path.join(currentPath, crumb);
            child = new TreeNode({ parent: node, path: currentPath, checked: false });
            node.addChildNode(child);
            node = child;
        }
    }

    getDeepestMatchingNode(path) {
        let crumbs = Path.crumbs(path);

        let node = this;
        let currentPath = '';
        for (let crumb of crumbs) {
            currentPath = Path.join(currentPath, crumb);
            if (!node.hasChild(currentPath)) break;
            node = node.getChild(currentPath);
        }

        return node;
    }

    updateParentChecks() {
        if (this.parent === null) return;
        const checkedSiblingCount = this.parent.children.reduce((count, child) => child.checked || child.checked === null ? count + 1 : count, 0);
        const siblingCount = this.parent.children.length;

        if (checkedSiblingCount === siblingCount) {
            this.parent.checked = true;
        } else if (checkedSiblingCount === 0) {
            this.parent.checked = false;
        } else {
            this.parent.checked = null;
        }

        if (this.parent !== null) {
            this.parent.updateParentChecks();
        }
    }

    updateSubtreeChecks() {
        if (!this.checked && this.checked !== null) {
            for (let node of this) {
                node.checked = true;
            }
            return;
        }

        if (this.checked === null) {
            let confirmed = confirm("Checking this checkbox will uncheck all checkboxes underneath it. Continue?");
            if (!confirmed) return;
        }

        for (let node of this) {
            node.checked = false;
        }
    }

    *[Symbol.iterator]() {
        const nodesStack = [...this.children];
        let currentNode;
        yield this;
        while (nodesStack.length > 0) {
            currentNode = nodesStack.pop();
            yield currentNode;
            nodesStack.push(...currentNode.children);
        }
    }
}
