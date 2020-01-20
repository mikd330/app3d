class App3DSetter {
    constructor () {
        this.view = document.createElement("div");
        this.view.style.position = "absolute";
        this.view.style.top = "1em";
        this.view.style.padding = "1em";
        this.view.style.border = "solid 1px #444444";
        this.form = document.createElement("form");
        this.view.appendChild(this.form);
        document.body.appendChild(this.view);
        this.form.innerHTML = '<br>' +
            '<input type="range" name="fov"/><label style="margin-left:1em;">Fov</label><br>' +
            '<input type="range" name="near"/><label style="margin-left:1em;">Near</label><br>' +
            '<input type="range" name="far"/><label style="margin-left:1em;">Far</label><br>' +
            '<input type="range" name="upx"/><label style="margin-left:1em;">Up X</label><br>' +
            '<input type="range" name="upy"/><label style="margin-left:1em;">Up Y</label><br>' +
            '<input type="range" name="upz"/><label style="margin-left:1em;">Up Z</label><br>' +
            '<input type="range" name="camx"/><label style="margin-left:1em;">Camera X</label><br>' +
            '<input type="range" name="camy"/><label style="margin-left:1em;">Camera Y</label><br>' +
            '<input type="range" name="camz"/><label style="margin-left:1em;">Camera Z</label><br>' +
            '<input type="range" name="roty"/><label style="margin-left:1em;">Rotation Y</label><br>' +
            '<input type="range" name="rotz"/><label style="margin-left:1em;">Rotation Z</label><br>' +
            '<input type="range" name="rotx"/><label style="margin-left:1em;">Rotation X</label><br>';
        
        this.fov = App3D.createPoint(App3D.instance.Fov, 0.1, 0.9);
        this.near = App3D.createPoint(App3D.instance.Near, 1, 100);
        this.far = App3D.createPoint(App3D.instance.Far, 100, 1000);
        this.upX = new Int8Array(3);
        this.upY = new Int8Array(3);
        this.upZ = new Int8Array(3);
        this.upX[0] = 0; this.upX[1] = -1; this.upX[2] = 1;
        this.upY[0] = 1; this.upY[1] = -1; this.upY[2] = 1;
        this.upZ[0] = 0; this.upZ[1] = -1; this.upZ[2] = 1;
        this.camX = App3D.createPoint(App3D.instance.cam.x, -200, 200);
        this.camY = App3D.createPoint(App3D.instance.cam.y, -200, 200);
        this.camZ = App3D.createPoint(App3D.instance.cam.z, -10, -800);
        this.rotX = App3D.createPoint(0, -180, 180);
        this.rotY = App3D.createPoint(0, -180, 180);
        this.rotZ = App3D.createPoint(0, -180, 180);
        
        this.form.elements.fov.value = (this.fov[0] - this.fov[1]) / (this.fov[2] - this.fov[1]) * 100;
        this.form.elements.near.value = (this.near[0] - this.near[1]) / (this.near[2] - this.near[1]) * 100;
        this.form.elements.far.value = (this.far[0] - this.far[1]) / (this.far[2] - this.far[1]) * 100;
        this.form.upx.value = 0;
        this.form.upy.value = 100;
        this.form.upz.value = 0;
        this.form.elements.camx.value = (this.camX[0] - this.camX[1]) / (this.camX[2] - this.camX[1]) * 100;
        this.form.elements.camy.value = (this.camY[0] - this.camY[1]) / (this.camY[2] - this.camY[1]) * 100;
        this.form.elements.camz.value = (this.camZ[0] - this.camZ[1]) / (this.camZ[2] - this.camZ[1]) * 100;
        this.form.elements.rotx.value = (this.rotX[0] - this.rotX[1]) / (this.rotX[2] - this.rotX[1]) * 100;
        this.form.elements.roty.value = (this.rotY[0] - this.rotY[1]) / (this.rotY[2] - this.rotY[1]) * 100;
        this.form.elements.rotz.value = (this.rotZ[0] - this.rotZ[1]) / (this.rotZ[2] - this.rotZ[1]) * 100;
        console.log(this.form);
        this.form.addEventListener("pointermove", (e) => {
            let t = e.target;
            if (e.target.type != "range") return;
            console.log(e);
            let v = t.value;
            let n = t.name;
            switch (n) {
                case "fov":
                    App3D.instance.Fov = v / 100 * (this.fov[2]-this.fov[1]) + this.fov[0];
                    break;
                case "near":
                    App3D.instance.Near = v / 100 * (this.near[2]-this.near[1]) + this.near[0];
                    break;
                case "far":
                    App3D.instance.Far = v / 100 * (this.far[2]-this.far[1]) + this.far[0];
                    break;
                case "upx":
                    v = v < 30 ? -1 : v > 70 ? 1 : 0;
                    t.value = v * 100;
                    App3D.instance.cam.headX = v;
                    break;
                case "upy":
                    v = v < 30 ? -1 : v > 70 ? 1 : 0;
                    t.value = v * 100;
                    App3D.instance.cam.headY = v;
                    break;
                case "upz":
                    v = v < 30 ? -1 : v > 70 ? 1 : 0;
                    t.value = v * 100;
                    App3D.instance.cam.headZ = v;
                    break;
                case "camx":
                    App3D.instance.cam.x = v / 100 * (this.camX[2]-this.camX[1]) + this.camX[0];
                    break;
                case "camy":
                    App3D.instance.cam.y = v / 100 * (this.camY[2]-this.camY[1]) + this.camY[0];
                    break;
                case "camz":
                    App3D.instance.cam.z = v / 100 * (this.camZ[2]-this.camZ[1]) + this.camZ[0];
                    break;
                case "rotx":
                    App3D.instance.world.rotationX = v / 100 * (this.rotX[2]-this.rotX[1]) + this.rotX[0];
                    break;
                case "roty":
                    App3D.instance.world.rotationY = v / 100 * (this.rotY[2]-this.rotY[1]) + this.fov[0];
                    break;
                case "rotz":
                    App3D.instance.world.rotationZ = v / 100 * (this.rotZ[2]-this.rotZ[1]) + this.rotZ[0];
                    break;
                default:
                    break;   
            }
        });
    }

}