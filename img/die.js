export class Die {
    constructor(conf) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = `${conf.img}img/die.css`;
        document.head.appendChild(link);

        this.conf = conf;
        document.getElementById(this.conf.id).innerHTML = '<span class="bgam-die">test</span>';
    }

    roll() {
        document.getElementById(this.conf.id).innerHTML = '<span class="bgam-die">test rolled</span>';
    }
}