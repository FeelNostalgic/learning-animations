-- 0002_universal_animations.sql
-- Evolution to Universal Educational Animations schema

-- 1. Add new columns to animations table
ALTER TABLE public.animations
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS discipline TEXT NOT NULL DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'beginner',
    ADD COLUMN IF NOT EXISTS connectors JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS forked_from UUID REFERENCES public.animations(id) ON DELETE SET NULL;

-- 2. Performance and Search Indexes
CREATE INDEX IF NOT EXISTS idx_animations_is_public ON public.animations(is_public);
CREATE INDEX IF NOT EXISTS idx_animations_discipline ON public.animations(discipline);
CREATE INDEX IF NOT EXISTS idx_animations_difficulty ON public.animations(difficulty);
CREATE INDEX IF NOT EXISTS idx_animations_tags ON public.animations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_animations_forked_from ON public.animations(forked_from);

-- 3. Update Row Level Security (RLS) for Privacy Control
DROP POLICY IF EXISTS "Allow public select on animations" ON public.animations;
DROP POLICY IF EXISTS "Allow public select on public animations or owner" ON public.animations;

CREATE POLICY "Allow public select on public animations or owner"
    ON public.animations FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);
