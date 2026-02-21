export const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];

export const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

export const getRoleLabel = (role: string | null) => {
    switch (role) {
        case 'tenant': return 'Looking for Room';
        case 'worker': return 'Looking for Work';
        case 'employer': return 'Hiring / Owner';
        default: return 'User';
    }
};

export const getPhaseColor = (phase: string) => {
    switch (phase) {
        case 'Phase 1': return '#3b82f6';
        case 'Phase 2': return '#8b5cf6';
        case 'Phase 3': return '#ec4899';
        default: return '#64748b';
    }
};
