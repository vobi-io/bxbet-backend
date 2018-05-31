pragma solidity ^0.4.24;

import "./owned.sol";
import "./balance.sol";

contract Bxorder is Owned, Balance {
    mapping(uint => Game) games;
    enum GameStatus { Open, Finished, InProgress }
    enum OrderType { Buy, Sell }
    enum OrderStatus { Open, Matched, Win, Lose, Closed }
    enum OrderOutcome {Draw, One, Two }
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
        GameStatus status;
        address owner;
        uint totalBuyOrders;
        uint totalSellOrders;
        mapping (uint => Order) buyOrders;
        mapping (uint => Order) sellOrders;
    }

    struct Order {
        uint id;
        address player;
        uint gameId;
        OrderType orderType; // buy or sell
        uint amount; // 100
        uint odd; // 1.5
        OrderOutcome outcome; // 1, x, 2
        OrderStatus status;
        uint matchedOrderId;
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
    event FinishGameEvent(uint _gameId, string _title, string _team1, string _team2, string _category, uint _startDate, uint _endDate, uint _status, address owner);

    function addGame(
        string _title, string _team1, string _team2, string _category,
        uint _startDate, uint _endDate, uint _status) public {
        require (now > _startDate);
        require (_startDate < _endDate);
        Game memory game = Game(gameIndex, _title, _team1, _team2, _category,  _startDate, _endDate, GameStatus(_status), msg.sender, 0, 0);
        gameIndex += 1;
        games[gameIndex] = game;

        emit AddGameEvent(gameIndex, _title, _team1, _team2, _category, _startDate, _endDate, _status, msg.sender);
    }

    function getGame(uint _gameId) view public returns (uint, string, string, string, string, uint, uint, GameStatus, address, uint) {
        Game memory game = games[_gameId];
        return (game.id, game.title, game.team1, game.team2, game.category, game.startDate,
            game.endDate, game.status, game.owner, game.totalOrders);
    }


    function finishBuyOrders(Game game, uint outcome) private {
        for(uint i = 0; i < game.totalBuyOrders; i++) {
            Order memory order = games.buyOrders[i];
            if(order.status != OrderStatus.Closed) {
                if( order.status == OrderStatus.Matched){
                  if(order.outcome == OrderOutcome(outcome)){
                    game.buyOrders[i].status = OrderStatus.Win;
                    game.sellOrders[order.matchedOrderId].status = OrderStatus.Lose;
                  }else{
                    game.buyOrders[i].status = OrderStatus.Lose;
                    game.sellOrders[order.matchedOrderId].status = OrderStatus.Win;
                  }
                }else{
                   game.buyOrders[i].status = OrderStatus.Closed;
                }
            }
        }
    }

    function finishGame(uint _gameId, uint outcome) public {
        Game storage game = games[_gameId];
        require (now > game.endDate);
        finishBuyOrders(game, outcome);
        game.status = GameStatus.Finished;
    }

    function getOrderById(uint _gameId, uint _orderId) view public returns (address, uint, OrderType, uint, uint, OrderOutcome) {
        Order memory order = games[_gameId].orders[_orderId];
        return (order.player, order.gameId, order.orderType, order.amount, order.odd, order.outcome);
    }

    function checkSellMatched(Game game, Order newOrder) private {
        for(uint i = 0; i < game.totalBuyOrders; i++) {
            Order memory order = games.buyOrders[i];
            if(order.amount == newOrder.amount &&
              order.odd == newOrder.odd &&
              order.outcome == newOrder.outcome &&
              order.status == OrderStatus.Open) {
                game.buyOrders[i].status = OrderStatus.matched;
                game.buyOrders[i].matchedOrderId = OrderStatus.matched;
                newOrder.matchedOrderId = order.id;
              }
        }
    }

    function checkBuyMatched(Game game, Order newOrder) private {
        for(uint i = 0; i < game.totalSellOrders; i++) {
            Order memory order = games.sellOrders[i];
            if(order.amount == newOrder.amount &&
              order.odd == newOrder.odd &&
              order.outcome == newOrder.outcome &&
              order.status == OrderStatus.Open) {
                game.sellOrders[i].status = OrderStatus.matched;
                game.sellOrders[i].matchedOrderId = OrderStatus.matched;
                newOrder.matchedOrderId = order.id;
              }
        }
    }

    function placeOrder(uint _gameId,  uint _orderType, uint _amount, uint _odd, uint _outcome) payable public returns (bool) {
        Game storage game = games[_gameId];
        require (now < game.startDate);
        uint newId = game.totalBuyOrders + game.totalSellOrders;
        Order memory newOrder = Order(newId, msg.sender, _gameId, OrderType(_orderType), _amount, _odd, OrderOutcome(_outcome), OrderStatus.Open, -1);
        if (OrderType(_orderType) == OrderType.Buy){
            game.totalBuyOrders += 1;
            checkBuyMatched(game, newOrder);
            game.buyOrders[game.totalBuyOrders - 1] = newOrder;
        }else{
            game.totalSellOrders += 1;
            checkSellMatched(game, newOrder);
            game.sellOrders[game.totalSellOrders - 1] = newOrder;
        }
        return true;
    }

    function signUp(uint _amount) public {
        Wallet memory wallet = Wallet(_amount, msg.sender, 0);
        balanceOf[msg.sender] = wallet;
    }
}
