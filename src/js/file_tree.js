class LabeledChecbox {
    static createCheckbox(value, checked = false) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList = ['form-check-input'];
        checkbox.value = value;
        checkbox.checked = checked;
        checkbox.id = value;

        return checkbox;
    }

    static createLabel(htmlFor, text) {
        const label = document.createElement("label");
        label.htmlFor = htmlFor;
        label.classList = ['form-check-label'];
        label.textContent = text;

        return label;
    }

    static render(treeNode) {
        const div = document.createElement('div');
        div.classList.add(['form-check']);
        const checkbox = LabeledChecbox.createCheckbox(treeNode.isLeaf ? treeNode.path : null, treeNode.checked);
        const label = LabeledChecbox.createLabel(treeNode.path, treeNode.label);

        div.appendChild(checkbox);
        div.appendChild(label);

        return div;
    }
}

class FileTreeLi {

    static createIcon(src, alt, classList) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.alt = alt;

        icon.classList.add(...classList);

        return icon;
    }

    static createPreLabelIcon(src, alt, classList) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.alt = alt;

        icon.classList.add(...classList);


        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('file-tree-icon-wrapper');
        iconWrapper.append(icon);

        return iconWrapper;
    }

    static createMetricIcon(metric, src, alt) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.alt = alt;

        icon.classList.add('pre-label-icon', `error-${Math.floor(metric * 3 / 101)}`);

        const iconMetric = document.createElement('span');
        iconMetric.textContent = metric;
        iconMetric.classList.add('pre-label-icon-metric');

        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('file-tree-icon-wrapper');
        iconWrapper.append(icon, iconMetric);

        return iconWrapper;
    }

    static render(treeNode) {

        const wrapper = document.createElement('div');

        const nodeLabel = document.createElement('span');
        if (treeNode.visible) nodeLabel.classList.add(['node-label']);
        nodeLabel.textContent = treeNode.label;

        let icons;
        if (!treeNode.visible) {
            wrapper.classList.add(['grayed-out']);
            icons = [
                FileTreeLi.createPreLabelIcon('/src/img/documentation-icon.png', 'documenatation metric', ['pre-label-icon', 'grayed-out-icon']),
                treeNode.isLeaf() ? '' : FileTreeLi.createPreLabelIcon('/src/img/bus-factor-icon.png', 'bus factor metric', ['pre-label-icon', 'grayed-out-icon']),
                FileTreeLi.createPreLabelIcon('/src/img/linter-icon.png', 'Linter metric', ['pre-label-icon', 'grayed-out-icon']),
            ];
        } else {
            icons = [
                FileTreeLi.createMetricIcon(treeNode.metrics.documentation.total, '/src/img/documentation-icon.png', 'documenatation metric'),
                treeNode.isLeaf() ? '' : FileTreeLi.createMetricIcon(treeNode.metrics.busFactor, '/src/img/bus-factor-icon.png', 'bus factor metric'),
                FileTreeLi.createMetricIcon(treeNode.metrics.linter, '/src/img/linter-icon.png', 'Linter metric'),
            ];
        }

        let subscriptionSrc = treeNode.subscribed ? '/src/img/subscription-icon.png' : (treeNode.subscribed === null ? '/src/img/partial-subscription-icon.png' : '');
        let subscriptionAlt = treeNode.subscribed ? 'Your are subscribed to this' : (treeNode.subscribed === null ? 'Some items under this folder have a subscription' : '');
        let subscriptionIcon = FileTreeLi.createIcon(subscriptionSrc, subscriptionAlt, ['post-label-icon']);
        subscriptionIcon.classList.add('subscription-icon');
        subscriptionIcon.onerror = function () { this.style.display = 'none'; };

        wrapper.append(...icons, nodeLabel, subscriptionIcon);

        return wrapper;
    }
}

export default class Renderer {

    static createTreeNode(treeNode) {
        return FileTreeLi.render(treeNode);
    }

    static renderPanel(treeNode) {
        const documentationBar = document.getElementById('documentation-bar');
        const documentationMetric = document.getElementById('documentation-metric');

        const missingDocsBar = document.getElementById('missing-docs-bar');
        const missingDocsMetric = document.getElementById('missing-docs-metric');
        const nonDoxyDocsBar = document.getElementById('non-doxy-docs-bar');
        const nonDoxyDocsMetric = document.getElementById('non-doxy-docs-metric');

        // const busFactorBar = document.getElementById('bus-factor-bar');
        // const busFactorMetric = document.getElementById('bus-factor-metric');
        const linterBar = document.getElementById('linter-bar');
        const linterMetric = document.getElementById('linter-metric');

        documentationBar.style.width = treeNode.metrics.documentation.total + '%';
        documentationBar.className = `error-${Math.floor(treeNode.metrics.documentation.total * 3 / 101)}`;

        missingDocsBar.style.width = treeNode.metrics.documentation.missingDocs + '%';
        missingDocsBar.className = `error-${Math.floor(treeNode.metrics.documentation.missingDocs * 3 / 101)}`;
        nonDoxyDocsBar.style.width = treeNode.metrics.documentation.nonDoxyDocs + '%';
        nonDoxyDocsBar.className = `error-${Math.floor(treeNode.metrics.documentation.nonDoxyDocs * 3 / 101)}`;

        documentationMetric.textContent = treeNode.metrics.documentation.total;
        missingDocsMetric.textContent = treeNode.metrics.documentation.missingDocs;
        nonDoxyDocsMetric.textContent = treeNode.metrics.documentation.nonDoxyDocs;

        // busFactorBar.style.width = treeNode.metrics.busFactor + '%';
        // busFactorBar.className = `error-${Math.floor(treeNode.metrics.busFactor * 3 / 101)}`;
        // busFactorMetric.textContent = treeNode.metrics.busFactor;
        linterBar.style.width = treeNode.metrics.linter + '%';
        linterBar.className = `error-${Math.floor(treeNode.metrics.linter * 3 / 101)}`;
        linterMetric.textContent = treeNode.metrics.linter;

        const fileLabel = document.getElementById('path');
        fileLabel.textContent = treeNode.path;
        document.getElementById('hyperlink-icon').style.visibility = 'visible';

        const button = document.getElementById('panel-subscribe-btn');
        button.textContent = !treeNode.subscribed ? 'Notify on pull request' : 'Stop notifications';
        button.dataset.path = treeNode.path;
    }

    static renderRoot(treeRoot, DOMRootId) {
        const container = document.getElementById(DOMRootId);
        const div = document.createElement('div');
        div.id = 'file-path-tree';
        container.appendChild(div);
        Renderer.renderChildren(div, treeRoot, true);
        for (let node of treeRoot.children) {
            let DOMNode = document.querySelector('[data-path="' + node.path + '"]');
            Renderer.renderChildren(DOMNode, node);
        }
    }

    static renderLi(DOMNode, treeNode) {
        const li = document.createElement('li');
        li.dataset.path = treeNode.path;

        if (treeNode.isLeaf()) {
            li.classList.add(['no-switcher']);
        } else {
            const switcher = document.createElement('span');
            switcher.classList.add(['switcher']);
            li.appendChild(switcher);
        }

        const rendered = Renderer.createTreeNode(treeNode);
        rendered.classList.add(['rendered-element']);

        li.appendChild(rendered);
        DOMNode.appendChild(li);
    }


    static renderChildren(DOMNode, treeNode, root = false) {
        const ul = document.createElement('ul');
        if (!root) {
            // initially collapsed;
            ul.style.height = 0;
            ul.dataset.collapsed = true;
        }

        for (let node of treeNode.children) {
            Renderer.renderLi(ul, node);
        }

        DOMNode.appendChild(ul);
    }

    //credits to https://css-tricks.com/using-css-transitions-auto-dimensions/
    static collapseSection(element) {
        // get the height of the element's inner content, regardless of its actual size
        let sectionHeight = element.scrollHeight;

        // temporarily disable all css transitions
        let elementTransition = element.style.transition;
        element.style.transition = '';

        // on the next frame (as soon as the previous style change has taken effect),
        // explicitly set the element's height to its current pixel height, so we 
        // aren't transitioning out of 'auto'
        requestAnimationFrame(function () {
            element.style.height = sectionHeight + 'px';
            element.style.transition = elementTransition;

            // on the next frame (as soon as the previous style change has taken effect),
            // have the element transition to height: 0
            requestAnimationFrame(function () {
                element.style.height = 0 + 'px';
            });
        });

        // mark the section as "currently collapsed"
        element.remove();
    }

    static expandSection(element) {

        // get the height of the element's inner content, regardless of its actual size
        let sectionHeight = element.scrollHeight;

        // have the element transition to the height of its inner content
        element.style.height = sectionHeight + 'px';


        // when the next css transition finishes (which should be the one we just triggered)
        element.addEventListener('transitionend', function noHeight(e) {
            // remove "height" from the element's inline styles, so it can return to its initial value
            element.style.height = null;
        }, { once: true });

        // mark the section as "currently not collapsed"
        element.dataset.collapsed = false;
    }

    static updateSubscirptionIcon(treeNode) {
        let subscriptionIcon = document.querySelector('[data-path="' + treeNode.path + '"] > .rendered-element > .subscription-icon');
        if (!subscriptionIcon || !treeNode.visible) return;

        if (treeNode.subscribed === null) {
            subscriptionIcon.src = '/src/img/partial-subscription-icon.png';
            subscriptionIcon.alt = 'Some items under this folder have a subscription';
            subscriptionIcon.title = 'Some items under this folder have a subscription';
            subscriptionIcon.style.display = 'inline-block';
        } else if (treeNode.subscribed === true) {
            subscriptionIcon.src = '/src/img/subscription-icon.png';
            subscriptionIcon.alt = 'Your are subscribed to this';
            subscriptionIcon.title = 'Your are subscribed to this';
            subscriptionIcon.style.display = 'inline-block';
        } else {
            subscriptionIcon.src = '';
            subscriptionIcon.alt = '';
            subscriptionIcon.title = '';
        }
    }

    static updateDOMParentSubscriptions(treeNode) {
        if (treeNode.parent === null) return;
        Renderer.updateSubscirptionIcon(treeNode.parent);
        Renderer.updateDOMParentSubscriptions(treeNode.parent);
    }

    static UpdateDOMSubtreeSubscriptions(treeNode) {
        for (let node of treeNode) {
            Renderer.updateSubscirptionIcon(node);
        }
    }
}