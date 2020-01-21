/**
 * Node
 * @property {Boolean} isModel Sign that it has vertice
 * @property {Float32Array(3)} pos The Position
 * @property {Float32Array(3)} rot The Rotation in degree
 * @property {Float32Array(3)} scl The Scale
 * @property {Float32Array(16)} matL The Local Matrix
 * @property {Float32Array(16)} matG The Global Matrix
 * @property {Booleab} dirty Sign to update Local Matrix
 * @property {Node} parent The parent node
 * @property {Array} children The children
 */
class Node {
    constructor() {
        this.isModel = false;
        this.pos = App3D.createPoint(0, 0, 0);
        this.rot = App3D.createPoint(0, 0, 0);
        this.scl = App3D.createPoint(1, 1, 1);
        this.matL = App3D.createMatrix();
        this.matG = App3D.createMatrix();
        this.dirty = true;
        this.parent = null;
        this.children = [];
    }
    get x() { return this.pos[0]; }
    get y() { return this.pos[1]; }
    get z() { return this.pos[2]; }
    set x(n) { this.pos[0] = n; this.dirty = true; }
    set y(n) { this.pos[1] = n; this.dirty = true; }
    set z(n) { this.pos[2] = n; this.dirty = true; }
    get rotationX() { return this.rot[0]; }
    get rotationY() { return this.rot[1]; }
    get rotationZ() { return this.rot[2]; }
    set rotationX(n) { this.rot[0] = n; this.dirty = true; }
    set rotationY(n) { this.rot[1] = n; this.dirty = true; }
    set rotationZ(n) { this.rot[2] = n; this.dirty = true; }
    get scaleX() { return this.scl[0]; }
    get scaleY() { return this.scl[1]; }
    get scaleZ() { return this.scl[2]; }
    set scaleX(n) { this.scl[0] = n; this.dirty = true; }
    set scaleY(n) { this.scl[1] = n; this.dirty = true; }
    set scaleZ(n) { this.scl[2] = n; this.dirty = true; }
    /**
     * Set scale at once
     * @param {Float32} x 
     * @param {Float32} y 
     * @param {Float32} z 
     */
    setScale (x, y, z) {
        if (x != 0) this.scaleX = x;
        if (y != 0) this.scaleY = y;
        if (z != 0) this.scaleZ = z;
    }
    /**
     * Set position at once
     * @param {Float32} x 
     * @param {Float32} y 
     * @param {Float32} z 
     */
    setPosition (x, y, z) {
        if (x != 0) this.scaleX = x;
        if (y != 0) this.scaleY = y;
        if (z != 0) this.scaleZ = z;
    }
    /**
     * Set rotation at once
     * @param {Float32} x 
     * @param {Float32} y 
     * @param {Float32} z 
     */
    setScale (x, y, z) {
        if (x != 0) this.rotationX = x;
        if (y != 0) this.rotationY = y;
        if (z != 0) this.rotationZ = z;
    }
    appendChild(node) {
        if (this.children.indexOf(node) < 0) {
            node.parent = this;
            this.children.push(node);
        }
    }
    clear() {
        while (this.children.length > 0) {
            this.children.pop().parent = null;
        }
    }
    /**
     * Because it has no vertice,  just call it's children to do it
     * @param {Array} collection Array to save render data
     */
    collectRenderData(collection) {
        if (this.children.length > 0) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].collectRenderData(collection);
            }
        }
    }
    removeChild(node) {
        let i = this.children.indexOf(node);
        if (i < 0) return false;
        node.parent = null;
        this.children.splice(i, 1);
        return true;
    }
    /**
     * Move or Add Position at once
     * @param {Float32*} x 
     * @param {Float32} y 
     * @param {Float32} z 
     */
    move (x, y, z) {
        if (x != 0) this.x += x;
        if (y != 0) this.y += y;
        if (z != 0) this.z += z;
    }
    /**
     * Set rotation in degree at once
     * @param {Float32} x 
     * @param {Float32} y 
     * @param {Float32} z 
     * @see setRotation
     */
    rotate(x, y, z) {
        if (x != 0) this.rotationX = (this.rotationX + x) % 360;
        if (y != 0) this.rotationY = (this.rotationY + y) % 360;
        if (z != 0) this.rotationZ = (this.rotationZ + z) % 360;
    }
    /**
     * Updating matrix
     * Cascading to children
     * @param {*} mat 
     */
    updateMatrix(mat) {
        if (this.dirty) {
            App3D.composeNodeMatrix(this);
            this.dirty = false;
        }
        App3D.multiplyMatrix(this.matG, mat, this.matL);
        this.updateMore();
        if (this.children.length > 0) {
            for (let ni = 0; ni < this.children.length; ni++) {
                this.children[ni].updateMatrix(this.matG);
            }
        }
    }
    /**
     * Reserve for Model
     */
    updateMore() { }
}