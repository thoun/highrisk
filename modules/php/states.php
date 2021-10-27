<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stStartTurn() {
        $playerId = self::getActivePlayerId();

        // TODO first roll

        $this->gamestate->nextState('');
    }

    function stThrowDice() {
        // TODO
    }

    function stNextPlayer() {     
        $playerId = self::getActivePlayerId();

        //self::incStat(1, 'turnsNumber');
        //self::incStat(1, 'turnsNumber', $playerId);

        if ($this->allMeeplesTop($playerId)) {
            $this->gamestate->nextState('endGame');
        } else {
            $this->activeNextPlayer();
        
            $playerId = self::getActivePlayerId();
            self::giveExtraTime($playerId);

            $this->gamestate->nextState('nextPlayer');
        }
    }
}
