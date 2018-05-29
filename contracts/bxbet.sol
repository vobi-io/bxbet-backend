pragma solidity ^0.4.24;

import "./owned.sol";
import "./balance.sol";

contract Bxbet is Owned, Balance {
    mapping(uint => Game) games;
    enum BetType { Buy, Sell }
    enum EventStatus { Open, Finished, InProgress }
    enum BetStatus { Open, Matched, Win, Lose, Closed }
    enum Outcome {Draw, One, Two }
    uint public gameIndex;

    // We use the struct datatype to store the event information.
    struct Game {
        uint id;
        string title;
        string team1;
        string team2;
        string category;
        uint startDate;
        uint endDate;
        EventStatus status;
        address owner;
        uint totalBuyBets;
        uint totalSellBets;
        mapping (uint => Bet) buyBets;
        mapping (uint => Bet) sellBets;
    }

    struct Bet {
        uint id;
        address player;
        uint gameId;
        BetType betType; // buy or sell
        uint amount; // 100
        uint odd; // 1.5
        Outcome outcome; // 1, x, 2
        BetStatus status;
        uint matchedBetId;
    }

    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor(
      uint256 initialSupply,
      string tokenName,
      string tokenSymbol ) Balance(initialSupply, tokenName, tokenSymbol) public {
        gameIndex = 0;
    }

    event AddGameEvent(uint _gameId, string _title, string _team1, string _team2, string _category);
    event finishGame(uint _gameId, string _title, string _team1, string _team2, string _category,
    uint _startDate, uint _endDate, uint _status, address owner);

    function addGame(
        string _title, string _team1, string _team2, string _category,
        uint _startDate, uint _endDate, uint _status) public {
        require (now > _startDate);
        require (_startDate < _endDate);
        Game memory game = Game(gameIndex, _title, _team1, _team2, _category,  _startDate, _endDate, EventStatus(_status), msg.sender, 0, 0);
        gameIndex += 1;
        games[gameIndex] = game;

        emit AddGameEvent(gameIndex, _title, _team1, _team2, _category, _startDate, _endDate, _status, msg.sender);
    }

    function getGame(uint _gameId) view public returns (uint, string, string, string, string, uint, uint, EventStatus, address, uint) {
        Game memory game = games[_gameId];
        return (game.id, game.title, game.team1, game.team2, game.category, game.startDate,
            game.endDate, game.status, game.owner, game.totalBets);
    }


    function finishBuyBets(uint outcome) private {
        for(uint i = 0; i < game.totalBuyBets; i++) {
            Bet memory bet = games.buyBets[i];
            if(bet.status != BetStatus.Closed) {
                if( bet.status == BetStatus.Matched){
                  if(bet.outcome == BetStatus(outcome)){
                    game.buyBets[i].status = BetStatus.Win;
                    game.sellBets[bet.matchedBetId].status = BetStatus.Lose;
                  }else{
                    game.buyBets[i].status = BetStatus.Lose;
                    game.sellBets[bet.matchedBetId].status = BetStatus.Win;
                  }
                }else{
                   game.buyBets[i].status = BetStatus.Closed;
                }
            }
        }
    }

    function finishGame(uint _gameId, outcome) public {
        Game storage game = games[_gameId];
        require (now > game.endDate);
        finishBuyBets(outcome);
        game.status = EventStatus.Finished;
    }

    function getBetById(uint _gameId, uint _betId) view public returns (address, uint, BetType, uint, uint, Outcome) {
        Bet memory bet = games[_gameId].bets[_betId];
        return (bet.player, bet.gameId, bet.betType, bet.amount, bet.odd, bet.outcome);
    }

    function checkSellMatched(Game game, Bet newBet) private {
        for(uint i = 0; i < game.totalBuyBets; i++) {
            Bet memory bet = games.buyBets[i];
            if(bet.amount == newBet.amount &&
              bet.odd == newBet.odd &&
              bet.outcome == newBet.outcome &&
              bet.status == BetStatus.Open) {
                game.buyBets[i].status = BetStatus.matched;
                game.buyBets[i].matchedBetId = BetStatus.matched;
                newBet.matchedBetId = bet.id;
              }
        }
    }

    function checkBuyMatched(Game game, Bet newBet) private {
        for(uint i = 0; i < game.totalSellBets; i++) {
            Bet memory bet = games.sellBets[i];
            if(bet.amount == newBet.amount &&
              bet.odd == newBet.odd &&
              bet.outcome == newBet.outcome &&
              bet.status == BetStatus.Open) {
                game.sellBets[i].status = BetStatus.matched;
                game.sellBets[i].matchedBetId = BetStatus.matched;
                newBet.matchedBetId = bet.id;
              }
        }
    }

    function placeOrder(uint _gameId,  uint _betType, uint _amount, uint _odd, uint _outcome) payable public returns (bool) {
        Game storage game = games[_gameId];
        require (now < game.startDate);
        uint newId = game.totalBuyBets + game.totalSellBets;
        Bet memory newBet = Bet(newId, msg.sender, _gameId, BetType(_betType), _amount, _odd, Outcome(_outcome), BetStatus.Open, -1);
        if (BetType(_betType) == BetType.Buy){
            game.totalBuyBets += 1;
            checkBuyMatched(game, newBet);
            game.buyBets[game.totalBuyBets - 1] = newBet;
        }else{
            game.totalSellBets += 1;
            checkSellMatched(game, newBet);
            game.sellBets[game.totalSellBets - 1] = newBet;
        }
        return true;
    }

    function signUp(uint _amount) public {
        Wallet memory wallet = Wallet(_amount, msg.sender, 0);
        balanceOf[msg.sender] = wallet;
    }
}
