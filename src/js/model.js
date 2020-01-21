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