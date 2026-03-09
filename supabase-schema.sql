-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT CHECK (role IN ('tenant', 'worker', 'employer')) DEFAULT 'tenant',
    listing_category TEXT CHECK (listing_category IN ('property', 'job', 'both')),
    area TEXT CHECK (area IN ('Phase 1', 'Phase 2', 'Phase 3')) DEFAULT 'Phase 1',
    photo_url TEXT,
    email TEXT,
    availability TEXT CHECK (availability IN ('Available', 'Busy')) DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view user profiles" ON public.users
    FOR SELECT USING (true);


-- 2. ROOMS TABLE (Room/PG/Flat listings)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    deposit NUMERIC NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('Phase 1', 'Phase 2', 'Phase 3')),
    type TEXT NOT NULL CHECK (type IN ('Room', 'PG', 'Flat')),
    furnishing TEXT CHECK (furnishing IN ('Unfurnished', 'Semi-furnished', 'Fully-furnished')),
    gender_preference TEXT CHECK (gender_preference IN ('Male', 'Female', 'Any')),
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('Available', 'Occupied')) DEFAULT 'Available',
    contact_phone TEXT NOT NULL,
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available rooms" ON public.rooms
    FOR SELECT USING (status = 'Available');

CREATE POLICY "Users can insert rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own rooms" ON public.rooms
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own rooms" ON public.rooms
    FOR DELETE USING (auth.uid() = owner_id);


-- 3. JOBS TABLE (Employer posts jobs)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    salary TEXT NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('Phase 1', 'Phase 2', 'Phase 3')),
    type TEXT CHECK (type IN ('Full Time', 'Part Time')) DEFAULT 'Full Time',
    experience TEXT,
    contact_phone TEXT NOT NULL,
    posted_ago TEXT DEFAULT 'Just now',
    urgent BOOLEAN DEFAULT false,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs" ON public.jobs
    FOR SELECT USING (true);

CREATE POLICY "Employers can insert jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own jobs" ON public.jobs
    FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs" ON public.jobs
    FOR DELETE USING (auth.uid() = employer_id);


-- 4. JOB_SEEKER_PROFILES TABLE (Workers seeking jobs)
CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    experience TEXT,
    expected_salary TEXT,
    area TEXT NOT NULL CHECK (area IN ('Phase 1', 'Phase 2', 'Phase 3')),
    availability TEXT CHECK (availability IN ('Immediately', 'Within 1 Week', 'Within 1 Month')) DEFAULT 'Immediately',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view job seeker profiles" ON public.job_seeker_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.job_seeker_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.job_seeker_profiles
    FOR UPDATE USING (auth.uid() = user_id);


-- 5. SERVICE_PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    category TEXT NOT NULL CHECK (category IN ('Maid', 'Cook', 'Cleaner', 'Laundry', 'Driver')),
    experience TEXT,
    rating NUMERIC DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    areas TEXT[] DEFAULT '{}',
    availability TEXT CHECK (availability IN ('Available', 'Busy', 'Paused')) DEFAULT 'Available',
    working_hours TEXT,
    description TEXT,
    skills TEXT[] DEFAULT '{}',
    price_range TEXT,
    avatar_color TEXT DEFAULT '#E8D5F5',
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service providers" ON public.service_providers
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert service providers" ON public.service_providers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update service providers" ON public.service_providers
    FOR UPDATE USING (true);


-- 6. SERVICE_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service reviews" ON public.service_reviews
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert service reviews" ON public.service_reviews
    FOR INSERT WITH CHECK (true);


-- 7. REPORTS TABLE (Trust & Safety)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('room', 'job', 'service', 'user')),
    reason TEXT NOT NULL CHECK (reason IN ('fake_listing', 'spam', 'harassment', 'inappropriate_content', 'scam_fraud', 'wrong_info', 'duplicate', 'other')),
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Anyone can view reports" ON public.reports
    FOR SELECT USING (true);


-- 8. BLOCKED_USERS TABLE
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_user_id TEXT NOT NULL,
    blocked_name TEXT NOT NULL,
    blocked_phone TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocked list" ON public.blocked_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert blocked users" ON public.blocked_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blocked users" ON public.blocked_users
    FOR DELETE USING (auth.uid() = user_id);


-- 9. TRUST_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.trust_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    verification_status TEXT CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
    verified_at TIMESTAMPTZ,
    trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
    total_reviews INTEGER DEFAULT 0,
    average_rating NUMERIC DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    reports_filed INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT false,
    spam_flags INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trust_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trust profiles" ON public.trust_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own trust profile" ON public.trust_profiles
    FOR UPDATE USING (auth.uid() = user_id);


-- AUTO-CREATE TRIGGER FOR TRUST PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.trust_profiles (user_id, joined_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STORAGE BUCKET FOR IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access for room images" ON storage.objects
    FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Anyone can upload room images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'room-images');

CREATE POLICY "Users can delete own room images" ON storage.objects
    FOR DELETE USING (bucket_id = 'room-images');
-- 10. LEADS TABLE (Tracks who contacted whom)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquirer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('room', 'job', 'service')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their leads" ON public.leads
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can record a lead" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Updated increment function to also record lead details
CREATE OR REPLACE FUNCTION public.record_lead(
    p_listing_id UUID, 
    p_listing_type TEXT, 
    p_owner_id UUID, 
    p_inquirer_id UUID
)
RETURNS void AS $$
BEGIN
    -- Increment count on the target table
    IF p_listing_type = 'room' THEN
        UPDATE public.rooms SET leads_count = leads_count + 1 WHERE id = p_listing_id;
    ELSIF p_listing_type = 'job' THEN
        UPDATE public.jobs SET leads_count = leads_count + 1 WHERE id = p_listing_id;
    ELSIF p_listing_type = 'service' THEN
        UPDATE public.service_providers SET leads_count = leads_count + 1 WHERE id = p_listing_id;
    END IF;

    -- Record the lead detail
    INSERT INTO public.leads (listing_id, listing_type, owner_id, inquirer_id)
    VALUES (p_listing_id, p_listing_type, p_owner_id, p_inquirer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
