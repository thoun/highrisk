<?php

require_once(__DIR__.'/objects/dice.php');
require_once(__DIR__.'/objects/meeple.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function allMeeplesTop(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT count(*) FROM `meeple` WHERE `player_id` = $playerId and `position` = 10")) == $this->getMeepleNumber(count($this->getPlayersIds()));
    }

    function getMeepleNumber(int $playerCount) {
        return 6 - $playerCount;
    }

    function createMeeples(array $playersIds) {
        $meepleNumber = $this->getMeepleNumber(count($playersIds));

        $sql = "INSERT INTO meeple (`player_id`) VALUES ";
        $values = [];
        
        foreach($playersIds as $playerId) {
            for ($i=0; $i<$meepleNumber; $i++) {
                $values[] = "($playerId)";
            }
        }

        $sql .= implode($values, ',');
        self::DbQuery($sql);
    }  

    function getPlayerMeeples(int $playerId) {
        $sql = "SELECT * FROM meeple WHERE `player_id` = $playerId";
        $dbMeeples = self::getCollectionFromDB($sql);
        return array_map(function($dbMeeples) { return new Meeple($dbMeeples); }, array_values($dbMeeples));
    }
}
