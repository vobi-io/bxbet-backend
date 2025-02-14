pragma solidity ^0.4.24;

import "./owned.sol";
import "./balance.sol";


contract Betting is Owned, Balance {
    mapping(uint => Game) games;
    enum GameStatus { FinishedDraw, FinishedOne, FinishedTwo, Open }
    enum OrderType { Buy, Sell }
    enum OrderStatus { Open, Matched, Win, Lose, Closed }
    enum OrderOutcome {Draw, One, Two }
    uint public totalGames;
    uint80 constant NONE = uint80(0);

    // We use the struct datatype to store the event information.
    struct Game {
        uint id;
        string homeTeam;
        string awayTeam;
        string category;
        uint startDate;
        uint endDate;
        GameStatus status;
        address owner;
        uint totalOrders;
        mapping (uint => Order) orders;
    }

    struct OrderMatched {
        uint matchedOrderId;
        uint amount; // 100
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
        uint matchedAmount; // 100
        uint totalMatched;
        mapping(uint => OrderMatched) matchedOrders;
    }

     /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor (uint256 initialSupply, string tokenName, string tokenSymbol)
        Balance(initialSupply, tokenName, tokenSymbol) public {
            totalGames = 0;
        }

    /**
    * Add Game Event
    */
    event GameEvent(uint gameId, string homeTeam, string awayTeam, string category, uint startDate,
        uint endDate, uint status, address owner, uint totalOrders);

    /**
    * Place order event
    */
    event OrderEvent(uint orderId, address player, uint gameId, OrderType orderType,
        uint amount, uint odd, uint outcome, uint status, uint matchedAmount, uint totalMatched);

    /**
    * Add Game
    */
    function addGame(string _homeTeam, string _awayTeam, string _category,
        uint _startDate, uint _endDate, uint status, address owner) public returns (uint) {
        // require (now > _startDate);
        require(_startDate < _endDate);
        totalGames += 1;
        uint gameIndex = totalGames - 1;
        Game memory game = Game(gameIndex, _homeTeam, _awayTeam, _category,
            _startDate, _endDate, GameStatus(status), owner, 0);
        games[gameIndex] = game;

        emitGameEvent(game);

        return gameIndex;
    }

    /**
    * Finish game by gameId and result
    */
    function finishGame(uint _gameId, uint outcome) public {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Open);
        for (uint i = 0; i < game.totalOrders; i++) {
            Order storage order = game.orders[i];
            if (order.status != OrderStatus.Closed) {
                if (order.status == OrderStatus.Matched) {
                    unblockTokensByOrder(order);
                    // unblockTokensByOrder(game.orders[order.matchedOrderId]);
                    if (order.orderType == OrderType.Buy){ //if is Buy order
                        if (order.outcome == OrderOutcome(outcome)) {
                           //if game's outcome equals order outcome
                            order.status = OrderStatus.Win;
                            // game.orders[order.matchedOrderId].status = OrderStatus.Lose;
                        }else{
                           //if game's outcome does not equals order outcome
                            order.status = OrderStatus.Lose;
                            // game.orders[order.matchedOrderId].status = OrderStatus.Win;
                        }
                    } else { // if is Sell order
                       if (order.outcome == OrderOutcome(outcome)) {
                            //if game's outcome equals order outcome
                            order.status = OrderStatus.Lose;
                            // game.orders[order.matchedOrderId].status = OrderStatus.Win;
                       }else{
                           //if game's outcome does not equals order outcome
                            order.status = OrderStatus.Win;
                            // game.orders[order.matchedOrderId].status = OrderStatus.Lose;
                       }
                    }

                    if (order.orderType == OrderType.Buy){
                      for (uint j = 0; j <  order.totalMatched; j++) {
                         uint matchedAmount = order.matchedOrders[j].amount;
                         uint matchedOrderId = order.matchedOrders[j].matchedOrderId;
                         Order memory matchedOrder = game.orders[matchedOrderId];
                         transferTokensByOrder(order, matchedOrder, matchedAmount, outcome);
                      }
                    }
                    //send order events for update
                    emitOrderEvent(order);
                    // emitOrderEvent(game.orders[order.matchedOrderId]);
                }

                if(order.status == OrderStatus.Open) {
                    //unblock tokens
                    unblockTokensByOrder(order);
                    //update order status which is not matched as closed
                    order.status = OrderStatus.Closed;
                    //send event on this order for update
                    emitOrderEvent(order);
                }
            }
        }
        game.status = GameStatus(outcome);
        emitGameEvent(game);
    }

    /**
    * Get Game by id
    */
    function getGame(uint _gameId) public view
        returns (uint, string, string, string, uint, uint, GameStatus, address, uint) {
            Game memory game = games[_gameId];
            return (game.id, game.homeTeam, game.awayTeam, game.category, game.startDate,
                game.endDate, game.status, game.owner, game.totalOrders);
        }
    /**
    * Get order by game id and order id
    */
    function getOrderById(uint _gameId, uint _orderId) public view
        returns (uint, address, uint, OrderType, uint, uint, OrderOutcome, OrderStatus, uint) {
            Order memory order = games[_gameId].orders[_orderId];
            return (order.id, order.player, order.gameId, order.orderType, order.amount,
                order.odd, order.outcome,
                order.status, order.matchedAmount);
        }

    /**
    * Place order on the game
    */
    function placeOrder(uint _gameId, uint _orderType, uint _amount, uint _odd, uint _outcome, address _player)
        public payable returns (uint) {
            require (_amount > 0);
            require (_odd > 0);
            Game storage game = games[_gameId];
            require (game.status == GameStatus.Open);
            // require (now < game.startDate);

            uint newId = game.totalOrders;
            Order memory newOrder = Order(newId, _player, _gameId, OrderType(_orderType), _amount, _odd,
                OrderOutcome(_outcome), OrderStatus.Open, 0, 0);

            blockTokensByOrderType(newOrder);

            //save order
            game.orders[newId] = newOrder;

            //increase orders number
            game.totalOrders += 1;

            //check matched
            checkMatched(_gameId, newId);

            return newOrder.id;
        }

    /**
    * Give free tokens to signed users
    */
    function giveFreeTokens(uint _amount, address _toUser) public returns (bool) {
        if(balanceOf[_toUser].owner != _toUser){
          Wallet memory wallet = Wallet(0, 0, _toUser);
          balanceOf[_toUser] = wallet;
        }
        transferTokens(msg.sender, _toUser, _amount);
        return true;
    }

    /**
    * Get balance
    */
    function getBalance() public view returns (uint, uint, address) {
        Wallet memory wallet = balanceOf[msg.sender];
        return (wallet.amount, wallet.blockAmount, wallet.owner);
    }

    /**
    * Block tokens by order type
    */
    function blockTokensByOrderType(Order order) private {
        if(order.orderType == OrderType.Buy){
          //Block tokens for this orders when is Buy order
          blockTokens(order.player, order.amount);
        }else{
          //Block tokens for this orders when is Sell order
          uint amount = order.amount * order.odd / 100;
          blockTokens(order.player, amount);
        }
    }

    /**
    * Unblock tokens by order type
    *
    * amount = 300
    * odd = 140
    * 300 00 140
    * 4200000
    */
    function unblockTokensByOrder(Order order) private {
        if(order.orderType == OrderType.Buy){
          //Block tokens for this orders
          unblockTokens(order.player, order.amount);
        }else{
          //Block tokens for this orders
           uint amount = order.amount * order.odd / 100;
          unblockTokens(order.player, amount);
        }
    }

    event LogUint(string label, uint value);
    function log(string label, uint value) private {
        emit LogUint(label, value);
    }

    /**
    * Transfer tokens by order type
    */
    function transferTokensByOrder(Order order, Order matchedOrder, uint matchedAmount, uint outcome) private {
        uint transferAmount;
        address from;
        address to;
        // log('test-gigaaaa', matchedAmount);
        // log('order.amount', order.amount);
        if(order.orderType == OrderType.Buy){ // if is buy order
            transferAmount = matchedAmount * order.odd / 100 - matchedAmount;
            if (order.outcome == OrderOutcome(outcome)) {
                //if game's outcome equals order outcome
                from = matchedOrder.player;
                to = order.player;
            }else{
                //if game's outcome does not equals order outcome
                from = order.player;
                to = matchedOrder.player;
            }
        }else{ // if is Sell order
            transferAmount = matchedAmount;
            if (order.outcome == OrderOutcome(outcome)) {
                //if game's outcome equals order outcome
                from = order.player;
                to = matchedOrder.player;
            }else{
                //if game's outcome does not equals order outcome
                from = matchedOrder.player;
                to = order.player;
            }
        }
        // log('matchedAmount', matchedAmount);
        // log('transferAmount', transferAmount);
      //transfer money
      transferTokens(from, to, transferAmount);
    }

    /**
    * Check orders if matched change status as matched and block tokens
    */
    function checkMatched(uint _gameId, uint _newOrderId) private returns(Order){
        Game storage game = games[_gameId];
        Order storage newOrder = game.orders[_newOrderId];
        for (uint i = 0; i < game.totalOrders; i++) {
            Order storage order = game.orders[i];
            uint avalaibleAmount = order.amount - order.matchedAmount;
            uint requestAmount = newOrder.amount - newOrder.matchedAmount;

            if(requestAmount <=0){
              break;
            }

            if (
                order.orderType != newOrder.orderType &&
                order.odd == newOrder.odd &&
                order.outcome == newOrder.outcome &&
                order.player != newOrder.player &&
                avalaibleAmount > 0 &&
                requestAmount > 0
                ) {
                uint matchedAmount = avalaibleAmount;
                if(avalaibleAmount > requestAmount){
                  matchedAmount = requestAmount;
                }

                order.status = OrderStatus.Matched;
                order.matchedAmount = order.matchedAmount + matchedAmount;
                order.matchedOrders[order.totalMatched] = OrderMatched(newOrder.id, matchedAmount);
                order.totalMatched = order.totalMatched + 1;

                newOrder.status = OrderStatus.Matched;
                newOrder.matchedOrders[newOrder.totalMatched] = OrderMatched(order.id, matchedAmount);
                newOrder.matchedAmount = newOrder.matchedAmount + matchedAmount;
                newOrder.totalMatched = newOrder.totalMatched + 1;

                emitOrderEvent(order);
            }
        }
        emitOrderEvent(newOrder);
        return newOrder;
    }

    function emitOrderEvent(Order order) private {
        emit OrderEvent (order.id, order.player, order.gameId,
                    order.orderType, order.amount, order.odd, uint(order.outcome),
                    uint(order.status), order.matchedAmount, order.totalMatched);
    }

    function emitGameEvent(Game game) private {
        emit GameEvent(game.id, game.homeTeam, game.awayTeam,
            game.category, game.startDate, game.endDate, uint(game.status),
            game.owner, game.totalOrders);
    }
}
