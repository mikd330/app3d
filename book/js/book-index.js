
class BookIndexManager {
    constructor () {
        this.lbox  = document.getElementById("box21");
        this.frame = document.getElementById("frame");
        this.frame.data = "book-first-dating.html";

        this.resize();
        this.accordionInit();
        window.addEventListener("resize", (e) => {
            this.resize(e);
        });
    }
    accordionInit () {
        let a = document.querySelectorAll(".ac-item");
        for (let i = 0; i < a.length; i++) {
            a[i].addEventListener("click", this.accordionClick);
        }
    }
    accordionClick (e) {
        let s = e.target.getAttribute("data-lnk");
        if (s) frame.data = s;
    }
    resize(e) {
        let wi = window.innerWidth;
        if (wi <= 320) {
            this.frame.style.width = 
            this.lbox.style.width = (wi - 20) + "px";
        } else {
            this.lbox.style.width = "256px";
            this.frame.style.width = (window.innerWidth - 312) + "px";
        }
        this.frame.style.height = this.lbox.style.height = (window.innerHeight - 128) + "px";
    }    

}

window.addEventListener("load", (e) => {
    let piManager = new BookIndexManager();
});