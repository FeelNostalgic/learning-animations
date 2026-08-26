-- 1. Create Profiles table (for unique usernames and linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow individual insert on profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update on profiles"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure function to look up email by username for dual login
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT email FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE LOWER(p.username) = LOWER(p_username)
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Create Animations table
CREATE TABLE IF NOT EXISTS public.animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT NOT NULL,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    links JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_animations_user_id ON public.animations(user_id);
CREATE INDEX IF NOT EXISTS idx_animations_topic ON public.animations(topic);

-- Trigger for auto updated_at
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_animations_modtime ON public.animations;
CREATE TRIGGER update_animations_modtime
    BEFORE UPDATE ON public.animations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Enable RLS for animations
ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on animations"
    ON public.animations FOR SELECT
    USING (true);

CREATE POLICY "Allow users to insert their own animations"
    ON public.animations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own animations"
    ON public.animations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own animations"
    ON public.animations FOR DELETE
    USING (auth.uid() = user_id);
