export const validation = {
    phone: (phone: string): { isValid: boolean; error?: string } => {
        const cleanPhone = phone.replace(/\s+/g, '');
        if (!cleanPhone) {
            return { isValid: false, error: 'Phone number is required' };
        }
        if (!/^\d{10}$/.test(cleanPhone)) {
            return { isValid: false, error: 'Phone number must be 10 digits' };
        }
        return { isValid: true };
    },

    email: (email: string): { isValid: boolean; error?: string } => {
        if (!email) {
            return { isValid: false, error: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, error: 'Please enter a valid email address' };
        }
        return { isValid: true };
    },

    name: (name: string): { isValid: boolean; error?: string } => {
        if (!name.trim()) {
            return { isValid: false, error: 'Name is required' };
        }
        if (name.trim().length < 2) {
            return { isValid: false, error: 'Name must be at least 2 characters' };
        }
        return { isValid: true };
    },

    price: (price: string | number): { isValid: boolean; error?: string } => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice) || numPrice <= 0) {
            return { isValid: false, error: 'Please enter a valid price greater than 0' };
        }
        return { isValid: true };
    },

    required: (value: string, fieldName: string): { isValid: boolean; error?: string } => {
        if (!value.trim()) {
            return { isValid: false, error: `${fieldName} is required` };
        }
        return { isValid: true };
    },

    otp: (otp: string): { isValid: boolean; error?: string } => {
        if (!otp) {
            return { isValid: false, error: 'OTP is required' };
        }
        if (!/^\d{6}$/.test(otp)) {
            return { isValid: false, error: 'OTP must be 6 digits' };
        }
        return { isValid: true };
    }
};