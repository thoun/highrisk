<?php

class Dice {
    public $id;
    public $face;
    public $rolled;

    public function __construct($dbDice) {
        $this->id = intval($dbDice['die_id']);
        $this->face = intval($dbDice['die_face']);
        $this->rolled = boolval($dbDice['rolled']);
    } 

    public function roll() {
        $this->face = bga_rand(1, 6);
    }
}
?>