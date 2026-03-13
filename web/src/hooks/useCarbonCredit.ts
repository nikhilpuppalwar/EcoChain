import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import CarbonCreditArtifact from '../contracts/CarbonCredit.json';
import Addresses from '../contracts/addresses.json';
import { parseEther } from 'viem';

export const SUPPORTED_CHAIN_ID = hardhat.id; // Contracts are deployed on Hardhat local

export function useCarbonCredit() {
    const { address, chain } = useAccount();
    const tokenAddress = Addresses.CarbonCredit as `0x${string}`;

    // Read Balance
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: tokenAddress,
        abi: CarbonCreditArtifact.abi,
        functionName: 'balanceOf',
        args: [address],
        query: {
            enabled: !!address,
        }
    });

    const {
        writeContractAsync: issueCreditsAsync,
        isPending: isIssuing
    } = useWriteContract();

    const {
        writeContractAsync: retireCreditsAsync,
        isPending: isRetiring
    } = useWriteContract();

    const {
        writeContractAsync: transferTokensAsync,
        isPending: isTransferring
    } = useWriteContract();

    const issueCredits = async (to: string, amount: number) => {
        if (chain?.id !== SUPPORTED_CHAIN_ID) {
            throw new Error(`Please switch to Hardhat local network. Contracts are not deployed on ${chain?.name || 'this network'}.`);
        }
        const hash = await issueCreditsAsync({
            address: tokenAddress,
            abi: CarbonCreditArtifact.abi,
            functionName: 'issueCredits',
            args: [to as `0x${string}`, BigInt(amount)],
        });
        return hash;
    };

    const retireCredits = async (amount: number) => {
        if (!address) throw new Error("Wallet not connected");
        if (chain?.id !== SUPPORTED_CHAIN_ID) {
            throw new Error(`Please switch to Hardhat local network. Contracts are not deployed on ${chain?.name || 'this network'}.`);
        }
        const hash = await retireCreditsAsync({
            address: tokenAddress,
            abi: CarbonCreditArtifact.abi,
            functionName: 'retireCredits',
            args: [address, BigInt(amount)],
        });
        return hash;
    };

    const transferTokens = async (to: string, amount: number) => {
        if (!address) throw new Error("Wallet not connected");
        if (chain?.id !== SUPPORTED_CHAIN_ID) {
            throw new Error(`Please switch to Hardhat local network.`);
        }
        const hash = await transferTokensAsync({
            address: tokenAddress,
            abi: CarbonCreditArtifact.abi,
            functionName: 'transfer',
            args: [to as `0x${string}`, BigInt(amount)],
        });
        return hash;
    };

    return {
        balance: balance ? Number(balance) : 0,
        refetchBalance,
        issueCredits,
        isIssuing,
        retireCredits,
        isRetiring,
        transferTokens,
        isTransferring,
        isWrongChain: !!chain && chain.id !== SUPPORTED_CHAIN_ID,
        supportedChainId: SUPPORTED_CHAIN_ID,
    };
}
