// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {FundMe} from "../src/FundMe.sol";

// To run tests with logs
// forge test -vv

contract FundMeTest is Test {
    FundMe fundMe;

    // This (FundMeTest) contract has created this FundMe contract
    // so the owner of it is FundMeTest
    function setUp() external {
        fundMe = new FundMe();
    }

    function testMinDollarIsFive() public {
        assertEq(fundMe.MIN_USD(), 5e18);
    }

    function testOwnerIsMsgSender() public {
        address owner = fundMe.i_owner();
        address sender = msg.sender;

        console.log("sender", sender);

        console.log("owner", owner);
        console.log("this", address(this));

        // Otherwise msg.sender came from forge test as caller
        // assertEq(fundMe.i_owner(), msg.sender); !!

        assertEq(fundMe.i_owner(), address(this));
    }
}
