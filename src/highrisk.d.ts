/**
 * Your game interfaces
 */

interface Dice {
    id: number;
    value: number;
    rolled: boolean;
}


interface HighRiskPlayer extends Player {
    player_no: string;
    poisonTokens: number;
    shrinkRayTokens: number;
    rapidHealing: boolean;
    health: number;
    energy: number;
    monster: number;
    location: number;
    maxHealth: number;
    playerDead: number;
}

interface HighRiskGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: HighRiskPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    dice: Dice[];
}

interface HighRiskGame extends Game {
}