export class Die {
    constructor(conf) {
        document.head.innerHTML += `<link type="text/css" rel="stylesheet" href="${conf.img}img/die.css">`;

        this.conf = conf;
        document.getElementById(this.conf.id).innerHTML = '<span class="bgam-die">test</span>';
    }

    roll() {
        document.getElementById(this.conf.id).innerHTML = '<span class="bgam-die">test rolled</span>';
    }
}