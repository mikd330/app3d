class Point {
    constructor(x, y) {
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = 0;
    }
}
class UV {
    constructor(u, v) {
        this.u = u;
        this.v = v;
    }
}
class Triangle {
    /**
     * 
     * @param {Point} p0  First point of coordinate in triangle
     * @param {Point} p1  Second point of coordinate in triangle
     * @param {Point} p2  Third point of coordinate in triangle
     * @param {UV} uv0  First texture coordinate
     * @param {UV} uv1  Second texture coordinate
     * @param {UV} uv2  Third texture coordinate
     */
    constructor(p0, p1, p2, uv0, uv1, uv2) {
        this.points = [p0, p1, p2];
        this.uvs = [uv0, uv1, uv2];
    }
    get z() {
        return ((this.points[0].z + this.points[1].z + this.points[2].z) / 3);
    }

}
class Circle {
    /**
     * 
     * @param {number} x position x
     * @param {number} y position y
     * @param {number} r radius of the circle
     */
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.radius = r || 8;
    }
    draw (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
class DistortImage {
    /**
     * 
     * @param {image} image for texture
     * @param {integer} segX Number of horizontal segments
     * @param {integer} segY Number of vertical segments
     */
    constructor(image, segX, segY) {
        this.texture = image;
        this.triangles = [];
        // for interaction
        this.circles = [
            new Circle(64, 48),
            new Circle(264, 48),
            new Circle(264, 248),
            new Circle(64, 248)
        ];
        this.segX = segX || 8;
        this.segY = segY || 8;
        this.anim = null;
        this.curC = null;
        this.needDraw = true;
    }
    /**
     * 
     * @param {CanvasContext2d} ctx 
     */
    draw(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Save image for fast access
        let tex = this.texture;
        // Draw triangles
        for (let i = 0; i < this.triangles.length; i++) {
            let tp = this.triangles[i].points,
                uv = this.triangles[i].uvs;
            this.drawTriangle(
                ctx,
                tex,
                tp[0].x, tp[0].y,
                tp[1].x, tp[1].y,
                tp[2].x, tp[2].y,
                uv[0].u, uv[0].v,
                uv[1].u, uv[1].v,
                uv[2].u, uv[2].v
            )
        }
        // Request to draw circles
        this.drawCircles(ctx);
        // Sign no need to draw
        this.needDraw = false;
    }
    /**
     * 
     * @param {CanvasContext2d} ctx 
     */
    drawCircles(ctx) {
        // Apply style
        ctx.fillStyle = "#ffff00";
        ctx.strokeStyle = "#33000";
        ctx.lineWidth = 2;
        // Draw each circle
        for (let i = 0; i < 4; i++) {
            this.circles[i].draw(ctx);
        }
    }
    /**
     * 
     * @param {CanvasRenderingContext2d} ctx 
     * @param {image} im 
     * @param {Float} x0 
     * @param {Float} y0 
     * @param {Float} x1 
     * @param {Float} y1 
     * @param {Float} x2 
     * @param {Float} y2 
     * @param {Float} u0 
     * @param {Float} v0 
     * @param {Float} u1 
     * @param {Float} v1 
     * @param {Float} u2 
     * @param {Float} v2 
     */
    drawTriangle(ctx, im, x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2) {
        // Creeate transform matrix for image
        let _k = u1 * v2,
            _l = u2 * v1,
            _m = v2 - v1,
            _n = u1 - u2,
            det = u0 * _m - _k + _l + _n * v0;
        if (det == 0) {
            //console.log("Error: det = " + det);
            return;
        }
        det = 1 / det;
        let _o = x2 - x1,
            _p = y1 - y2,
            _q = _l - _k,
            _r = v1 * x2,
            _s = v2 * x1,
            _t = u1 * y2,
            _u = u2 * y1,
            _v = v1 * y2,
            _w = v2 * y1,
            _x = u1 * x2,
            _y = u2 * x1;
        let a = -(v0 * _o - _r + _s + (v1 - v2) * x0) * det,
            d = -(u0 * _p + _t - _u + (u2 - u1) * y0) * det,
            c = (u0 * _o - _x + _y + _n * x0) * det,
            b = (v0 * _p + _v - _w + _m * y0) * det,
            e = (u0 * (_s - _r) + v0 * (_x - _y) + _q * x0) * det,
            f = (u0 * (_w - _v) + v0 * (_t - _u) + _q * y0) * det;
        // save drawing context
        ctx.save();
        // draw path
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        // draw image
        ctx.clip();
        ctx.transform(a, b, c, d, e, f);
        ctx.drawImage(im, 0, 0);
        // restore drawing context
        ctx.restore();
    }
    /**
     * 
     * @param {Float} w width
     * @param {Float} h height
     * @param {Integer} segX segment x
     * @param {Integer} segY segment y
     */
    generate(w, h) {
        let tris = [],
            segX = this.segX,
            segY = this.segY,
            iw = this.texture.naturalWidth,
            ih = this.texture.naturalHeight,
            ix = 1 / segX,
            iy = 1 / segY;
        let i, ri, rn, riX1, riX2, riY1, riY2, rnX1, rnX2, rnY1, rnY2;
        let j, cj, cn, djX, djY, dnX, dnY;
        let u1, u2, v1, v2, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y;
        for (i = 0; i < segY; ++i) {
            ri = i * iy;
            rn = (i + 1) * iy;
            riX1 = w * ri + 64;
            riX2 = w * ri + 64;

            riY1 = h * ri + 48;
            riY2 = h * ri + 48;

            rnX1 = w * rn + 64;
            rnX2 = w * rn + 64;

            rnY1 = h * rn + 48;
            rnY2 = h * rn + 48;
            djX = riX2 - riX1;
            djY = riY2 - riY1;
            dnX = rnX2 - rnX1;
            dnY = rnY2 - rnY1;
            // v
            v1 = ri * ih;
            v2 = rn * ih;
            for (j = 0; j < segX; ++j) {
                cj = j * ix;
                cn = (j + 1) * ix;
                // point
                p1x = riX1 + djX * cj;
                p1y = riY1 + djY * cj;
                p2x = riX1 + (riX2 - riX1) * cn;
                p2y = riY1 + (riY2 - riY1) * cn;
                p3x = rnX1 + dnX * cn;
                p3y = rnY1 + dnY * cn;
                p4x = rnX1 + dnX * cj;
                p4y = rnY1 + dnY * cj;
                // u
                u1 = cj * iw;
                u2 = cn * iw;
                // create 2 triangles
                tris.push(new Triangle(
                    new Point(p1x, p1y), new Point(p3x, p3y), new Point(p4x, p4y),
                    new UV(u1, v1), new UV(u2, v2), new UV(u1, v2)
                ));
                tris.push(new Triangle(
                    new Point(p1x, p1y), new Point(p2x, p2y), new Point(p3x, p3y),
                    new UV(u1, v1), new UV(u2, v1), new UV(u2, v2)
                ));
            }
        }
        this.triangles = tris;
        // adjust circles position
        this.circles[0].x =
            this.circles[3].x =
            this.circles[0].y =
            this.circles[1].y = 16;
        this.circles[1].x =
            this.circles[2].x = w + 16;
        this.circles[2].y =
            this.circles[3].y = h + 16;
        this.needDraw = true;
    }
    /**
     * 
     * @param {Point} p Current ouse position
     */
    handleMouseDown(p) {
        this.curC = null;
        for (let i = 0; i < 4; i++) {
            let dx = Math.abs(p.x - this.circles[i].x);
            let dy = Math.abs(p.y - this.circles[i].y);
            if (dx < 8 && dy < 8) {
                this.curC = this.circles[i];
                break;
            }
        }
    }
    /**
     * 
     * @param {Point} p Current ouse position
     */
    handleMouseMove(p) {
        if (this.curC) {
            this.curC.x = p.x;
            this.curC.y = p.y;
            this.needDraw = true;
        }
    }
    /**
     * 
     * @param {Point} p Current ouse position
     */
    handleMouseUp(p) {
        if (this.curC) {
            this.curC = null;
        }
    }
    /**
     * 
     * @param {Circle} p1 Circle 1
     * @param {Circle} p2 Circle 2
     * @param {Circle} p3 Circle 3
     * @param {Circle} p4 Circle 4
     */
    recalcPoints(p1, p2, p3, p4) {
        let dx1 = p4.x - p1.x, dy1 = p4.y - p1.y,
            dx2 = p3.x - p2.x, dy2 = p3.y - p2.y,
            segX = this.segX, segY = this.segY,
            ix = 1 / segX, iy = 1 / segY,
            tidx = 0;
        let i, ri, rn, riX1, riY1, riX2, riY2, rnX1, rnY1, rnX2, rnY2, djX, djY;
        let j, cj, cn, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, tri, dnX, dnY;
        for (i = 0; i < segY; ++i) {
            ri = i * iy, rn = (i + 1) * iy;
            riX1 = p1.x + dx1 * ri, riY1 = p1.y + dy1 * ri;
            riX2 = p2.x + dx2 * ri, riY2 = p2.y + dy2 * ri;
            rnX1 = p1.x + dx1 * rn, rnY1 = p1.y + dy1 * rn;
            rnX2 = p2.x + dx2 * rn, rnY2 = p2.y + dy2 * rn;
            djX = riX2 - riX1, djY = riY2 - riY1;
            dnX = rnX2 - rnX1, dnY = rnY2 - rnY1;
            for (j = 0; j < segX; ++j) {
                cj = j * ix, cn = (j + 1) * ix;
                p1x = riX1 + djX * cj, p1y = riY1 + djY * cj;
                p2x = riX1 + djX * cn, p2y = riY1 + djY * cn;
                p3x = rnX1 + dnX * cn, p3y = rnY1 + dnY * cn;
                p4x = rnX1 + dnX * cj, p4y = rnY1 + dnY * cj;
                tri = this.triangles[tidx];
                tri.points[0].x = p1x; tri.points[0].y = p1y;
                tri.points[1].x = p3x; tri.points[1].y = p3y;
                tri.points[2].x = p4x; tri.points[2].y = p4y;
                tri = this.triangles[tidx + 1];
                tri.points[0].x = p1x; tri.points[0].y = p1y;
                tri.points[1].x = p2x; tri.points[1].y = p2y;
                tri.points[2].x = p3x; tri.points[2].y = p3y;
                tidx += 2;
            }
        }
    }
    /**
     * 
     * @param {Number} w width 
     * @param {Number} h height
     */
    resize(w, h) {
        circles[0].x = this.circles[3].x = 32;
        circles[1].x = this.circles[2].x = w - 32;
        circles[2].y = this.circles[3].y = h - 32;
        needDraw = true;
    }
    /**
     * 
     * @param {CanvasContext2d} ctx 
     */
    update(ctx) {
        this.recalcPoints(
            this.circles[0],
            this.circles[1],
            this.circles[2],
            this.circles[3]
        );
        this.draw(ctx);
    }
}
class MyApp {
    /**
     * 
     * @param {Canvas}
     * @param {string} imagesrc image's path for texture
     */
    constructor(cvs, imagesrc) {
        // Get Canvas
        this.cvs = cvs
        this.ctx = cvs.getContext("2d");
        // Create Image for texture
        let image = new Image();
        // Create DistortImage
        this.di = new DistortImage(image, 8, 8);
        // Create point for saving mouse position
        this.mousePos = new Point();
        // when the image loaded
        image.addEventListener("load", (e) => {
            // ask DistortImage to generate triangles
            this.di.generate(
                this.cvs.width - 48, this.cvs.height - 48,
                this.segX, this.segY
            );
            // then updating
            this.start();
        });
        // load the image
        image.src = imagesrc;
        // mouse events:
        this.cvs.addEventListener("mousedown", (e) => {
            this.di.handleMouseDown(this.getMousePosition(e));
        });
        this.cvs.addEventListener("mousemove", (e) => {
            this.di.handleMouseMove(this.getMousePosition(e));
        });
        this.cvs.addEventListener("mouseup", (e) => {
            this.di.handleMouseUp(this.getMousePosition(e));
        });
        /*
        window.addEventListener("resize", (e) => {
            this.cvs.width = window.innerWidth - 64;
            this.cvs.height = window.innerHeight - 64;
            this.di.resize (this.cvs.width, this.cvs.height);
        });
        */
    }
    /**
     * 
     * @param {MouseEvent} e 
     */
    getMousePosition(e) {
        // get the canvas rectangle
        let r = this.cvs.getBoundingClientRect();
        // correct mouse position
        this.mousePos.x = e.clientX - r.x;
        this.mousePos.y = e.clientY - r.y;
        // return the mouse position
        return this.mousePos;
    }
    // request next frame
    start() {
        this.anim = window.requestAnimationFrame((e) => {
            this.step();
        });
    }
    // update the DistortImage
    // then request next frame
    step() {
        this.di.update(this.ctx);
        this.anim = window.requestAnimationFrame(() => {
            this.step();
        });
    }
    // cancel request for next frame
    stop() {
        if (this.anim) {
            window.cancelAnimationFrame(this.anim);
        }
    }
}
// when html loaded,
window.onload = function (e) {
    // create application
    let app = new MyApp(
        document.getElementById("cvs"),
        "images/myimage.jpg");
};