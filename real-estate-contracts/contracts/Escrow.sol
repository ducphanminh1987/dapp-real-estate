//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    mapping(uint256 => bool) isListed;
    mapping(uint256 => uint256) public purchasedPrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;

    mapping(uint256 => bool) public inspectionPassed;

    mapping(uint256 => mapping(address => bool)) public approval;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer of this nft can invoke this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can invoke this method");
        _;
    }

    

    constructor(
        address _nftAddress,
        address payable  _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftID, 
        address _buyer, 
        uint256 _purchasedPrice, 
        uint256 _escrowAmount
    ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;

        purchasedPrice[_nftID] = _purchasedPrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    function approve(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    function depositeEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    receive() external payable {}

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

}