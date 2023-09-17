// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {FundMe} from "../src/FundMe.sol";

// To run tests with logs
// forge test -vv

contract FundMeTest is Test {
    FundMe fundMe;

    function setUp() external {
        fundMe = new FundMe();
    }

    function testMinDollarIsFive() public {
        assertEq(fundMe.MIN_USD(), 5e18);
    }
}
