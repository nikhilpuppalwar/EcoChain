import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

const rawProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
const isHex32 = /^[0-9a-fA-F]{32}$/.test(rawProjectId);
const projectId = isHex32 ? rawProjectId : '989cf8fa281b95f1c990264103193e96';

const config = getDefaultConfig({
    appName: 'EcoChain',
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
    projectId: projectId,
    chains: [sepolia, hardhat],
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider initialChain={sepolia}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
