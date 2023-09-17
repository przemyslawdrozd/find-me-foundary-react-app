// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";

// To run tests with logs
// forge test -vv

contract FundMeTest is Test {
    uint256 nr = 1;

    function setUp() external {
        nr = 2;
    }

    function testDemo() public {
        console.log("nr", nr);
        assertEq(nr, 2);
    }
}
