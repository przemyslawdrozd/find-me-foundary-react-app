// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {FundMe} from "../../src/FundMe.sol";
import {DeployFundMe} from "../../script/DeployFundMe.s.sol";

// To run tests with logs
// forge test -vv

// -vvv shows stack trace

// forge test --match-test testPriceFeedVersionIsAccurate -vvv --fork-url $SEPOLIA_RPC_URL

contract FundMeTest is Test {
    FundMe fundMe;

    address USER = makeAddr("user");
    uint256 constant SEND_VALUE = 0.5 ether;
    uint256 constant STARTING_BALANCE = 10 ether;
    uint256 constant GAS_PRICE = 1;

    // This (FundMeTest) contract has created this FundMe contract
    // so the owner of it is FundMeTest
    function setUp() external {
        // fundMe = new FundMe(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        DeployFundMe deplyFundMe = new DeployFundMe();
        fundMe = deplyFundMe.run();
        vm.deal((USER), STARTING_BALANCE);
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

        // Otherwise msg.sender came from forge test as caller - now depricated
        // since deploy contract by script
        // assertEq(fundMe.i_owner(), msg.sender); !!

        assertEq(fundMe.i_owner(), sender);
    }

    function testPriceFeedVersionIsAccurate() public {
        uint256 version = fundMe.getVersion();
        assertEq(version, 4);
    }

    function testFundFailsWithoutEnoughFeeds() public {
        vm.expectRevert();
        fundMe.fund();
    }

    function testFundUpdatesFundedDataStructure() public {
        // Arrange
        vm.prank(USER); // The next TX will be sent by USER

        // Act
        fundMe.fund{value: SEND_VALUE}();

        // Assert
        uint256 amountFunded = fundMe.getAddressToAmountFunded(USER);
        assertEq(amountFunded, SEND_VALUE);
    }

    function testAddsFunderToArrayOfFunder() public {
        vm.prank(USER);

        fundMe.fund{value: SEND_VALUE}();

        address funder = fundMe.getFunder(0);

        assertEq(funder, USER);
    }

    modifier funded() {
        vm.prank(USER);
        fundMe.fund{value: SEND_VALUE}();
        _;
    }

    function testOnlyOwnerCanWithdraw() public funded {
        address owner = fundMe.getOwner();
        address thisAddress = address(this);

        console.log("owner", owner);
        console.log("sender", msg.sender);
        console.log("thisAddress", thisAddress);
        console.log("fund me address", address(fundMe));
        console.log("USER", USER);

        vm.prank(USER);
        vm.expectRevert();
        fundMe.withdraw();
    }

    function testWithdrawWithASingleFunder() public funded {
        // Arrange
        uint256 startingOwnerBalance = fundMe.getOwner().balance;
        uint256 stargingFundMeBalance = address(fundMe).balance;

        console.log("startingOwnerBalance", startingOwnerBalance);
        console.log("stargingFundMeBalance", stargingFundMeBalance);

        // Act
        uint256 gasStart = gasleft();
        vm.txGasPrice(GAS_PRICE);
        vm.prank(msg.sender); // c: 200
        fundMe.withdraw();

        uint256 gasEnd = gasleft(); // 800
        uint256 gasUsed = (gasStart - gasEnd) * tx.gasprice;

        // forge snapshot - to check spent gas
        console.log("gasUsed", gasUsed);

        // Assert
        uint256 endingOwnerBalance = fundMe.getOwner().balance;
        uint256 endingFundMeBalance = address(fundMe).balance;

        assertEq(endingFundMeBalance, 0);

        assertEq(
            endingOwnerBalance,
            startingOwnerBalance + stargingFundMeBalance
        );
    }

    function testWithdrawFromMultipleFunders() public funded {
        // Arrange
        uint160 numOfFunders = 10;
        uint160 startingFunderIndex = 1;

        for (uint160 i = startingFunderIndex; i < numOfFunders; i++) {
            console.log("address(i)", address(i));
            hoax(address(i), SEND_VALUE);
            fundMe.fund{value: SEND_VALUE}();
        }

        uint256 startingOwnerBalance = fundMe.getOwner().balance;
        uint256 stargingFundMeBalance = address(fundMe).balance;

        // Act
        vm.startPrank(fundMe.getOwner());
        fundMe.withdraw();
        vm.stopPrank();

        // Assert
        assertEq(address(fundMe).balance, 0);
        assertEq(
            fundMe.getOwner().balance,
            stargingFundMeBalance + startingOwnerBalance
        );
    }
}
