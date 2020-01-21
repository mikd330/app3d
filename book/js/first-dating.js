class Lesson1 {
    constructor(cvs) {
        this.cvs = cvs;
        this.ctx = cvs.getContext("2d");
		/*
           4 ------ 5
         / |      / |
        0 ------ 1  |
        |  |     |  |
        |  7 ----|- 6
        |/       | /
        3 ------ 2
        */
        this.apo = new Float32Array([-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5]);
        this.apt = new Float32Array(this.apo.length);
        this.afc = new Float32Array([0, 1, 2, 3, 1, 5, 6, 2, 5, 4, 7, 6, 4, 0, 3, 7, 3, 2, 6, 7, 4, 5, 1, 0]);
        this.colors = ["#ff0000", "#ffff00", "#00ffaa", "#0077ff", "#0000ff", "#ffcc00"];
		this.rot = 0.0;
        this.init(100);
    }
    init(scl) {
        let a = this.apo,
		i;
        for (i = 0; i < a.length; i += 3) {
            a[i] *= scl;
            a[i + 1] *= scl;
            a[i + 2] *= scl;
        }
		let r = Math.PI / 4;
		let s = Math.sin(r),
            c = Math.cos(r),
            y,
			z;
        for (i = 0; i < a.length; i += 3) {
            y = a[i+1],
            z = a[i+2];
            a[i+1] = c * y - s * z;
            a[i+2] = s * y + c * z;
        }
    }
	sortZ (a, b) {
		return a[5] == b[5] ? 0 : a[5] > b[5] ? 1 : -1;
	}
    tick() {
        this.rot = (this.rot + Math.PI / 90) % (Math.PI * 2);
        let a = this.apo,
        b = this.apt,
        c = Math.cos(this.rot),
        s = Math.sin(this.rot),
        d = 200,
        w = this.cvs.width * 0.5,
        h = this.cvs.height * 0.5;
        let di = 1 / d,
        i,
        scl;
        for (i = 0; i < a.length; i += 3) {
            b[i] = s * a[i + 2] + c * a[i];
            b[i + 1] = a[i + 1];
            b[i + 2] = c * a[i + 2] - s * a[i];
            scl = 1 - b[i + 2] * di;
            b[i] = w + scl * b[i];
            b[i + 1] = h - scl * b[i + 1];
        }
        let afc = this.afc,
        atr = [],
        i1,
        i2,
        i3,
        i4;
        for (i = 0; i < afc.length; i += 4) {
            i1 = afc[i] * 3;
            i2 = afc[i + 1] * 3;
            i3 = afc[i + 2] * 3;
            i4 = afc[i + 3] * 3;
            atr.push([
				atr.length,
                [b[i1], b[i1 + 1], b[i1 + 2]],
                [b[i2], b[i2 + 1], b[i2 + 2]],
                [b[i3], b[i3 + 1], b[i3 + 2]],
                [b[i4], b[i4 + 1], b[i4 + 2]],
                (b[i1 + 2] + b[i2 + 2] + b[i3 + 2] + b[i4 + 2]) * 0.25
            ]);
        }
        atr.sort(this.sortZ);
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
        this.ctx.save();
		this.ctx.lineWidth = 2
		this.ctx.strokeStyle = "#ffffff";
        let o;
        while (atr.length > 0) {
            o = atr.pop();
            this.ctx.beginPath();
            this.ctx.moveTo(o[1][0], o[1][1]);
            this.ctx.lineTo(o[2][0], o[2][1]);
            this.ctx.lineTo(o[3][0], o[3][1]);
            this.ctx.lineTo(o[4][0], o[4][1]);
            this.ctx.closePath();
			this.ctx.globalAlpha = 0.8;
			this.ctx.fillStyle = this.colors[o[0]];
			this.ctx.fill();
			this.ctx.globalAlpha = 1.0;
            this.ctx.stroke();
			o.length = 0;
        }
        this.ctx.restore();
        window.requestAnimationFrame((o) => {
            this.tick();
        });
    }
}
window.onload = function (e) {
    let demo = new Lesson1(document.getElementById("cvs"));
    window.requestAnimationFrame((o) => {
        demo.tick();
    });
};
