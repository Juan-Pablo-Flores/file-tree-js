import Path from "./path";

export default class TreeNode {
    constructor({ parent, path, grayedOut }) {
        this.metrics = {
            documentation: {
                total: 0,
                missingDocs: 0,
                nonDoxyDocs: 0
            },
            busFactor: 0,
            linter: 0
        };
        this.parent = parent;
        this.path = path;
        this.label = Path.baseName(path);
        this.children = [];
        this.subscribed = false;
        this.visible = true;
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

    // This function adds a child Node with the subtree built from path.
    insert(path, metrics) {
        const crumbs = Path.crumbs(path);

        let currentPath = this.path;
        let node = this;
        let child;
        for (let crumb of crumbs) {
            currentPath = Path.join(currentPath, crumb);
            child = new TreeNode({ parent: node, path: currentPath });
            node.addChildNode(child);
            node = child;
        }

        node.metrics = metrics;
    }

    updateParentSubscriptions() {
        if (this.parent === null) return;
        const SubscribedSiblingCount = this.parent.children.reduce((count, child) => child.subscribed ? count + 1 : count, 0);
        const siblingCount = this.parent.children.length;

        if (SubscribedSiblingCount === siblingCount) {
            this.parent.subscribed = true;
        } else if (SubscribedSiblingCount === 0) {
            this.parent.subscribed = false;
        } else {
            this.parent.subscribed = null;
        }

        if (this.parent !== null) {
            this.parent.updateParentSubscriptions();
        }
    }

    updateSubtreeSubscriptions() {
        if (!this.subscribed && this.subscribed !== null) {
            for (let node of this) {
                node.subscribed = true && node.visible;
            }
            return;
        }

        if (this.subscribed === null) {
            let confirmed = confirm("subcribing to this folder will unsubscribe from every file and folder underneath it. Continue?");
            if (!confirmed) return;
        }

        for (let node of this) {
            node.subscribed = false;
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

    computeMetrics() {
        if (!this.children.length) {
            return;
        }

        let visible = false;
        for (let child of this.children) {
            child.computeMetrics();
            visible = visible || child.visible;
            this.metrics.documentation.total += child.metrics.documentation.total;
            this.metrics.documentation.missingDocs += child.metrics.documentation.missingDocs;
            this.metrics.documentation.nonDoxyDocs += child.metrics.documentation.nonDoxyDocs;
            this.metrics.busFactor += child.metrics.busFactor;
            this.metrics.linter += child.metrics.linter;
        }

        this.visible = visible;
        this.metrics.documentation.total = Math.round(this.metrics.documentation.total / this.children.length);
        this.metrics.documentation.missingDocs = Math.round(this.metrics.documentation.missingDocs / this.children.length);
        this.metrics.documentation.nonDoxyDocs = Math.round(this.metrics.documentation.nonDoxyDocs / this.children.length);
        this.metrics.busFactor = Math.round(this.metrics.busFactor / this.children.length);
        this.metrics.linter = Math.round(this.metrics.linter / this.children.length);
    }
}