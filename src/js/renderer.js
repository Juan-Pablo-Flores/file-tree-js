export default class Renderer {
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

        const rendered = Renderer.renderLabeledCheckbox(treeNode);
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

    static renderLabeledCheckbox(treeNode) {
        const div = document.createElement('div');
        div.classList.add(['form-check']);
        const checkbox = Renderer.createCheckbox(treeNode.isLeaf ? treeNode.path : null, treeNode.checked);
        const label = Renderer.createLabel(treeNode.path, treeNode.label);

        div.appendChild(checkbox);
        div.appendChild(label);

        return div;
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
        element.dataset.collapsed = true;
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

}