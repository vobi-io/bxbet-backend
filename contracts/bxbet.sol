pragma solidity ^0.4.24; //We have to specify what version of the compiler this code will use

contract Bxbet {
    mapping(uint => Game) games;
    mapping (address => Wallet) balances;
    enum BetType { Buy, Sell }
    enum EventStatus { Active, Finished, InProgress }
    enum Outcome { One, Zero, Two }
    uint public gameIndex;
    uint public walletIndex;

    struct Wallet {
        uint amount;
        address owner;
        uint blockAmount;
    }

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
        uint totalBets;
        mapping (uint => Bet) bets;
    }

    struct Bet {
        address player;
        uint gameId;
        BetType betType; // buy or sell
        uint amount; // 100
        uint odd; // 1.5
        Outcome outcome; // 1, x, 2
    }

    constructor() public {
        gameIndex = 0;
    }

    event AddGameEvent(uint _gameId, string _title, string _team1, string _team2, string _category,
    uint _startDate, uint _endDate, uint _status, address owner);

    function addGame(
        string _title, string _team1, string _team2, string _category,
        uint _startDate, uint _endDate, uint _status) public {
        require (now > _startDate);
        require (_startDate < _endDate);
        gameIndex += 1;
        Game memory game = Game(gameIndex, _title, _team1, _team2, _category,  _startDate, _endDate, EventStatus(_status), msg.sender, 0);
        games[gameIndex] = game;

        emit AddGameEvent(gameIndex, _title, _team1, _team2, _category, _startDate, _endDate, _status, msg.sender);
    }

    function getGame(uint _gameId) view public returns (uint, string, string, string, string, uint, uint, EventStatus, address, uint) {
        Game memory game = games[_gameId];
        return (game.id, game.title, game.team1, game.team2, game.category, game.startDate,
            game.endDate, game.status, game.owner, game.totalBets);
    }

    function getBetByGameId(uint _gameId, uint _betId) view public returns (address, uint, BetType, uint, uint, Outcome) {
        Bet memory bet = games[_gameId].bets[_betId];
        return (bet.player, bet.gameId, bet.betType, bet.amount, bet.odd, bet.outcome);
    }

    function placeOrder(uint _gameId,  uint _betType, uint _amount, uint _odd, uint _outcome) payable public returns (bool) {
        Game storage game = games[_gameId];
        require (now < game.startDate);
        game.bets[game.totalBets] = Bet(msg.sender, _gameId, BetType(_betType), _amount, _odd, Outcome(_outcome));
        game.totalBets += 1;
        return true;
    }

    function addPlayer(uint _amount) public {
        Wallet memory wallet = Wallet(_amount, msg.sender, 0);
        balances[msg.sender] = wallet;
    }


}
