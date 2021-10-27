<?php

class Meeple {
    public $id;
    public $playerId;
    public $position;

    public function __construct($dbDice) {
        $this->id = intval($dbDice['id']);
        $this->playerId = intval($dbDice['player_id']);
        $this->position = intval($dbDice['position']);
    } 
}
?>