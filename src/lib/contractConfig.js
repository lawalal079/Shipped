// Fill this in once Shipped.sol is deployed to Monad testnet.
export const SHIPPED_CONTRACT_ADDRESS = import.meta.env.VITE_SHIPPED_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const SHIPPED_ABI = [
  {
    type: 'function',
    name: 'createActivity',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: 'activityId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'checkIn',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'activityId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'hasCheckedInToday',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'activityId', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getUserActivityIds',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getActivity',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'activityId', type: 'uint256' },
    ],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'lastCheckInDay', type: 'uint256' },
      { name: 'currentStreak', type: 'uint32' },
      { name: 'longestStreak', type: 'uint32' },
      { name: 'totalCheckIns', type: 'uint32' },
    ],
  },
  {
    type: 'event',
    name: 'ActivityCreated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'activityId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CheckedIn',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'activityId', type: 'uint256', indexed: true },
      { name: 'day', type: 'uint256', indexed: false },
      { name: 'currentStreak', type: 'uint32', indexed: false },
      { name: 'longestStreak', type: 'uint32', indexed: false },
      { name: 'totalCheckIns', type: 'uint32', indexed: false },
    ],
  },
];
