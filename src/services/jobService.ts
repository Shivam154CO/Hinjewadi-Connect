import { supabase } from '../supabase/supabaseClient';
import { Job, JobSeekerProfile } from '../types';

export const jobService = {
    async getJobs(): Promise<Job[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }

        return (data || []).map(this.mapJob);
    },

    async getJobById(id: string): Promise<Job | null> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching job by id:', error);
            return null;
        }

        return this.mapJob(data);
    },

    async createJob(job: Omit<Job, 'id' | 'postedAgo'>): Promise<Job> {
        const { data, error } = await supabase
            .from('jobs')
            .insert({
                employer_id: job.employerId,
                title: job.title,
                category: job.category,
                company: job.company,
                description: job.description,
                salary: job.salary,
                area: job.area,
                type: job.type,
                experience: job.experience,
                contact_phone: job.contactPhone,
                urgent: job.urgent,
                requirements: job.requirements,
                benefits: job.benefits,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating job:', error);
            throw error;
        }

        return this.mapJob(data);
    },

    async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
        const { data, error } = await supabase
            .from('jobs')
            .update({
                title: updates.title,
                category: updates.category,
                company: updates.company,
                description: updates.description,
                salary: updates.salary,
                area: updates.area,
                type: updates.type,
                experience: updates.experience,
                contact_phone: updates.contactPhone,
                urgent: updates.urgent,
                requirements: updates.requirements,
                benefits: updates.benefits,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating job:', error);
            throw error;
        }

        return this.mapJob(data);
    },

    async createJobSeekerProfile(profile: Omit<JobSeekerProfile, 'id' | 'createdAt'>): Promise<JobSeekerProfile> {
        const { data, error } = await supabase
            .from('job_seeker_profiles')
            .insert({
                name: profile.name,
                phone: profile.phone,
                category: profile.category,
                skills: profile.skills,
                experience: profile.experience,
                expected_salary: profile.expectedSalary,
                area: profile.area,
                availability: profile.availability,
                description: profile.description,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating job seeker profile:', error);
            throw error;
        }

        return this.mapJobSeekerProfile(data);
    },

    async getJobsByEmployer(employerId: string): Promise<Job[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('employer_id', employerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching employer jobs:', error);
            throw error;
        }

        return (data || []).map(this.mapJob);
    },

    async deleteJob(id: string): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    },

    async incrementViews(id: string): Promise<void> {
        await supabase.rpc('increment_job_views', { job_id: id });
    },

    async incrementLeads(id: string): Promise<void> {
        await supabase.rpc('increment_job_leads', { job_id: id });
    },

    async recordLead(listingId: string, ownerId: string, inquirerId: string): Promise<void> {
        await supabase.rpc('record_lead', {
            p_listing_id: listingId,
            p_listing_type: 'job',
            p_owner_id: ownerId,
            p_inquirer_id: inquirerId
        });
    },

    mapJob(row: any): Job {
        return {
            id: row.id,
            employerId: row.employer_id,
            title: row.title,
            category: row.category,
            company: row.company,
            description: row.description || '',
            salary: row.salary,
            area: row.area,
            type: row.type,
            experience: row.experience || '',
            contactPhone: row.contact_phone,
            postedAgo: row.posted_ago || 'Just now',
            urgent: row.urgent || false,
            requirements: row.requirements || [],
            benefits: row.benefits || [],
            viewsCount: row.views_count,
            leadsCount: row.leads_count,
        };
    },

    mapJobSeekerProfile(row: any): JobSeekerProfile {
        return {
            id: row.id,
            name: row.name,
            phone: row.phone,
            category: row.category,
            skills: row.skills || [],
            experience: row.experience || '',
            expectedSalary: row.expected_salary,
            area: row.area,
            availability: row.availability,
            description: row.description || '',
            createdAt: row.created_at,
        };
    }
};
