import DataBinder from "./dataBinder";
import TreeNode from "./tree_node";
import Path from "./path";
import file_paths from "./etc_filelist";

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let paths = file_paths.map(path => ({ name: path, metrics: { documentation: randInt(), busFactor: randInt(), linter: randInt() } }));
const tree = new TreeNode({ parent: null, path: '', metrics: { documentation: 0, busFactor: 0, linter: 0 }, grayedOut: true });

for (let path of paths) {
    let insertNode = tree.getDeepestMatchingNode(path.name);
    const trailingPath = Path.trailingPath(path.name, insertNode.path);
    let missingDocs = randInt(0, 50);
    let nonDoxyDocs = randInt(0, 50);
    let metrics = { documentation: { total: missingDocs + nonDoxyDocs, missingDocs, nonDoxyDocs }, busFactor: randInt(0, 100), linter: randInt(0, 100) };
    insertNode.insert(trailingPath, metrics);
}
tree.computeMetrics();


const mainContent = document.getElementById('main-content');
// const renderer = new Renderer(tree, 'container');

const dataBinder = new DataBinder('container', tree);
mainContent.addEventListener('click', dataBinder);

// let parentPath = 'a/b/d';
// let path = 'a/b/c/d/e';
// let otherPath = 'f/g/s/d';

// console.log(Path.commonPrefix(parentPath, path));
// console.log(Path.commonPrefix(parentPath, otherPath));
// console.log(Path.trailingPath('', 'a/b/c'));

// const parentNode = new TreeNode({ parent: null, path: parentPath, checked: false });
// const node = new TreeNode({ parent: parentNode, path, checked: false });
// const otherNode = new TreeNode({ parent: null, path: otherPath, checked: false });

// parentNode.addChildNode(node);


// console.log(parentNode.getDescendant(otherPath));