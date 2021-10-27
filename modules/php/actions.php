<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */
  	
    public function rethrow() {
        self::checkAction('rethrow'); 
        
        $playerId = self::getActivePlayerId();

        self::notifyAllPlayers("reroll", "temp notif", []);
        // TODO

        $this->gamestate->nextState('rethrow');
    }
  	
    public function keepDice() {
        self::checkAction('keepDice'); 
        
        $playerId = self::getActivePlayerId();

        // TODO

        $this->gamestate->nextState('keepDice');
    }
}
