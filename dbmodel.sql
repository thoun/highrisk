
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- High Risk implementation : © <Your name here> <Your email address here>
--
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- dice_value : 1, 2, 3, 4 : health, 5: energy, 6: smash
CREATE TABLE IF NOT EXISTS `dice` (
  `dice_id` TINYINT unsigned NOT NULL AUTO_INCREMENT,
  `dice_value` TINYINT unsigned NOT NULL DEFAULT 0,
  `rolled` TINYINT unsigned NOT NULL DEFAULT true,
  PRIMARY KEY (`dice_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `meeple` (
  `id` TINYINT unsigned NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `position` TINYINT unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;