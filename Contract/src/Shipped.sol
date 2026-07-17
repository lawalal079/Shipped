// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Shipped — daily habit check-ins, each activity keeps its own streak
/// @notice Like Google Play Games achievements: one wallet, many activities, each with an independent streak.
contract Shipped {
    struct Activity {
        string name;             // e.g. "Read", "Practice guitar"
        uint256 lastCheckInDay;  // day number (timestamp / 1 days) of last check-in
        uint32 currentStreak;
        uint32 longestStreak;
        uint32 totalCheckIns;
        bool exists;
    }

    // user => activityId => Activity
    mapping(address => mapping(uint256 => Activity)) public activities;
    // user => list of activityIds they own (for easy frontend listing)
    mapping(address => uint256[]) private userActivityIds;
    // user => next activityId to assign
    mapping(address => uint256) private nextActivityId;

    event ActivityCreated(address indexed user, uint256 indexed activityId, string name);
    event CheckedIn(
        address indexed user,
        uint256 indexed activityId,
        uint256 day,
        uint32 currentStreak,
        uint32 longestStreak,
        uint32 totalCheckIns
    );

    error AlreadyCheckedInToday();
    error ActivityDoesNotExist();
    error EmptyName();

    /// @notice Register a new habit/activity. Returns its id.
    function createActivity(string calldata name) external returns (uint256 activityId) {
        if (bytes(name).length == 0) revert EmptyName();

        activityId = nextActivityId[msg.sender];
        nextActivityId[msg.sender] += 1;

        activities[msg.sender][activityId] = Activity({
            name: name,
            lastCheckInDay: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalCheckIns: 0,
            exists: true
        });

        userActivityIds[msg.sender].push(activityId);

        emit ActivityCreated(msg.sender, activityId, name);
    }

    /// @notice Check in for a specific activity today. Updates that activity's streak only.
    function checkIn(uint256 activityId) external {
        Activity storage a = activities[msg.sender][activityId];
        if (!a.exists) revert ActivityDoesNotExist();

        uint256 today = block.timestamp / 1 days;
        if (a.lastCheckInDay == today) revert AlreadyCheckedInToday();

        if (a.totalCheckIns > 0 && a.lastCheckInDay == today - 1) {
            a.currentStreak += 1;
        } else {
            a.currentStreak = 1;
        }

        if (a.currentStreak > a.longestStreak) {
            a.longestStreak = a.currentStreak;
        }

        a.lastCheckInDay = today;
        a.totalCheckIns += 1;

        emit CheckedIn(msg.sender, activityId, today, a.currentStreak, a.longestStreak, a.totalCheckIns);
    }

    /// @notice Has this activity already been checked in today?
    function hasCheckedInToday(address user, uint256 activityId) external view returns (bool) {
        return activities[user][activityId].lastCheckInDay == block.timestamp / 1 days;
    }

    /// @notice All activity ids belonging to a user (use with getActivity to build the dashboard).
    function getUserActivityIds(address user) external view returns (uint256[] memory) {
        return userActivityIds[user];
    }

    /// @notice Full details for one activity.
    function getActivity(address user, uint256 activityId)
        external
        view
        returns (
            string memory name,
            uint256 lastCheckInDay,
            uint32 currentStreak,
            uint32 longestStreak,
            uint32 totalCheckIns
        )
    {
        Activity memory a = activities[user][activityId];
        if (!a.exists) revert ActivityDoesNotExist();
        return (a.name, a.lastCheckInDay, a.currentStreak, a.longestStreak, a.totalCheckIns);
    }
}
