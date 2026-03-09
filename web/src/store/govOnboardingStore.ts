import { create } from 'zustand';

export interface GovStep1Data {
    ministry: string;
    department: string;
    jurisdiction: string;
    authorizationCode: string; // added
    officeAddress?: string;
    websiteUrl?: string;
}

export interface GovStep2Data {
    officerName: string;
    designation: string;
    email: string;
    serviceId: string; // added
    phone?: string;
    password?: string; // added
    idDocumentFile?: File | null;
}

interface GovOnboardingState {
    role: 'government';
    step1: GovStep1Data | null;
    step2: GovStep2Data | null;
    setStep1: (data: GovStep1Data) => void;
    setStep2: (data: GovStep2Data) => void;
    reset: () => void;
}

export const useGovOnboardingStore = create<GovOnboardingState>((set) => ({
    role: 'government',
    step1: null,
    step2: null,
    setStep1: (data) => set({ step1: data }),
    setStep2: (data) => set({ step2: data }),
    reset: () => set({ step1: null, step2: null }),
}));
