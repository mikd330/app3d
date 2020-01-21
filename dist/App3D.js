/**
 * Global constants
 */
const RAD1 = Math.PI / 180;
const DEG1 = 180 / Math.PI;
/**
 * Class App3D - The Engine
 * @property {canvas} canvas
 * @property {CanvasRenderingContext2d} ctx
 * @property {Float32Array(3)} fnf Represent Fov, Near and Far
 * @property {Camera} cam
 * @property {Node} world Root of all nodes
 * @property {Float32Array(16)} matVP Matrix of viewport
 * @property {Float32Array(16)} matP Matrix of projection
 * @property {Float32Array(16)} matC Matrix of camera
 * @property {Float32Array(16)} matG The global matrix
 * @property {Float32Array(16)} matTemp Matrix for temporary calculation
 * @property {Booleab} _dirty Sign to update matrix
 * @property {Booleab} wireframe Sign for wire-frame mode
 */
class App3D {
    /**
     * 
     * @param {Canvas} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.fnf = new Float32Array(3);
        this.fnf[0] = 1;
        this.fnf[1] = 1;
        this.fnf[2] = 800;

        this.cam = new Camera();
        this.world = new Node();

        this.matVP = App3D.createMatrix();
        this.matP = App3D.createMatrix();
        this.matTemp = App3D.createMatrix();
        this.matC = App3D.createMatrix();
        this.matG = App3D.createMatrix();
        this._dirty = true;
        this.wireframe = false;

        this.updateMatVP();
        this.updateMatP();
        this.updateMatC();
        App3D.instance = this;
    }
    get dirty() {
        return this._dirty || this.cam.dirty;
    }
    get Far() { return this.fnf[2]; }
    get Fov() { return this.fnf[0]; }
    get Near() { return this.fnf[1]; }
    set Far(n) { this.fnf[2] = n; this.updateMatP(); }
    set Fov(n) { this.fnf[0] = n; this.updateMatP(); }
    set Near(n) { this.fnf[1] = n; this.updateMatP(); }
    /**
     * 
     * @param {Float} f Fov
     * @param {Float} n Near
     * @param {Float} r Far
     */
    setFovNearFar(f, n, r) {
        this.fnf[0] = f;
        this.fnf[1] = n;
        this.fnf[2] = r;
        this.updateMatP();
    }
    /**
     * Drawing (rendering)
     * - Request render data to world
     * - Sorting render data
     * - Clear the canvas
     * - Draw triangles
     * - - Prepare texture matrix for trianggle
     * - - Draw the triangle to this.ctx (CanvasRenderingContext2d)
     */
    draw() {
        let renderData = [];
        this.world.collectRenderData(renderData);
        renderData.sort((a, b) => {
            let va = (a[1][2] + a[2][2] + a[3][2]) * 0.3333;
            let vb = (b[1][2] + b[2][2] + b[3][2]) * 0.3333;
            return va == vb ? 0 : va > vb ? 1 : -1;
        });
        let ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let tMat = new Array(6);
        let o, det, oqk, oql, oqm, oqn, oqo, oqp, oqq, oqr, oqs, oqt, oqu, oqv, oqw, oqx, oqy;
        while (renderData.length > 0) {
            o = renderData.pop();
            oqk = o[5][0] * o[6][1];
            oql = o[6][0] * o[5][1];
            oqm = o[6][1] - o[5][1];
            oqn = o[5][0] - o[6][0];
            det = o[4][0] * oqm - oqk + oql + oqn * o[4][1];
            if (det == 0) {
                continue;
            }
            det = 1 / det;
            oqo = o[3][0] - o[2][0];
            oqp = o[2][1] - o[3][1];
            oqq = oql - oqk;
            oqr = o[5][1] * o[3][0];
            oqs = o[6][1] * o[2][0];
            oqt = o[5][0] * o[3][1];
            oqu = o[6][0] * o[2][1];
            oqv = o[5][1] * o[3][1];
            oqw = o[6][1] * o[2][1];
            oqx = o[5][0] * o[3][0];
            oqy = o[6][0] * o[2][0];
            tMat[0] = -(o[4][1] * oqo - oqr + oqs + (o[5][1] - o[6][1]) * o[1][0]) * det;
            tMat[3] = -(o[4][0] * oqp + oqt - oqu + (o[6][0] - o[5][0]) * o[1][1]) * det;
            tMat[2] = (o[4][0] * oqo - oqx + oqy + oqn * o[1][0]) * det;
            tMat[1] = (o[4][1] * oqp + oqv - oqw + oqm * o[1][1]) * det;
            tMat[4] = (o[4][0] * (oqs - oqr) + o[4][1] * (oqx - oqy) + oqq * o[1][0]) * det;
            tMat[5] = (o[4][0] * (oqw - oqv) + o[4][1] * (oqt - oqu) + oqq * o[1][1]) * det;
            // draw
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(o[1][0], o[1][1]);
            ctx.lineTo(o[2][0], o[2][1]);
            ctx.lineTo(o[3][0], o[3][1]);
            ctx.closePath();
            ctx.clip();
            ctx.transform(tMat[0], tMat[1], tMat[2], tMat[3], tMat[4], tMat[5]);
            ctx.drawImage(o[0], 0, 0);
            if (this.wireframe) {
                ctx.stroke();
            }
            ctx.restore();
        }
    }
    /**
     * Updating camera matrix
     */
    updateMatC() {
        let z0 = this.cam.x - this.cam.targetX,
            z1 = this.cam.y - this.cam.targetY,
            z2 = this.cam.z - this.cam.targetZ;
        let len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }
        let x0 = this.cam.upY * z2 - this.cam.upZ * z1,
            x1 = this.cam.upZ * z0 - this.cam.upX * z2,
            x2 = this.cam.upX * z1 - this.cam.upY * z0;
        len = x0 * x0 + x1 * x1 + x2 * x2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        this.matC[0] = x0;
        this.matC[1] = x1;
        this.matC[2] = x2;
        this.matC[3] = 0;
        this.matC[4] = z1 * x2 - z2 * x1;
        this.matC[5] = z2 * x0 - z0 * x2;
        this.matC[6] = z0 * x1 - z1 * x0;
        this.matC[7] = 0;
        this.matC[8] = z0;
        this.matC[9] = z1;
        this.matC[10] = z2;
        this.matC[11] = 0;
        this.matC[12] = this.cam.x;
        this.matC[13] = this.cam.y;
        this.matC[14] = this.cam.z;
        this.matC[15] = 1;
        this.cam.dirty = false;
    }
    /**
     * Updating neccessary matrice
     */
    updateMatrix() {
        if (this.dirty) {
            if (this.cam.dirty) {
                this.updateMatC();
            }
            App3D.multiplyMatrix(this.matTemp, this.matVP, this.matP);
            App3D.multiplyMatrix(this.matG, this.matTemp, this.matC);
            this._dirty = false;
        }
        this.world.updateMatrix(this.matG);
    }
    /**
     * Updating projection matrix
     */
    updateMatP() {
        let asp = this.canvas.width / this.canvas.height,
            f = 1.0 / Math.tan(this.Fov / 2);
        this.matP[0] = f / asp;
        this.matP[5] = f;
        this.matP[11] = -1;
        if (this.Far != null && this.Far !== Infinity) {
            let nf = 1 / (this.Near - this.Far);
            this.matP[10] = (this.Far + this.Near) * nf;
            this.matP[14] = (2 * this.Far * this.Near) * nf;
        } else {
            this.matP[10] = -1;
            this.matP[14] = -2 * this.Near;
        }
        this.matP[1] = this.matP[2] = this.matP[3] = this.matP[4] = 0;
        this.matP[6] = this.matP[7] = this.matP[8] = this.matP[9] = 0;
        this.matP[12] = this.matP[13] = this.matP[15] = 0;
        this._dirty = true;
    }
    /**
     * Updating viewport matrix
     */
    updateMatVP() {
        this.matVP[0] = this.matVP[12] = this.canvas.width / 2;
        this.matVP[5] = this.matVP[13] = this.canvas.height / 2;
        this._dirty = true;
    }
    /**
     * Resize this.canvas
     * @param {Float} w New canvas Width
     * @param {Float} h New Canvas Height
     */
    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.updateMatVP();
    }
    /**
     * request to update matrix and draw
     */
    step() {
        this.updateMatrix();
        this.draw();
    }
    static instance = undefined;
    /**
     * 
     * @param {*} m Index of material
     * @param {*} a Index of point 1
     * @param {*} b Index of point 2
     * @param {*} c Index of point 3
     * @return {Floar32Array(4)}
     */
    static createIndice(m, a, b, c) {
        let p = new Uint8Array(4);
        p[0] = m;
        p[1] = a;
        p[2] = b;
        p[3] = c;
        return p;
    }
    /**
     * 
     * @param {Array} a Optional values
     * @return {Float32Array(16)}
     */
    static createMatrix(a) {
        let m = new Float32Array(16);
        if (a) {
            for (let i = 0; i < 16; i++) {
                m[i] = a[i];
            }
        } else {
            m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
            m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
            m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
            m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
        }
        return m;
    }
    /**
     * 
     * @param {Float} x Coordinate x
     * @param {Float} y Coordinate y
     * @param {Float} z Coordinate x
     * @return {Float32Array(3)}
     */
    static createPoint(x, y, z) {
        let p = new Float32Array(3);
        p[0] = x;
        p[1] = y;
        p[2] = z;
        return p;
    }
    /**
     * 
     * @param {*} image 
     * @return {TextureMaterial}
     */
    static createTexture(image) {
        return new TextureMaterial(image);
    }
    /**
     * 
     * @param {Float} u Texture coordinate x
     * @param {Float} v Texture coordinate y
     * @return {Float32Array(2)}
     */
    static createUV(u, v) {
        let p = new Float32Array(2);
        p[0] = u;
        p[1] = v;
        return p;
    }
    static cloneIndice(i) {
        return this.createIndice(i[0], i[1], i[2], i[3]);
    }
    static clonePoint(p) {
        return this.createPoint(p[0], p[1], p[2]);
    }
    static cloneUV(uv) {
        return this.createUV(uv[0], uv[1]);
    }
    /**
     * Compose a Node Local Matrix at once
     * @param {Node} node 
     * @return {Float32Array(16)} The node local matrix
     */
    static composeNodeMatrix(node) {
        let q = App3D.eulerToQuat(node.rotationX, node.rotationY, node.rotationZ);
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x, y2 = y + y, z2 = z + z;
        let xx = x * x2, xy = x * y2, xz = x * z2;
        let yy = y * y2, yz = y * z2, zz = z * z2;
        let wx = w * x2, wy = w * y2, wz = w * z2;
        let sx = node.scaleX;
        let sy = node.scaleY;
        let sz = node.scaleZ;
        node.matL[0] = (1 - (yy + zz)) * sx;
        node.matL[1] = (xy + wz) * sx;
        node.matL[2] = (xz - wy) * sx;
        node.matL[3] = 0;
        node.matL[4] = (xy - wz) * sy;
        node.matL[5] = (1 - (xx + zz)) * sy;
        node.matL[6] = (yz + wx) * sy;
        node.matL[7] = 0;
        node.matL[8] = (xz + wy) * sz;
        node.matL[9] = (yz - wx) * sz;
        node.matL[10] = (1 - (xx + yy)) * sz;
        node.matL[11] = 0;
        node.matL[12] = node.x;
        node.matL[13] = node.y;
        node.matL[14] = node.z;
        node.matL[15] = 1;
        return node.matL;
    }
    static copyArray(a) {
        let ret = [];
        for (let i = 0; i < a.length; i++) {
            let ai = a[i];
            if (Array.isArray(ai)) {
                ret.push(App3D.copyArray(ai));
            } else {
                ret.push(ai);
            }
        }
        return ret;
    }
    static copyArrayIndice(a) {
        let ret = [];
        for (let i = 0; i < a.length; i++) {
            ret.push(this.cloneIndice(a[i]));
        }
        return ret;
    }
    static copyArrayPoint(a) {
        let ret = [];
        for (let i = 0; i < a.length; i++) {
            ret.push(this.clonePoint(a[i]));
        }
        return ret;
    }
    static copyArrayUV(a) {
        let ret = [];
        for (let i = 0; i < a.length; i++) {
            ret.push(this.cloneUV(a[i]));
        }
        return ret;
    }
    /**
     * Culling Triangle
     * @param {Float32Array(3)} p0 
     * @param {Float32Array(3)} p1 
     * @param {Float32Array(3)} p2 
     * @return {Boolean}
     */
    static cullTriangle(p0, p1, p2) {
        let q = (p0[0] * p1[1] - p1[0] * p0[1]) + (p1[0] * p2[1] - p2[0] * p1[1]) + (p2[0] * p0[1] - p0[0] * p2[1]);
        return q < 0;
    }
    /**
     * @internal
     * @param {Float} x Rotation x in degree
     * @param {Float} y Rotation y in degree
     * @param {Float} z Rotation z in degree
     * @param {Array(4)} out Optional
     */
    static eulerToQuat(x, y, z, out) {
        let hr = 0.5 * Math.PI / 180;
        let rx = x * hr,
            ry = y * hr,
            rz = z * hr;
        let sx = Math.sin(rx),
            cx = Math.cos(rx),
            sy = Math.sin(ry),
            cy = Math.cos(ry),
            sz = Math.sin(rz),
            cz = Math.cos(rz);
        let c = out || new Array(4);
        c[0] = sx * cy * cz - cx * sy * sz;
        c[1] = cx * sy * cz + sx * cy * sz;
        c[2] = cx * cy * sz - sx * sy * cz;
        c[3] = cx * cy * cz + sx * sy * sz;
        return c;
    }
    /**
     * 
     * @param {Float32Array(16)} out Optional to save output
     * @param {Float32Array(16)} a The First Matrix
     * @param {Float32Array(16)} b The Second Matrix
     */
    static multiplyMatrix(out, a, b) {
        let c = out || Float32Array(16);
        c[0] = b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12];
        c[1] = b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13];
        c[2] = b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14];
        c[3] = b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15];
        c[4] = b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12];
        c[5] = b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13];
        c[6] = b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14];
        c[7] = b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15];
        c[8] = b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12];
        c[9] = b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13];
        c[10] = b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14];
        c[11] = b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15];
        c[12] = b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12];
        c[13] = b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13];
        c[14] = b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14];
        c[15] = b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15];
        return c;
    }
    /**
     * Rotating an array of points by x axiz
     * @param {Array} a Array of Points
     * @param {Float} rad ngle in radian
     */
    static rotatePointsX(a, rad) {
        let s = Math.sin(rad),
            c = Math.cos(rad),
            i, y, z;
        for (i = 0; i < a.length; i++) {
            y = a[i][1],
            z = a[i][2];
            a[i][1] = c * y - s * z;
            a[i][2] = s * y + c * z;
        }
    }
    /**
     * Rotating an array of points by y axiz
     * @param {Array} a Array of Points
     * @param {Float} rad ngle in radian
     */
    static rotatePointsY(a, rad) {
        let s = Math.sin(rad),
            c = Math.cos(rad),
            i, x, z;
        for (i = 0; i < a.length; i++) {
            x = a[i][0],
            z = a[i][2];
            a[i][0] = c * x + s * z;
            a[i][2] = -s * x + c * z;
        }
    }
    /**
     * Rotating an array of points by z axiz
     * @param {Array} a Array of Points
     * @param {Float} rad ngle in radian
     */
    static rotatePointsZ(a, rad) {
        let s = Math.sin(rad),
            c = Math.cos(rad),
            i, x, y;
        for ( i = 0; i < a.length; i++) {
            x = a[i][0],
            y = a[i][1];
            a[i][0] = c * x - s * y;
            a[i][1] = s * x + c * y;
        }
    }
    /**
     * Scale an array of points
     * @param {Array} a Array of points
     * @param {Float} sx Scale x
     * @param {Float} sy Scale y
     * @param {Float} sz Scale z
     */
    static scalePoints(a, sx, sy, sz) {
        for (let i = 0; i < a.length; i++) {
            a[i][0] *= sx;
            a[i][1] *= sy;
            if (sz) a[i][2] *= sz;
        }
    }
    /**
     * Transform an array of points 
     * @param {Float32Array(16)} m The matrix
     * @param {Array} a Array of points
     * @param {Array} out Optional to ssave the result
     */
    static transformPoints(m, a, out) {
        if (!out) out = [];
        let i, p, w;
        for (i = 0; i < a.length; i++) {
            p = a[i];
            w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
            w = w ? 1 / w : 1.0;
            if (out.length <= i) {
                out[i] = App3D.createPoint(0, 0, 0);
            }
            out[i][0] = (m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) * w;
            out[i][1] = (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) * w;
            out[i][2] = (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) * w;
        }
        return out;
    }
    /**
     * Add position of an array of points
     * @param {Array} a Array of points
     * @param {Float} x Added value x
     * @param {Float} y Added value y
     * @param {Float} z Added value y
     */
    static translatePoints(a, x, y, z) {
        for (let i = 0; i < a.length; i++) {
            a[i][0] += x;
            a[i][1] += y;
            a[i][2] += z;
        }
    }
}
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
class ColorMaterial {
    constructor(bg, bordercolor, borderwidth) {
        this.backgroundColor = bg;
        this.borderColor = bordercolor;
        this.borderWidth = borderwidth;
    }
}
class TextureMaterial {
    constructor(img) {
        this.image = img;
    }
}
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
/**
 * Class Model
 * @property {Boolean} doubleSide Sign for culling
 * @property {Array} indice Index of Points.
 * @property {Array} materials
 * @property {Array} points Array of origin points.
 * @property {Array} pointsP Array of projected points.
 * @property {Array} uvs Array of UV.
 */
class Model extends Node {
    constructor(mat, ap, au, ai) {
        super();
        this.doubleSide = false;
        this.isModel = true;
        this.indice = ai || [];
        this.materials = mat || [];
        this.points = ap || [];
        this.pointsP = [];
        this.uvs = au || [];
        if (this.points.length > 0) {
            for (let i = 0; i < this.points.length; i++) {
                this.pointsP.push(App3D.createPoint(0, 0, 0));
            }
        }
    }
    /**
     * Create and Add idice of a triangle's points and save it to this.indice 
     * @param {Integer} m Index of Material
     * @param {Integer} a Index of Point 1
     * @param {Integer} b Index of Point 2
     * @param {Integer} c Index of Point 3
     */
    addIndice(m, a, b, c) {
        this.indice.push(App3D.createIndice(m, a, b, c));
    }
    /**
     * Create and Add a point to this.points
     * @param {Float} x Coordinate x
     * @param {Float} y Coordinate y
     * @param {Float} z Coordinate z
     */
    addPoint(x, y, z) {
        this.points.push(App3D.createPoint(x, y, z));
        this.pointsP.push(App3D.createPoint(0, 0, 0));
    }
    /**
     * Create and Add uv to this, uvs
     * @param {Float} u Horizontal position in texture / image
     * @param {Float} v Verticalal position in texture / image
     */
    addUV(u, v) {
        this.uvs.push(App3D.createUV(u, v));
    }
    clone() {
        let am = App3D.copyArray(this.materials);
        let ap = App3D.copyArrayPoint(this.points);
        let au = App3D.copyArrayUV(this.uvs);
        let ai = App3D.copyArrayIndice(this.indice);
        let mo = new Model(am, ap, au, ai);
        mo.doubleSide = this.doubleSide;
        return mo;
    }
    /**
     * @override Node.collectRenderData
     * @param {Array} collection
     */
    collectRenderData(collection) {
        let ap = this.pointsP,
            au = this.uvs,
            ai = this.indice,
            am = this.materials,
            ds = this.doubleSide;
        for (let i = 0; i < ai.length; i++) {
            let t = ai[i];
            if (ds || App3D.cullTriangle(ap[t[1]], ap[t[2]], ap[t[3]])) {
                collection.push([
                    am[t[0]].image,
                    ap[t[1]], ap[t[2]], ap[t[3]],
                    au[t[1]], au[t[2]], au[t[3]]
                ]);
            }
        }
        if (this.children.length > 0) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].collectRenderData(collection);
            }
        }
    }
    /**
     * Project this.points and save it to this.pointsP
     */
    updateMore() {
        if (this.points.length > 0) {
            this.pointsP.length = 0;
            this.pointsP = App3D.transformPoints(this.matG, this.points, this.pointsP);
        }
    }
}