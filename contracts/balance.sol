pragma solidity ^0.4.24;

contract Balance {
    // Public variables of the token
    string public name;
    string public symbol;
    uint8 public decimals = 2;
    // 18 decimals is the strongly suggested default, avoid changing it
    uint256 public totalSupply;

    struct Wallet {
        uint256 amount;
        uint256 blockAmount;
        address owner;
    }

    // This creates an array with all balances
    mapping (address => Wallet) public balanceOf;

    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    event BlockTokens(uint256 amount, uint256 blockAmount, address owner);
    event UnblockTokens(uint256 amount, uint256 blockAmount, address owner);

    // This notifies clients about the amount burnt
    event Burn(address indexed from, uint256 value);

    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor(uint256 initialSupply, string tokenName, string tokenSymbol) public {
        totalSupply = initialSupply * 10 ** uint256(decimals);       // Update total supply with the decimal amount
        balanceOf[msg.sender] = Wallet(totalSupply, uint(0), msg.sender); // Give the creator all initial tokens
        name = tokenName;                                           // Set the name for display purposes
        symbol = tokenSymbol;                                       // Set the symbol for display purposes
    }

    /**
     * Internal transfer, only can be called by this contract
     */
    function _transferTokens(address _from, address _to, uint _value) internal {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0);
        // Check if the sender has enough
        Wallet storage walletFrom = balanceOf[_from];
        require(walletFrom.amount >= _value);
        // Check for overflows
        Wallet storage walletTo = balanceOf[_to];
        require(walletTo.amount + _value > walletTo.amount);
        // Save this for an assertion in the future
        uint previousBalances = walletFrom.amount + walletTo.amount;
        // Subtract from the sender
        walletFrom.amount -= _value;
        // Add the same to the recipient
        walletTo.amount += _value;
        emit Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(walletFrom.amount + walletTo.amount == previousBalances);
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferTokens(address _from, address _to, uint256 _value) public {
        _transferTokens(_from, _to, _value);
    }

    /**
     * Block tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _user The address of the recipient
     * @param _value the amount to block
     */
    function blockTokens(address _user, uint256 _value) public {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_user != 0x0);
        // Check if the sender has enough
        Wallet storage wallet = balanceOf[_user];
        require(wallet.amount >= _value);
        // Save this for an assertion in the future
        uint previousBalances = wallet.amount;
        // Subtract from the active balance
        wallet.amount -= _value;
        // Add block amount into the block balance
        wallet.blockAmount += _value;
        emit BlockTokens(wallet.amount, wallet.blockAmount, wallet.owner);
        assert(wallet.amount + _value == previousBalances);
    }

    /**
     * Unblock tokens
     *
     * Unblock `_value` tokens to `_user` from your account
     *
     * @param _user The address of the recipient
     * @param _value the amount to block
     */
    function unblockTokens(address _user, uint256 _value) public {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_user != 0x0);
        // Check if the sender has enough
        Wallet storage wallet = balanceOf[_user];
        require(wallet.amount >= _value);
        // Save this for an assertion in the future
        uint previousBalances = wallet.amount;
        // Subtract from the active balance
        wallet.blockAmount -= _value;
        // Add block amount into the block balance
        wallet.amount += _value;
        emit UnblockTokens(wallet.amount, wallet.blockAmount, wallet.owner);
        assert(wallet.amount - _value == previousBalances);
    }

    /**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) public returns (bool success) {
        Wallet storage wallet = balanceOf[msg.sender];
        require(wallet.amount >= _value);   // Check if the sender has enough
        wallet.amount -= _value;            // Subtract from the sender
        totalSupply -= _value;                      // Updates totalSupply
        emit Burn(msg.sender, _value);
        return true;
    }
}
