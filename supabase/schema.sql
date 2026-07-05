-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    role TEXT CHECK (role IN ('tenant', 'worker', 'employer')) DEFAULT 'tenant',
    listing_category TEXT CHECK (listing_category IN ('property', 'job', 'both')),
    area TEXT CHECK (area IN ('Phase 1', 'Phase 2', 'Phase 3')) DEFAULT 'Phase 1',
    photo_url TEXT,
    email TEXT,
    availability TEXT CHECK (availability IN ('Available', 'Busy')) DEFAULT 'Available',
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Users can insert own service profile" ON public.service_providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service profile" ON public.service_providers
    FOR UPDATE USING (auth.uid() = user_id);


-- 6. SERVICE_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service reviews" ON public.service_reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert service reviews" ON public.service_reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_area_status ON public.rooms(area, status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_area ON public.jobs(area);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON public.service_providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('room', 'job', 'service', 'user')),
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);


-- 8. BLOCKED_USERS TABLE
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

CREATE POLICY "Authenticated users can upload room images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own room images" ON storage.objects
    FOR DELETE USING (bucket_id = 'room-images' AND auth.uid() = owner);


CREATE POLICY "Public access for profiles" ON storage.objects
    FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can upload profiles" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own profiles" ON storage.objects
    FOR DELETE USING (bucket_id = 'profiles' AND auth.uid() = owner);
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


-- 11. CHAT TABLES
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    last_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);


CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their sessions" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions 
            WHERE id = chat_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their sessions" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.chat_sessions 
            WHERE id = chat_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_users ON public.chat_sessions(user1_id, user2_id);


-- ── MIGRATION: Make phone nullable ──
-- (Run this if users table already exists in production)
-- ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;


-- 12. MISSING RPC FUNCTIONS FOR VIEW/LEAD TRACKING

CREATE OR REPLACE FUNCTION public.increment_room_views(room_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.rooms SET views_count = views_count + 1 WHERE id = room_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_room_leads(room_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.rooms SET leads_count = leads_count + 1 WHERE id = room_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_job_views(job_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.jobs SET views_count = views_count + 1 WHERE id = job_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_job_leads(job_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.jobs SET leads_count = leads_count + 1 WHERE id = job_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_provider_views(provider_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.service_providers SET views_count = views_count + 1 WHERE id = provider_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_provider_leads(provider_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.service_providers SET leads_count = leads_count + 1 WHERE id = provider_id;
$$;


-- 13. APP_CONFIG TABLE (Remote maintenance mode, force-update, feature flags)
CREATE TABLE IF NOT EXISTS public.app_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton row
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT DEFAULT 'We are performing scheduled maintenance. Back soon!',
    min_app_version TEXT DEFAULT '1.0.0',
    latest_version TEXT DEFAULT '1.0.0',
    feature_flags JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app config" ON public.app_config
    FOR SELECT USING (true);

-- Seed default config row
INSERT INTO public.app_config (id, maintenance_mode, min_app_version)
VALUES (1, false, '1.0.0')
ON CONFLICT (id) DO NOTHING;


-- 14. SAVED_LISTINGS TABLE (Favorites feature)
CREATE TABLE IF NOT EXISTS public.saved_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('room', 'job', 'service')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id, listing_type)
);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved listings" ON public.saved_listings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings" ON public.saved_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings" ON public.saved_listings
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user ON public.saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_type ON public.saved_listings(listing_type);


-- 15. TRIGGER TO AUTOMATICALLY UPDATE SERVICE PROVIDER AND TRUST PROFILE STATS ON REVIEW CHANGE

CREATE OR REPLACE FUNCTION public.handle_service_review_change()
RETURNS TRIGGER AS $$
DECLARE
    v_provider_id UUID;
    v_user_id UUID;
    v_avg_rating NUMERIC;
    v_total_ratings INTEGER;
BEGIN
    -- Determine which provider was affected
    IF TG_OP = 'DELETE' THEN
        v_provider_id := OLD.service_provider_id;
    ELSE
        v_provider_id := NEW.service_provider_id;
    END IF;

    -- Calculate new average and total ratings for provider
    SELECT COALESCE(AVG(rating), 0), COUNT(id)
    INTO v_avg_rating, v_total_ratings
    FROM public.service_reviews
    WHERE service_provider_id = v_provider_id;

    -- Update service provider record
    UPDATE public.service_providers
    SET rating = v_avg_rating,
        total_ratings = v_total_ratings
    WHERE id = v_provider_id
    RETURNING user_id INTO v_user_id;

    -- If there's an associated user_id, update their trust profile stats
    IF v_user_id IS NOT NULL THEN
        UPDATE public.trust_profiles
        SET average_rating = v_avg_rating,
            total_reviews = v_total_ratings
        WHERE user_id = v_user_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_service_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.service_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_service_review_change();

CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    experience TEXT DEFAULT '',
    expected_salary TEXT,
    area TEXT NOT NULL,
    availability TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view job seeker profiles" ON public.job_seeker_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own job seeker profile" ON public.job_seeker_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job seeker profile" ON public.job_seeker_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job seeker profile" ON public.job_seeker_profiles
    FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_room_views(room_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.rooms SET views_count = COALESCE(views_count, 0) + 1 WHERE id = room_id;
$$;

CREATE OR REPLACE FUNCTION increment_room_leads(room_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.rooms SET leads_count = COALESCE(leads_count, 0) + 1 WHERE id = room_id;
$$;

CREATE OR REPLACE FUNCTION increment_job_views(job_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.jobs SET views_count = COALESCE(views_count, 0) + 1 WHERE id = job_id;
$$;

CREATE OR REPLACE FUNCTION increment_job_leads(job_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.jobs SET leads_count = COALESCE(leads_count, 0) + 1 WHERE id = job_id;
$$;

CREATE OR REPLACE FUNCTION increment_provider_views(provider_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.service_providers SET views_count = COALESCE(views_count, 0) + 1 WHERE id = provider_id;
$$;

CREATE OR REPLACE FUNCTION increment_provider_leads(provider_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.service_providers SET leads_count = COALESCE(leads_count, 0) + 1 WHERE id = provider_id;
$$;

CREATE TABLE IF NOT EXISTS public.app_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    job_categories TEXT[] DEFAULT '{"Peon", "Guard", "Office Boy", "Watchman", "Helper", "Security", "Driver", "Cook"}',
    service_categories TEXT[] DEFAULT '{"Maid", "Cook", "Cleaner", "Laundry", "Driver"}',
    promo_banner JSONB DEFAULT '{"title": "Going Professional?", "subtitle": "List yourself as a Worker to get noticed by local employers.", "buttonText": "Upgrade Profile", "visible": true}',
    maintenance_mode BOOLEAN DEFAULT false,
    min_app_version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app config" ON public.app_config
    FOR SELECT USING (true);

INSERT INTO public.app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

