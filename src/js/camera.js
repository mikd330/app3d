/**
 * Camera
 */
class Camera {
    /**
     * @property {Float32Array(3)} pos The position
     * @property {Float32Array(3)} tgt The view target
     * @property {Float32Array(3)} up The head
     * @property {Boolean} dirty Sign to update matrix calculation
     */
    constructor() {
        this.pos = App3D.createPoint(0, 0, -600);
        this.tgt = App3D.createPoint(0, 0, 0);
        this.up = App3D.createPoint(0, 1, 0);
        this.dirty = true;
    }
    get x() { return this.pos[0]; }
    get y() { return this.pos[1]; }
    get z() { return this.pos[2]; }
    set x(n) { this.pos[0] = n; this.dirty = true; }
    set y(n) { this.pos[1] = n; this.dirty = true; }
    set z(n) { this.pos[2] = n; this.dirty = true; }
    setPosition(x, y, z) {
        this.dirty = true;
        this.pos[0] = x;
        this.pos[1] = y;
        this.pos[2] = z;
    }
    get targetX() { return this.tgt[0]; }
    get targetY() { return this.tgt[1]; }
    get targetZ() { return this.tgt[2]; }
    set targetX(n) { this.tgt[0] = n; this.dirty = true; }
    set targetY(n) { this.tgt[1] = n; this.dirty = true; }
    set targetZ(n) { this.tgt[2] = n; this.dirty = true; }
    setTarget(x, y, z) {
        this.dirty = true;
        this.tgt[0] = x;
        this.tgt[1] = y;
        this.tgt[2] = z;
    }
    get upX() { return this.up[0]; }
    get upY() { return this.up[1]; }
    get upZ() { return this.up[2]; }
    get headX() { return this.up[0]; }
    get headY() { return this.up[1]; }
    get headZ() { return this.up[2]; }
    set headX(n) { this.up[0] = n; this.dirty = true; }
    set headY(n) { this.up[1] = n; this.dirty = true; }
    set headZ(n) { this.up[2] = n; this.dirty = true; }
    setHead(x, y, z) {
        this.dirty = true;
        this.up[0] = x;
        this.up[1] = y;
        this.up[2] = z;
    }
    /**
     * Move or Add Position
     * @param {*} x 
     * @param {*} y 
     * @param {*} z 
     */
    translate(x, y, z) {
        this.dirty = true;
        this.pos[0] += x;
        this.pos[1] += y;
        this.pos[2] += z;
    }
}