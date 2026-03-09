import { create } from 'zustand';

export interface Step1Data {
    companyName: string;
    sector: 'Energy' | 'Cement' | 'Steel' | 'Mining' | 'Transport' | 'Other' | '';
    state: string;
    registrationNo: string;
    panId: string;
    carbonBudget: number;
}

export interface Step2Data {
    fullName: string;
    designation: 'officer' | 'manager' | 'director' | '';
    email: string;
    password?: string;
    phone?: string;
    employeeId?: string;
}

interface OnboardingState {
    role: 'industry' | 'government';
    step1: Step1Data | null;
    step2: Step2Data | null;
    setRole: (role: 'industry' | 'government') => void;
    setStep1: (data: Step1Data) => void;
    setStep2: (data: Step2Data) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    role: 'industry',
    step1: null,
    step2: null,
    setRole: (role) => set({ role }),
    setStep1: (data) => set({ step1: data }),
    setStep2: (data) => set({ step2: data }),
    reset: () => set({ role: 'industry', step1: null, step2: null }),
}));
