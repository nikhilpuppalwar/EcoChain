import { createWalletClient, http, custom, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Account #0 on Anvil
const tokenAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
const targetUser = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const account = privateKeyToAccount(privateKey);

const client = createWalletClient({
  account,
  chain: foundry,
  transport: http('http://127.0.0.1:8545')
}).extend(publicActions);

const CarbonCreditABI = [
  {
    type: 'function',
    name: 'issueCredits',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
];

async function main() {
  console.log(`Sending mint transaction...`);
  try {
    const hash = await client.writeContract({
      address: tokenAddress,
      abi: CarbonCreditABI,
      functionName: 'issueCredits',
      args: [targetUser, 10000n] // mint 10,000 CCR
    });
    console.log(`Transaction hash: ${hash}`);
    
    // Wait for the transaction to be mined
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log(`Transaction successfully mined! Status: ${receipt.status}`);
  } catch (error) {
    console.error(`Error minting credits:`, error);
  }
}

main();
