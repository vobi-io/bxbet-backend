pragma solidity ^0.4.24;

contract Bxbet {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    // 18 decimals is the strongly suggested default, avoid changing it
    uint256 public totalSupply;

    mapping(uint => Game) games;
    mapping (address => Wallet) balanceOf;
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

    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor(uint256 initialSupply, string tokenName, string tokenSymbol, uint8 decimalUnits) public {
        gameIndex = 0;
        Wallet memory wallet = Wallet(initialSupply, msg.sender, 0); // Give the creator all initial tokens
        name = tokenName;                                   // Set the name for display purposes
        symbol = tokenSymbol;                               // Set the symbol for display purposes
    }

    event AddGameEvent(uint _gameId, string _title, string _team1, string _team2, string _category,
    uint _startDate, uint _endDate, uint _status, address owner);

    /* Notify anyone listening that this transfer took place */
    event Transfer(address indexed from, address indexed to, uint256 value);

    // This notifies clients about the amount burnt
    event Burn(address indexed from, uint256 value);

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

    function getBetById(uint _gameId, uint _betId) view public returns (address, uint, BetType, uint, uint, Outcome) {
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
        balanceOf[msg.sender] = wallet;
    }


    /**
     * Internal transfer, only can be called by this contract
     */
    function _transfer(address _from, address _to, uint _value) internal {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0);
        // Check if the sender has enough
        require(balanceOf[_from] >= _value);
        // Check for overflows
        require(balanceOf[_to] + _value > balanceOf[_to]);
        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        // Subtract from the sender
        balanceOf[_from] -= _value;
        // Add the same to the recipient
        balanceOf[_to] += _value;
        Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` in behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= allowance[_from][msg.sender]);     // Check allowance
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    /**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   // Check if the sender has enough
        balanceOf[msg.sender] -= _value;            // Subtract from the sender
        totalSupply -= _value;                      // Updates totalSupply
        Burn(msg.sender, _value);
        return true;
    }

    /**
     * Destroy tokens from other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom(address _from, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value);                // Check if the targeted balance is enough
        require(_value <= allowance[_from][msg.sender]);    // Check allowance
        balanceOf[_from] -= _value;                         // Subtract from the targeted balance
        allowance[_from][msg.sender] -= _value;             // Subtract from the sender's allowance
        totalSupply -= _value;                              // Update totalSupply
        Burn(_from, _value);
        return true;
    }

}
