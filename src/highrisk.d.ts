/**
 * Your game interfaces
 */

interface Die {
    id: number;
    value: number;
    rolled: boolean;
}

interface Meeple {
    id: number;
    playerId: number;
    position: number;
}

interface HighRiskPlayer extends Player {
    meeples: Meeple[];
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
    dice: Die[];
}

interface HighRiskGame extends Game {
}