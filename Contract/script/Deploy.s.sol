// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Shipped} from "../src/Shipped.sol";

contract DeployShipped is Script {
    function run() external returns (Shipped) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        Shipped shipped = new Shipped();

        vm.stopBroadcast();

        console.log("Shipped deployed at:", address(shipped));

        return shipped;
    }
}
