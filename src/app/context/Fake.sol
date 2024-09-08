// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Fake {
    address public admin;

    enum UserRole {
        Manufacturer,
        Retailer
    }

    struct User {
        address userAddress;
        UserRole role;
    }

    struct Product {
        string prd_id;
        bool isSold;
        uint256 timeSlot;
    }

    string[] public productIds;
    mapping(address => User) public users;
    mapping(string => Product) public products;

    event UserAdded(address indexed userAddress, UserRole role);
    event ProductUploaded(string prd_id);
    event ProductMarkedAsSold(string prd_id, uint256 timeSlot);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyManufacturer() {
        require(
            users[msg.sender].role == UserRole.Manufacturer,
            "Only manufacturers can perform this action"
        );
        _;
    }

    modifier onlyRetailer() {
        require(
            users[msg.sender].role == UserRole.Retailer,
            "Only retailers can perform this action"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addUser(
        address userAddress,
        UserRole role
    ) external onlyAdmin {
        require(
            users[userAddress].role != UserRole.Manufacturer ||
            users[userAddress].role != UserRole.Retailer,
            "User already exists"
        );
        users[userAddress] = User(userAddress, role);
        emit UserAdded(userAddress, role);
    }

    function getUserRole(address userAddress) external view returns (UserRole) {
    return users[userAddress].role;
}

    function uploadProduct(string memory prd_id) external onlyManufacturer {
       require(keccak256(abi.encodePacked(products[prd_id].prd_id)) != keccak256(abi.encodePacked(prd_id)),
    "Product with this ID already exists");


        products[prd_id] = Product({
            prd_id: prd_id,
            isSold: false,
            timeSlot: 0
        });

        productIds.push(prd_id);
        emit ProductUploaded(prd_id);
    }

    function markAsSold(string memory prd_id) external onlyRetailer {
    require(
        keccak256(abi.encodePacked(products[prd_id].prd_id)) == keccak256(abi.encodePacked(prd_id)),
        "Product does not exist"
    );
    require(!products[prd_id].isSold, "Product already sold");

    products[prd_id].isSold = true;
    products[prd_id].timeSlot = block.timestamp;

    emit ProductMarkedAsSold(prd_id, block.timestamp);
    }


    function isReal(string memory prd_id) external view returns (bool, bool, uint256) {
        for (uint i = 0; i < productIds.length; i++) {
            if (keccak256(abi.encodePacked(productIds[i])) == keccak256(abi.encodePacked(prd_id))) {
                if (products[prd_id].isSold) {
                    return (false, true, products[prd_id].timeSlot);
                } else {
                    return (true, false, 0);
                }
            }
        }
        return (false, false, 0);
    }
}
