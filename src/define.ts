define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
],
function (dojo, declare) {
    return declare("bgagame.highrisk", ebg.core.gamegui, {
        game: new HighRisk(this),
        constructor: function() { /*this.game.constructor();*/ },        
        setup: function(gamedatas) { return this.game.setup(gamedatas); },
        onEnteringState: function(stateName, args) { return this.game.onEnteringState(stateName, args); },
        onLeavingState: function(stateName) { return this.game.onLeavingState(stateName); }, 
        onUpdateActionButtons: function(stateName, args) { return this.game.onUpdateActionButtons(stateName, args); },
        //format_string_recursive: function(log, args) { return this.game.format_string_recursive(this, log, args); }, 
   });             
});