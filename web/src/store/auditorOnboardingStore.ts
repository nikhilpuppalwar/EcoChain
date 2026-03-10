import { create } from 'zustand';

export interface AuditorStep1Data {
    organization: string;
    designation: string;
    experience: string;
    specialization: string[];
}

export interface AuditorStep2Data {
    fullName: string;
    workEmail: string;
    password?: string;
    licenseNumber: string;
    licenseDocument?: File | null;
}

interface AuditorOnboardingState {
    role: 'auditor';
    step1: AuditorStep1Data | null;
    step2: AuditorStep2Data | null;
    setStep1: (data: AuditorStep1Data) => void;
    setStep2: (data: AuditorStep2Data) => void;
    reset: () => void;
}

export const useAuditorOnboardingStore = create<AuditorOnboardingState>((set) => ({
    role: 'auditor',
    step1: null,
    step2: null,
    setStep1: (data) => set({ step1: data }),
    setStep2: (data) => set({ step2: data }),
    reset: () => set({ step1: null, step2: null }),
}));
