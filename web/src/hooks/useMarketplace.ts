import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import CarbonMarketplaceArtifact from '../contracts/CarbonMarketplace.json';
import CarbonCreditArtifact from '../contracts/CarbonCredit.json';
import Addresses from '../contracts/addresses.json';
import { parseEther } from 'viem';

const SUPPORTED_CHAIN_ID = hardhat.id;

export function useMarketplace() {
    const { address, chain } = useAccount();
    const marketAddress = Addresses.CarbonMarketplace as `0x${string}`;
    const tokenAddress = Addresses.CarbonCredit as `0x${string}`;

    const { data: nextListingId } = useReadContract({
        address: marketAddress,
        abi: CarbonMarketplaceArtifact.abi,
        functionName: 'nextListingId',
    });

    // Helper: You'd typically need to read individual listings, but since we are stubbing out frontend marketplace loop, 
    // we'll just implement the write actions.

    const { writeContractAsync: approveCreditsAsync } = useWriteContract();
    const { writeContractAsync: listCreditsAsync, isPending: isListing } = useWriteContract();
    const { writeContractAsync: buyCreditsAsync, isPending: isBuying } = useWriteContract();

    const listCredits = async (amount: number, pricePerCreditEth: string) => {
        if (!address) throw new Error("Wallet not connected");
        if (chain?.id !== SUPPORTED_CHAIN_ID) {
            throw new Error(`Please switch to Hardhat local network. Contracts are not deployed on ${chain?.name || 'this network'}.`);
        }

        // 1. Approve Market to spend Credits
        await approveCreditsAsync({
            address: tokenAddress,
            abi: CarbonCreditArtifact.abi,
            functionName: 'approve',
            args: [marketAddress, BigInt(amount)]
        });

        // 2. List on Market
        const priceInWei = parseEther(pricePerCreditEth);
        const hash = await listCreditsAsync({
            address: marketAddress,
            abi: CarbonMarketplaceArtifact.abi,
            functionName: 'listCredits',
            args: [BigInt(amount), priceInWei]
        });

        return hash;
    };

    const buyCredits = async (listingId: number, amount: number, pricePerCreditEth: string) => {
        if (!address) throw new Error("Wallet not connected");
        if (chain?.id !== SUPPORTED_CHAIN_ID) {
            throw new Error(`Please switch to Hardhat local network. Contracts are not deployed on ${chain?.name || 'this network'}.`);
        }

        const totalCostInEth = (amount * parseFloat(pricePerCreditEth)).toString();
        const valueInWei = parseEther(totalCostInEth);

        const hash = await buyCreditsAsync({
            address: marketAddress,
            abi: CarbonMarketplaceArtifact.abi,
            functionName: 'buyCredits',
            args: [BigInt(listingId)],
            value: valueInWei
        });

        return hash;
    };

    return {
        nextListingId: nextListingId ? Number(nextListingId) : 0,
        listCredits,
        isListing,
        buyCredits,
        isBuying
    };
}
