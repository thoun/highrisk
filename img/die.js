export class Die {
    die = null;

    constructor(die, conf) {
        this.die = die;
        this.conf = {
            faces: 6,
            ...conf
        };

        if (!this.conf.backgroundImage && !this.conf.color) {
            throw new Error(`Die ${die.id} conf doesn't have a backgroundImage or a color`);
        }
        if (this.conf.color && !this.conf.color.match(/^\w{6}$/)) {
            throw new Error(`Die ${die.id} color isn't valid (should be 6-char hexacolor without #)`);
        }

        this.addCss();

        document.getElementById(this.conf.containerId).innerHTML = this.createDieHtml(die);

        const div = this.getDieDiv()
        div.addEventListener('animationend', e => {
            if (e.animationName == 'rolled-dice') {
                div.dataset.rolled = 'false';
            }
        });

        this.setRolled(die.rolled);
    }

    addCss() {
        if (!document.getElementById('bgam-die-css')) {
            var link = document.createElement('link');
            link.id = 'bgam-die-css';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = `${this.conf.img}img/die.css`;
            document.head.appendChild(link);
        }
    }

    createDieHtml(die) {
        const dotted = !this.conf.backgroundImage;
        const blackDot = dotted ? [parseInt(this.conf.color.substr(0, 2), 16), parseInt(this.conf.color.substr(2, 2), 16), parseInt(this.conf.color.substr(4, 2), 16)].reduce((a, b) => a+b) > 460 : false;

        let html = `<div id="bgam-die${die.id}" class="bgam-die" data-dice-id="${die.id}" data-dice-value="${die.value}">
        <ol class="die-list" data-roll="${die.value}">`;

        let dieItemStyle = ``;
        if (this.conf.color) {
            dieItemStyle += `background-color: #${this.conf.color}; border-color: #${this.conf.color};`;
        }
        if (this.conf.backgroundImage) {
            dieItemStyle += `background-image: url('${this.conf.img}img/${this.conf.backgroundImage}');`;
        }

        for (let dieFace=1; dieFace<=this.conf.faces; dieFace++) {
            html += `<li class="die-item side${dieFace} ${this.conf.backgroundImage ? '' : 'dotted'}" style="${dieItemStyle}" data-side="${dieFace}">`;
            if (dotted) {
                for (let i=1; i<=dieFace; i++) {
                    html += `<span class="dot ${blackDot ? 'black-dot' : 'white-dot'}"></span>`;
                }
            }
            html += `</li>`;
        }
        html += `</ol>
        </div>`;

        return html;
    }

    addRollToDiv(dieDiv, rollType, attempt = 0) {
        const dieList = dieDiv.getElementsByClassName('die-list')[0];
        if (dieList) {
            dieList.dataset.rollType = rollType;
        } else if (attempt < 5) {
            setTimeout(() => this.addRollToDiv(dieDiv, rollType, attempt + 1), 200); 
        }
    }
    
    getDieDiv() {
        return document.getElementById(`bgam-die${this.die.id}`);
    }

    setRolled(rolled) {
        const dieDiv = this.getDieDiv();

        dieDiv.dataset.rolled = rolled ? 'true' : 'false';
        if (rolled) {            
            setTimeout(() => this.addRollToDiv(dieDiv, Math.random() < 0.5 ? 'odd' : 'even'), 200); 
        } else {
            this.addRollToDiv(dieDiv, '-');
        }
    }
}