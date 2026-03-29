const SEPARATOR = '/';

// All paths, relative or absolute, start without trailing slash
export default class Path {

    // Returns an string with the common prefix of both paths.
    static commonPrefix(path1, path2) {
        let i = 0;
        while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
            console.log(i, path1[i], path2[i]);
            i += 1;
        }

        return path1.slice(0, i - 1 < 0 ? 0 : i - 1);
    }

    // returns the string difference between path and subpath.
    static trailingPath(path, subPath) {
        if (!subPath || !path.includes(SEPARATOR) || !path.includes(subPath)) return path;

        return path.slice(subPath.length + 1);
    }

    // Returns last component in this.path. Returns an empty string if path is empty.
    static baseName(path) {
        let crumbs = path.split(SEPARATOR);
        let tail = crumbs.pop();
        return tail;
    }

    // Returns a list with every component in the path
    static crumbs(path) {
        return path.split(SEPARATOR);
    }

    // Returns joint paths
    static join(path1, path2) {
        if (path1 === '') return path2;
        if (path2 === '') return path1;

        return [path1, path2].join(SEPARATOR);
    }
}