import { supabase } from '../supabase/supabaseClient';

export interface AppConfig {
    jobCategories: string[];
    serviceCategories: string[];
    promoBanner: {
        title: string;
        subtitle: string;
        buttonText: string;
        visible: boolean;
    };
}

const DEFAULT_CONFIG: AppConfig = {
    jobCategories: ['Peon', 'Guard', 'Office Boy', 'Watchman', 'Helper', 'Security', 'Driver', 'Cook'],
    serviceCategories: ['Maid', 'Cook', 'Cleaner', 'Laundry', 'Driver'],
    promoBanner: {
        title: 'Going Professional?',
        subtitle: 'List yourself as a Worker to get noticed by local employers.',
        buttonText: 'Upgrade Profile',
        visible: true
    }
};

export const appConfigService = {
    async getConfig(): Promise<AppConfig> {
        try {
            const { data, error } = await supabase
                .from('app_config')
                .select('*')
                .single();
            
            if (error || !data) return DEFAULT_CONFIG;
            
            return {
                jobCategories: data.job_categories || DEFAULT_CONFIG.jobCategories,
                serviceCategories: data.service_categories || DEFAULT_CONFIG.serviceCategories,
                promoBanner: data.promo_banner || DEFAULT_CONFIG.promoBanner
            };
        } catch (error) {
            console.warn('Could not fetch remote app config, using fallback defaults', error);
            return DEFAULT_CONFIG;
        }
    }
};
