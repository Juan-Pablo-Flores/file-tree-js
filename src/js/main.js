import DataBinder from "./dataBinder";
import TreeNode from "./treeNode";
import Path from "./path";
import paths from "./etc_filelist";

const tree = new TreeNode({ parent: null, path: '' });

for (let path of paths) {
    let insertNode = tree.getDeepestMatchingNode(path);
    const trailingPath = Path.trailingPath(path, insertNode.path);
    insertNode.insert(trailingPath);
}
const container = document.getElementById('container');
// const renderer = new Renderer(tree, 'container');

const dataBinder = new DataBinder('container', tree);
container.addEventListener('click', dataBinder);