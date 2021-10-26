const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;

class HighRisk implements HighRiskGame {
    private gamedatas: HighRiskGamedatas;
    private diceManager: DiceManager;

    constructor() {
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

    public setup(gamedatas: HighRiskGamedatas) {
        const players = Object.values(gamedatas.players);

        log( "Starting game setup" );
        
        /*this.gamedatas = gamedatas;
        this.createPlayerPanels(gamedatas); 
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
        import(g_gamethemeurl + 'img/die.js').then(module => {
            const die = new module.Die({
                id: 'die',
                img: g_gamethemeurl,
            });
        
            die.roll();
        });
        //</script>

        this.setupNotifications();

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public getPlayerId(): number {
        return Number((this as any).player_id);
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
            /*['pickMonster', 500],
            ['setInitialCards', 500],
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
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    /*notif_setInitialCards(notif: Notif<NotifSetInitialCardsArgs>) {
        this.cards.addCardsToStock(this.visibleCards, notif.args.cards, 'deck');
    }*/

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    /*public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (args.card_name) {
                    let types: number[] = null;
                    if (typeof args.card_name == 'number') {
                        types = [args.card_name];
                    } else if (typeof args.card_name == 'string' && args.card_name[0] >= '0' && args.card_name[0] <= '9') {
                        types = args.card_name.split(',').map((cardType: string) => Number(cardType));
                    }
                    if (types !== null) {
                        const names: string[] = types.map((cardType: number) => this.cards.getCardName(cardType, 'text-only'));
                        args.card_name = `<strong>${names.join(', ')}</strong>`;
                    }
                }

                for (const property in args) {
                    if (args[property]?.indexOf?.(']') > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }

                log = formatTextIcons(_(log));
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }*/
}