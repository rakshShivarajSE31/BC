pragma solidity ^0.8.17;


import "./CharityToken.sol";

contract Charity is CharityToken{
    struct CharityInfo {
        uint id;
        string name;
        uint donatedAmount;
        address payable charityAddress;

    }
    mapping(uint => address[]) public CharityDonarMappings;
    address public contractOwner;
    uint public rewardValue;
    uint public incrementToken;
    mapping(address => bool) public users;
    mapping(uint => CharityInfo) public charities;
    uint public charityCount;
    event donatedEvent (
        uint indexed _charityId
    );
    constructor () {
        contractOwner = msg.sender;
        rewardValue = 1 * 10 ** decimals();
        incrementToken =  10000 * 10 ** decimals();
        addCharity("Campaign 1",payable(0x6283ccBd7D1c47477E284719B701c95227818F2A));
        addCharity("Campaign 2",payable(0x7e8B25926493d5010ddEe71b6d84364FE694C98A));
    }
    modifier validmoney(uint _getcharitymoney) {
        require(_getcharitymoney > 0, 'Invalid money. The amount must be greater than 0.');
        _;
    }
    modifier validID(uint _charityId) {
        require(_charityId > 0, 'Invalid charity id.');
        _;
    }
    modifier validUser(uint _charityId, address userAaddr) {
        require(charities[_charityId].charityAddress != userAaddr, 'Invalid user!! Donation Address and User Address are same .');
        _;
    }
    modifier onlyOwn {
    require(msg.sender == contractOwner,"Not An aowner ");
    _;
}
    function addCharity (string memory _name, address payable charityAddress) private {
        charityCount ++;
        charities[charityCount] = CharityInfo(charityCount, _name, 0, charityAddress);
    }
    function donate (uint _charityId, uint _getcharitymoney, address userAaddr ) public validmoney(_getcharitymoney) validID(_charityId) validUser(_charityId, userAaddr) {

        require(_charityId > 0 && _charityId <= charityCount && _getcharitymoney > 0);

        CharityDonarMappings[_charityId].push(msg.sender);

        users[msg.sender] = true;

        charities[_charityId].donatedAmount = charities[_charityId].donatedAmount + _getcharitymoney; 

        emit donatedEvent(_charityId);
    }
    function sayThanksToDonar(uint _charityId) onlyOwn public {
        uint balance = balanceOf(contractOwner);
        uint totalAmount = getTotalAmountNeeded(_charityId);
        if ( balance <= totalAmount) {
            mint(contractOwner,incrementToken+totalAmount);
        }
        for(uint i=0;i< CharityDonarMappings[_charityId].length;i++){
            transfer(CharityDonarMappings[_charityId][i],rewardValue);
        }
    }
    function getTotalAmountNeeded(uint _charityId) public view returns (uint) {
        return CharityDonarMappings[_charityId].length * rewardValue;
    }
     function getTokens() public view returns (uint) {
        return balanceOf(msg.sender);
    }
     function isOwnerContract() public view returns (bool) {
        if (msg.sender == contractOwner) {
            return true;
        }
        return false;
    }
     function getContractOwner() public view returns (address) {
        return contractOwner;
    }
}