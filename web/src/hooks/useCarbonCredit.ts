import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import CarbonCreditArtifact from '../contracts/CarbonCredit.json';
import Addresses from '../contracts/addresses.json';
import { parseEther } from 'viem';

export function useCarbonCredit() {
    const { address } = useAccount();
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

    const issueCredits = async (to: string, amount: number) => {
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
        const hash = await retireCreditsAsync({
            address: tokenAddress,
            abi: CarbonCreditArtifact.abi,
            functionName: 'retireCredits',
            args: [address, BigInt(amount)],
        });
        return hash;
    };

    return {
        balance: balance ? Number(balance) : 0,
        refetchBalance,
        issueCredits,
        isIssuing,
        retireCredits,
        isRetiring
    };
}
