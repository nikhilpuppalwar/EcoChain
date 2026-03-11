import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
const config = getDefaultConfig({
    appName: 'EcoChain',
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
    projectId: projectId || 'ecochain-demo', // Get a free ID at https://cloud.walletconnect.com to fix "undefined.localhost"
    chains: [hardhat, sepolia],
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider initialChain={hardhat}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
