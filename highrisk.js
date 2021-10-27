function slideToObjectAndAttach(game, object, destinationId, posX, posY) {
    return new Promise((resolve) => {
        const destination = document.getElementById(destinationId);
        if (destination.contains(object)) {
            return resolve(false);
        }
        object.style.zIndex = '10';
        const animation = (posX || posY) ?
            game.slideToObjectPos(object, destinationId, posX, posY) :
            game.slideToObject(object, destinationId);
        dojo.connect(animation, 'onEnd', dojo.hitch(this, () => {
            object.style.top = 'unset';
            object.style.left = 'unset';
            object.style.position = 'relative';
            object.style.zIndex = 'unset';
            destination.appendChild(object);
            resolve(true);
        }));
        animation.play();
    });
}
function transitionToObjectAndAttach(object, destinationId, zoom) {
    return new Promise((resolve) => {
        const destination = document.getElementById(destinationId);
        if (destination.contains(object)) {
            return resolve(false);
        }
        const destinationBR = document.getElementById(destinationId).getBoundingClientRect();
        const originBR = object.getBoundingClientRect();
        const deltaX = destinationBR.left - originBR.left;
        const deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transition = `transform 0.5s linear`;
        object.style.transform = `translate(${deltaX / zoom}px, ${deltaY / zoom}px)`;
        setTimeout(() => {
            object.style.zIndex = null;
            object.style.transition = null;
            object.style.transform = null;
            destination.appendChild(object);
            resolve(true);
        }, 500);
    });
}
class DiceManager {
    constructor(game, setupDice) {
        this.game = game;
        this.dice = [];
        // TODO use setupDice ?
    }
    hideLock() {
        dojo.addClass('locked-dice', 'hide-lock');
    }
    showLock() {
        dojo.removeClass('locked-dice', 'hide-lock');
    }
    getLockedDice() {
        return this.dice.filter(die => die.locked);
    }
    destroyFreeDice() {
        const freeDice = this.dice.filter(die => !die.locked);
        freeDice.forEach(die => this.removeDice(die));
        return freeDice.map(die => die.id);
    }
    removeAllDice() {
        this.dice.forEach(die => this.removeDice(die));
        this.clearDiceHtml();
        this.dice = [];
    }
    setDiceForThrowDice(dice, inTokyo, isCurrentPlayerActive) {
        var _a;
        this.action = 'move';
        (_a = this.dice) === null || _a === void 0 ? void 0 : _a.forEach(die => this.removeDice(die));
        this.clearDiceHtml();
        this.dice = dice;
        const selectable = isCurrentPlayerActive;
        dice.forEach(die => this.createDice(die, selectable, inTokyo));
        dojo.toggleClass('rolled-dice', 'selectable', selectable);
    }
    disableDiceAction() {
        dojo.removeClass('rolled-dice', 'selectable');
        this.action = undefined;
    }
    setDiceForChangeDie(dice, args, inTokyo, isCurrentPlayerActive) {
        var _a;
        this.action = args.hasHerdCuller || args.hasPlotTwist || args.hasStretchy || args.hasClown ? 'change' : null;
        this.changeDieArgs = args;
        if (this.dice.length) {
            dice.forEach(die => {
                const divId = `dice${die.id}`;
                const selectable = isCurrentPlayerActive && this.action !== null && (!onlyHerdCuller || die.value !== 1);
                dojo.toggleClass(divId, 'selectable', selectable);
            });
            return;
        }
        (_a = this.dice) === null || _a === void 0 ? void 0 : _a.forEach(die => this.removeDice(die));
        this.clearDiceHtml();
        this.dice = dice;
        const onlyHerdCuller = args.hasHerdCuller && !args.hasPlotTwist && !args.hasStretchy && !args.hasClown;
        dice.forEach(die => {
            const divId = `dice${die.id}`;
            this.createAndPlaceDiceHtml(die, inTokyo, `locked-dice${die.value}`);
            const selectable = isCurrentPlayerActive && this.action !== null && (!onlyHerdCuller || die.value !== 1);
            dojo.toggleClass(divId, 'selectable', selectable);
            this.addDiceRollClass(die);
            if (selectable) {
                document.getElementById(divId).addEventListener('click', event => this.dieClick(die, event));
            }
        });
    }
    setDiceForSelectHeartAction(dice, inTokyo) {
        this.action = null;
        if (this.dice.length) {
            return;
        }
        this.clearDiceHtml();
        this.dice = dice;
        dice.forEach(die => {
            this.createAndPlaceDiceHtml(die, inTokyo, `locked-dice${die.value}`);
            this.addDiceRollClass(die);
        });
    }
    setDiceForPsychicProbe(dice, inTokyo, isCurrentPlayerActive = false) {
        this.action = 'psychicProbeRoll';
        /*if (this.dice.length) { if active, event are not reset and roll is not applied
            return;
        }*/
        this.clearDiceHtml();
        this.dice = dice;
        dice.forEach(die => {
            this.createAndPlaceDiceHtml(die, inTokyo, `locked-dice${die.value}`);
            this.addDiceRollClass(die);
            if (isCurrentPlayerActive) {
                const divId = `dice${die.id}`;
                document.getElementById(divId).addEventListener('click', event => this.dieClick(die, event));
            }
        });
        dojo.toggleClass('rolled-dice', 'selectable', isCurrentPlayerActive);
    }
    changeDie(dieId, inTokyo, toValue, roll) {
        const die = this.dice.find(die => die.id == dieId);
        const divId = `dice${dieId}`;
        const div = document.getElementById(divId);
        if (div) {
            dojo.removeClass(div, `dice${div.dataset.diceValue}`);
            div.dataset.diceValue = '' + toValue;
            dojo.addClass(div, `dice${toValue}`);
            const list = div.getElementsByTagName('ol')[0];
            list.dataset.rollType = roll ? 'odd' : 'change';
            if (roll) {
                this.addDiceRollClass({
                    id: dieId,
                    rolled: roll
                });
            }
            if (inTokyo) {
                if (die.value !== 4 && toValue === 4) {
                    dojo.place('<div class="icon forbidden"></div>', divId);
                }
                else if (die.value === 4 && toValue !== 4) {
                    Array.from(div.getElementsByClassName('forbidden')).forEach((elem) => dojo.destroy(elem));
                }
            }
            list.dataset.roll = '' + toValue;
        }
        if (die) {
            die.value = toValue;
        }
    }
    showCamouflageRoll(dice) {
        this.clearDiceHtml();
        dice.forEach((dieValue, index) => {
            const die = {
                id: index,
                value: dieValue.value,
                extra: false,
                locked: false,
                rolled: dieValue.rolled,
            };
            this.createAndPlaceDiceHtml(die, false, `dice-selector`);
            this.addDiceRollClass(die);
        });
    }
    clearDiceHtml() {
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`locked-dice${i}`).innerHTML = '';
        }
        document.getElementById(`dice-selector`).innerHTML = '';
    }
    resolveNumberDice(args) {
        const dice = this.dice.filter(die => die.value === args.diceValue);
        this.game.displayScoring(`dice${(dice[1] || dice[0]).id}`, this.game.isHalloweenExpansion() ? '000000' : '96c93c', args.deltaPoints, 1500);
        this.dice.filter(die => die.value === args.diceValue).forEach(die => this.removeDice(die, 1000, 1500));
    }
    resolveHealthDiceInTokyo() {
        this.dice.filter(die => die.value === 4).forEach(die => this.removeDice(die, 1000));
    }
    addDiceAnimation(diceValue, playerIds, number, targetToken) {
        let dice = this.dice.filter(die => die.value === diceValue && document.getElementById(`dice${die.id}`).dataset.animated !== 'true');
        if (number) {
            dice = dice.slice(0, number);
        }
        playerIds.forEach((playerId, playerIndex) => {
            const shift = targetToken ? 16 : 59;
            dice.forEach((die, dieIndex) => {
                const dieDiv = document.getElementById(`dice${die.id}`);
                dieDiv.dataset.animated = 'true';
                const origin = dieDiv.getBoundingClientRect();
                const animationId = `dice${die.id}-player${playerId}-animation`;
                dojo.place(`<div id="${animationId}" class="animation animation${diceValue}"></div>`, `dice${die.id}`);
                setTimeout(() => {
                    const middleIndex = dice.length - 1;
                    const deltaX = (dieIndex - middleIndex) * 220;
                    document.getElementById(animationId).style.transform = `translate(${deltaX}px, 100px) scale(1)`;
                }, 50);
                setTimeout(() => {
                    let targetId = `monster-figure-${playerId}`;
                    if (targetToken) {
                        const tokensDivs = document.querySelectorAll(`div[id^='token-wrapper-${playerId}-${targetToken}-token'`);
                        targetId = tokensDivs[tokensDivs.length - (dieIndex + 1)].id;
                    }
                    let destination = document.getElementById(targetId).getBoundingClientRect();
                    const deltaX = destination.left - origin.left + shift * this.game.getZoom();
                    const deltaY = destination.top - origin.top + shift * this.game.getZoom();
                    document.getElementById(animationId).style.transition = `transform 0.5s ease-in`;
                    document.getElementById(animationId).style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${0.3 * this.game.getZoom()})`;
                }, 1000);
                if (playerIndex === playerIds.length - 1) {
                    this.removeDice(die, 500, 2500);
                }
            });
        });
    }
    resolveHealthDice(playerId, number, targetToken) {
        this.addDiceAnimation(4, [playerId], number, targetToken);
    }
    resolveEnergyDice(args) {
        this.addDiceAnimation(5, [args.playerId]);
    }
    resolveSmashDice(args) {
        this.addDiceAnimation(6, args.smashedPlayersIds);
    }
    toggleLockDice(die, event, forcedLockValue = null) {
        if ((event === null || event === void 0 ? void 0 : event.altKey) || (event === null || event === void 0 ? void 0 : event.ctrlKey)) {
            let dice = [];
            if (event.ctrlKey && event.altKey) { // move everything but die.value dice
                dice = this.dice.filter(idie => idie.locked === die.locked && idie.value !== die.value);
            }
            else if (event.ctrlKey) { // move everything with die.value dice
                dice = this.dice.filter(idie => idie.locked === die.locked && idie.value === die.value);
            }
            else { // move everything but die
                dice = this.dice.filter(idie => idie.locked === die.locked && idie.id !== die.id);
            }
            dice.forEach(idie => this.toggleLockDice(idie, null));
            return;
        }
        die.locked = forcedLockValue === null ? !die.locked : forcedLockValue;
        const dieDivId = `dice${die.id}`;
        const dieDiv = document.getElementById(dieDivId);
        const destinationId = die.locked ? `locked-dice${die.value}` : `dice-selector`;
        const tempDestinationId = `temp-destination-wrapper-${destinationId}-${die.id}`;
        const tempOriginId = `temp-origin-wrapper-${destinationId}-${die.id}`;
        if (document.getElementById(destinationId)) {
            dojo.place(`<div id="${tempDestinationId}" style="width: 0px; height: ${dieDiv.clientHeight}px; display: inline-block; margin: 0;"></div>`, destinationId);
            dojo.place(`<div id="${tempOriginId}" style="width: ${dieDiv.clientWidth}px; height: ${dieDiv.clientHeight}px; display: inline-block; margin: -3px 6px 3px -3px;"></div>`, dieDivId, 'after');
            const destination = document.getElementById(destinationId);
            const tempDestination = document.getElementById(tempDestinationId);
            const tempOrigin = document.getElementById(tempOriginId);
            tempOrigin.appendChild(dieDiv);
            dojo.animateProperty({
                node: tempDestinationId,
                properties: {
                    width: dieDiv.clientHeight,
                }
            }).play();
            dojo.animateProperty({
                node: tempOriginId,
                properties: {
                    width: 0,
                }
            }).play();
            dojo.animateProperty({
                node: dieDivId,
                properties: {
                    marginLeft: -13
                }
            }).play();
            slideToObjectAndAttach(this.game, dieDiv, tempDestinationId).then(() => {
                dieDiv.style.marginLeft = '3px';
                if (tempDestination.parentElement) { // we only attach if temp div still exists (not deleted)
                    destination.append(tempDestination.childNodes[0]);
                }
                dojo.destroy(tempDestination);
                dojo.destroy(tempOrigin);
            });
        }
        this.activateRethrowButton();
        this.game.checkBuyEnergyDrinkState();
        this.game.checkUseSmokeCloudState();
    }
    lockAll() {
        var _a;
        (_a = this.dice) === null || _a === void 0 ? void 0 : _a.filter(die => !die.locked).forEach(die => this.toggleLockDice(die, null, true));
    }
    activateRethrowButton() {
        if (document.getElementById('rethrow_button')) {
            dojo.toggleClass('rethrow_button', 'disabled', !this.canRethrow());
        }
    }
    canRethrow() {
        return this.dice.some(die => !die.locked);
    }
    createAndPlaceDiceHtml(die, inTokyo, destinationId) {
        let html = `<div id="dice${die.id}" class="dice dice${die.value}" data-dice-id="${die.id}" data-dice-value="${die.value}">
        <ol class="die-list" data-roll="${die.value}">`;
        for (let dieFace = 1; dieFace <= 6; dieFace++) {
            html += `<li class="die-item ${die.extra ? 'green' : 'black'} side${dieFace}" data-side="${dieFace}"></li>`;
        }
        html += `</ol>`;
        if (die.value === 4 && inTokyo) {
            html += `<div class="icon forbidden"></div>`;
        }
        html += `</div>`;
        // security to destroy pre-existing die with same id
        const dieDiv = document.getElementById(`dice${die.id}`);
        dieDiv === null || dieDiv === void 0 ? void 0 : dieDiv.parentNode.removeChild(dieDiv);
        dojo.place(html, destinationId);
    }
    getDiceDiv(die) {
        return document.getElementById(`dice${die.id}`);
    }
    createDice(die, selectable, inTokyo) {
        this.createAndPlaceDiceHtml(die, inTokyo, die.locked ? `locked-dice${die.value}` : `dice-selector`);
        const div = this.getDiceDiv(die);
        div.addEventListener('animationend', (e) => {
            if (e.animationName == 'rolled-dice') {
                div.dataset.rolled = 'false';
            }
        });
        this.addDiceRollClass(die);
        if (selectable) {
            div.addEventListener('click', event => this.dieClick(die, event));
        }
    }
    dieClick(die, event) {
        if (this.action === 'move') {
            this.toggleLockDice(die, event);
        }
        else if (this.action === 'change') {
            this.toggleBubbleChangeDie(die);
        }
        else if (this.action === 'psychicProbeRoll') {
            this.game.psychicProbeRollDie(die.id);
        }
    }
    addRollToDiv(dieDiv, rollType, attempt = 0) {
        const dieList = dieDiv.getElementsByClassName('die-list')[0];
        if (dieList) {
            dieList.dataset.rollType = rollType;
        }
        else if (attempt < 5) {
            setTimeout(() => this.addRollToDiv(dieDiv, rollType, attempt + 1), 200);
        }
    }
    addDiceRollClass(die) {
        const dieDiv = this.getDiceDiv(die);
        dieDiv.dataset.rolled = die.rolled ? 'true' : 'false';
        if (die.rolled) {
            setTimeout(() => this.addRollToDiv(dieDiv, Math.random() < 0.5 ? 'odd' : 'even'), 200);
        }
        else {
            this.addRollToDiv(dieDiv, '-');
        }
    }
    removeDice(die, duration, delay) {
        if (duration) {
            this.game.fadeOutAndDestroy(`dice${die.id}`, duration, delay);
        }
        else {
            const dieDiv = document.getElementById(`dice${die.id}`);
            dieDiv === null || dieDiv === void 0 ? void 0 : dieDiv.parentNode.removeChild(dieDiv);
        }
        this.dice.splice(this.dice.indexOf(die), 1);
    }
    hideBubble(dieId) {
        const bubble = document.getElementById(`discussion_bubble_dice${dieId}`);
        if (bubble) {
            bubble.style.display = 'none';
            bubble.dataset.visible = 'false';
        }
    }
    removeAllBubbles() {
        this.dieFaceSelectors = [];
        Array.from(document.getElementsByClassName('change-die-discussion_bubble')).forEach(elem => elem.parentElement.removeChild(elem));
    }
    toggleBubbleChangeDie(die) {
        const divId = `dice${die.id}`;
        if (!document.getElementById(`discussion_bubble_${divId}`)) {
            dojo.place(`<div id="discussion_bubble_${divId}" class="discussion_bubble change-die-discussion_bubble"></div>`, divId);
        }
        const bubble = document.getElementById(`discussion_bubble_${divId}`);
        const visible = bubble.dataset.visible == 'true';
        if (visible) {
            this.hideBubble(die.id);
        }
        else {
            const bubbleActionButtonsId = `discussion_bubble_${divId}-action-buttons`;
            const bubbleDieFaceSelectorId = `discussion_bubble_${divId}-die-face-selector`;
            const creation = bubble.innerHTML == '';
            if (creation) {
                dojo.place(`
                <div id="${bubbleDieFaceSelectorId}" class="die-face-selector"></div>
                <div id="${bubbleActionButtonsId}" class="action-buttons"></div>
                `, bubble.id);
            }
            const herdCullerButtonId = `${bubbleActionButtonsId}-herdCuller`;
            const plotTwistButtonId = `${bubbleActionButtonsId}-plotTwist`;
            const stretchyButtonId = `${bubbleActionButtonsId}-stretchy`;
            const clownButtonId = `${bubbleActionButtonsId}-clown`;
            const args = this.changeDieArgs;
            if (!this.dieFaceSelectors[die.id]) {
                this.dieFaceSelectors[die.id] = new DieFaceSelector(bubbleDieFaceSelectorId, die.value, args.inTokyo);
            }
            const dieFaceSelector = this.dieFaceSelectors[die.id];
            if (creation) {
                const buttonText = _("Change die face with ${card_name}");
                if (args.hasClown) {
                    this.game.createButton(bubbleActionButtonsId, clownButtonId, dojo.string.substitute(buttonText, { 'card_name': `<strong>${this.game.cards.getCardName(212, 'text-only')}</strong>` }), () => {
                        this.game.changeDie(die.id, dieFaceSelector.getValue(), 212),
                            this.toggleBubbleChangeDie(die);
                    }, true);
                }
                else {
                    if (args.hasHerdCuller) {
                        this.game.createButton(bubbleActionButtonsId, herdCullerButtonId, dojo.string.substitute(buttonText, { 'card_name': `<strong>${this.game.cards.getCardName(22, 'text-only')}</strong>` }), () => {
                            this.game.changeDie(die.id, dieFaceSelector.getValue(), 22);
                            this.toggleBubbleChangeDie(die);
                        }, true);
                    }
                    if (args.hasPlotTwist) {
                        this.game.createButton(bubbleActionButtonsId, plotTwistButtonId, dojo.string.substitute(buttonText, { 'card_name': `<strong>${this.game.cards.getCardName(33, 'text-only')}</strong>` }), () => {
                            this.game.changeDie(die.id, dieFaceSelector.getValue(), 33),
                                this.toggleBubbleChangeDie(die);
                        }, true);
                    }
                    if (args.hasStretchy) {
                        this.game.createButton(bubbleActionButtonsId, stretchyButtonId, dojo.string.substitute(buttonText, { 'card_name': `<strong>${this.game.cards.getCardName(44, 'text-only')}</strong>` }) + formatTextIcons(' (2 [Energy])'), () => {
                            this.game.changeDie(die.id, dieFaceSelector.getValue(), 44),
                                this.toggleBubbleChangeDie(die);
                        }, true);
                    }
                }
                dieFaceSelector.onChange = value => {
                    if (args.hasClown) {
                        dojo.toggleClass(clownButtonId, 'disabled', value < 1);
                    }
                    else {
                        if (args.hasHerdCuller && die.value > 1) {
                            dojo.toggleClass(herdCullerButtonId, 'disabled', value != 1);
                        }
                        if (args.hasPlotTwist) {
                            dojo.toggleClass(plotTwistButtonId, 'disabled', value < 1);
                        }
                        if (args.hasStretchy) {
                            dojo.toggleClass(stretchyButtonId, 'disabled', value < 1);
                        }
                    }
                };
                bubble.addEventListener('click', event => event.stopImmediatePropagation());
            }
            if (die.value == dieFaceSelector.getValue()) {
                dieFaceSelector.reset(die.value);
                if (args.hasClown) {
                    dojo.addClass(stretchyButtonId, 'disabled');
                }
                else {
                    if (args.hasHerdCuller) {
                        dojo.addClass(herdCullerButtonId, 'disabled');
                    }
                    if (args.hasPlotTwist) {
                        dojo.addClass(plotTwistButtonId, 'disabled');
                    }
                    if (args.hasStretchy) {
                        dojo.addClass(stretchyButtonId, 'disabled');
                    }
                }
            }
            args.dice.filter(idie => idie.id != die.id).forEach(idie => this.hideBubble(idie.id));
            bubble.style.display = 'block';
            bubble.dataset.visible = 'true';
        }
    }
}
const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
const log = isDebug ? console.log.bind(window.console) : function () { };
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
], function (dojo) {
    window.bgagame = window.bgagame || {};
    window.bgagame.highrisk = class HighRisk extends ebg.core.gamegui {
        constructor() {
            super();
            this.format_string_recursive = (pLog, pArgs) => {
                const { log, args } = this.formatStringRecursive(pLog, pArgs);
                return super.format_string_recursive(log, args);
            };
        }
        /*
            setup:
    
            This method must set up the game user interface according to current game situation specified
            in parameters.
    
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
    
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        setup(gamedatas) {
            const players = Object.values(gamedatas.players);
            log("Starting game setup");
            this.gamedatas = gamedatas;
            log(gamedatas);
            /*this.createPlayerPanels(gamedatas);
            this.diceManager = new DiceManager(this, gamedatas.dice);
            this.createVisibleCards(gamedatas.visibleCards, gamedatas.topDeckCardBackType);
            this.createPlayerTables(gamedatas);
            this.tableManager = new TableManager(this, this.playerTables);
            // placement of monster must be after TableManager first paint
            setTimeout(() => this.playerTables.forEach(playerTable => playerTable.initPlacement()), 200);
            this.setMimicToken(gamedatas.mimickedCard);
    
            const playerId = this.getPlayerId();
            const currentPlayer = players.find(player => Number(player.id) === playerId);
    
            if (currentPlayer?.rapidHealing) {
                this.addRapidHealingButton(currentPlayer.energy, currentPlayer.health >= currentPlayer.maxHealth);
            }
            if (currentPlayer?.location > 0) {
                this.addAutoLeaveUnderButton();
            }*/
            //<!--   <script type="module" src="./die.mjs"></script>-->
            //<script>
            /*import { Die } from './die.mjs';
            
            const die = new Die({
                id: 'die'
            });
            
            die.roll();*/
            //let module = await import('./die.mjs');
            const die = {
                value: 4,
                rolled: true,
            };
            import(g_gamethemeurl + 'img/die.js').then(dieModule => {
                const colorDieElem = new dieModule.Die(Object.assign(Object.assign({}, die), { id: 1 }), {
                    backgroundImage: 'dice.png',
                    containerId: 'img-die',
                    img: g_gamethemeurl,
                });
                const dottedDieElem = new dieModule.Die(Object.assign(Object.assign({}, die), { id: 2 }), {
                    color: 'FF0000',
                    containerId: 'dotted-die',
                    img: g_gamethemeurl,
                });
                //setTimeout(() => colorDieElem.setRolled(true), 2000);
            });
            //</script>
            //console.log(this.base.bgagame.highrisk.prototype.addTooltipHtml);
            //setTimeout(() => this.base.bgagame.highrisk.prototype.addTooltipHtml('board', 'test'), 200);
            this.setupNotifications();
            log("Ending game setup");
        }
        ///////////////////////////////////////////////////
        //// Game & client states
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState(stateName, args) {
            log('Entering state: ' + stateName, args.args);
        }
        onLeavingState(stateName) {
            log('Leaving state: ' + stateName);
        }
        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //
        onUpdateActionButtons(stateName, args) {
            if (this.isCurrentPlayerActive()) {
                switch (stateName) {
                    case 'throwDice':
                        this.addActionButton(`rethrow-button`, _("Rethow [/] dice"), () => this.rethrow());
                        this.addActionButton(`placeEncampment-button`, _("Keep dice"), () => this.keepDice());
                        break;
                }
            }
        }
        ///////////////////////////////////////////////////
        //// Utility methods
        ///////////////////////////////////////////////////
        getPlayerId() {
            return Number(this.player_id);
        }
        rethrow() {
            if (!this.checkAction('rethrow')) {
                return;
            }
            this.takeAction('rethrow');
        }
        keepDice() {
            if (!this.checkAction('keepDice')) {
                return;
            }
            this.takeAction('keepDice');
        }
        takeAction(action, data) {
            data = data || {};
            data.lock = true;
            this.ajaxcall(`/highrisk/highrisk/${action}.html`, data, this, () => { });
        }
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications
        /*
            setupNotifications:
    
            In this method, you associate each of your game notifications with your local method to handle it.
    
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                    your pylos.game.php file.
    
        */
        setupNotifications() {
            //log( 'notifications subscriptions setup' );
            const notifs = [
                ['reroll', 500],
                /* ['setInitialCards', 500],
                 ['resolveNumberDice', ANIMATION_MS],
                 ['resolveHealthDice', ANIMATION_MS],
                 ['resolveHealingRay', ANIMATION_MS],
                 ['resolveHealthDiceInTokyo', ANIMATION_MS],
                 ['removeShrinkRayToken', ANIMATION_MS],
                 ['removePoisonToken', ANIMATION_MS],
                 ['resolveEnergyDice', ANIMATION_MS],
                 ['resolveSmashDice', ANIMATION_MS],
                 ['playerEliminated', ANIMATION_MS],
                 ['playerEntersTokyo', ANIMATION_MS],
                 ['renewCards', ANIMATION_MS],
                 ['buyCard', ANIMATION_MS],
                 ['leaveTokyo', ANIMATION_MS],
                 ['useCamouflage', ANIMATION_MS],
                 ['changeDie', ANIMATION_MS],
                 ['rethrow3changeDie', ANIMATION_MS],
                 ['resolvePlayerDice', 500],
                 ['points', 1],
                 ['health', 1],
                 ['energy', 1],
                 ['maxHealth', 1],
                 ['shrinkRayToken', 1],
                 ['poisonToken', 1],
                 ['setCardTokens', 1],
                 ['removeCards', 1],
                 ['setMimicToken', 1],
                 ['removeMimicToken', 1],
                 ['toggleRapidHealing', 1],
                 ['updateLeaveTokyoUnder', 1],
                 ['updateStayTokyoOver', 1],
                 ['kotPlayerEliminated', 1],*/
            ];
            notifs.forEach((notif) => {
                dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
                this.notifqueue.setSynchronous(notif[0], notif[1]);
            });
        }
        notif_reroll(notif) {
            console.log(notif.args);
        }
        /* This enable to inject translatable styled things to logs or action bar */
        /* @Override */
        formatStringRecursive(log, args) {
            var _a, _b;
            try {
                if (log && args && !args.processed) {
                    // Representation of the color of a card
                    if (args.card_name) {
                        let types = null;
                        if (typeof args.card_name == 'number') {
                            types = [args.card_name];
                        }
                        else if (typeof args.card_name == 'string' && args.card_name[0] >= '0' && args.card_name[0] <= '9') {
                            types = args.card_name.split(',').map((cardType) => Number(cardType));
                        }
                        if (types !== null) {
                            //const names: string[] = types.map((cardType: number) => this.cards.getCardName(cardType, 'text-only'));
                            //args.card_name = `<strong>${names.join(', ')}</strong>`;
                        }
                    }
                    for (const property in args) {
                        if (((_b = (_a = args[property]) === null || _a === void 0 ? void 0 : _a.indexOf) === null || _b === void 0 ? void 0 : _b.call(_a, ']')) > 0) {
                            //args[property] = formatTextIcons(_(args[property]));
                        }
                    }
                    //log = formatTextIcons(_(log));
                }
            }
            catch (e) {
                console.error(log, args, "Exception thrown", e.stack);
            }
            return { log, args };
        }
    };
});
