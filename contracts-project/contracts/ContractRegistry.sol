// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractRegistry is Ownable {
    mapping(string => address) private _registries;

    event RegistryUpdated(string indexed name, address indexed registryAddress);

    constructor() Ownable(msg.sender) {}

    function setRegistry(string calldata name, address registryAddress) external onlyOwner {
        _registries[name] = registryAddress;
        emit RegistryUpdated(name, registryAddress);
    }

    function getRegistry(string calldata name) external view returns (address) {
        return _registries[name];
    }
}
