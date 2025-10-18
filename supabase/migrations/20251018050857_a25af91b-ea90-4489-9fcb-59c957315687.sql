-- Add audio features and engagement metrics to songs table
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS track_id TEXT,
ADD COLUMN IF NOT EXISTS danceability DECIMAL(3,2) CHECK (danceability BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS energy DECIMAL(3,2) CHECK (energy BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS valence DECIMAL(3,2) CHECK (valence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS tempo DECIMAL(6,2) CHECK (tempo > 0),
ADD COLUMN IF NOT EXISTS release_date DATE,
ADD COLUMN IF NOT EXISTS plays INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- Create index for track_id lookups
CREATE INDEX IF NOT EXISTS idx_songs_track_id ON public.songs(track_id);
CREATE INDEX IF NOT EXISTS idx_songs_release_date ON public.songs(release_date);
CREATE INDEX IF NOT EXISTS idx_songs_audio_features ON public.songs(danceability, energy, valence, tempo);

-- Create user listening history table
CREATE TABLE IF NOT EXISTS public.user_listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listening_history_user ON public.user_listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_song ON public.user_listening_history(song_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_played_at ON public.user_listening_history(played_at);

-- Enable RLS for listening history
ALTER TABLE public.user_listening_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listening history"
ON public.user_listening_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listening history"
ON public.user_listening_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create user favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_song ON public.user_favorites(song_id);

-- Enable RLS for favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
ON public.user_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
ON public.user_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON public.user_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create cluster assignments table
CREATE TABLE IF NOT EXISTS public.cluster_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('user', 'song')),
  cluster_id INTEGER NOT NULL,
  cluster_label TEXT,
  coordinates_2d JSONB,
  features_used JSONB,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cluster_item ON public.cluster_assignments(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_cluster_id ON public.cluster_assignments(cluster_id);

-- Enable RLS for cluster assignments (read-only for authenticated users)
ALTER TABLE public.cluster_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clusters"
ON public.cluster_assignments FOR SELECT
TO authenticated
USING (true);

-- Create ML models metadata table
CREATE TABLE IF NOT EXISTS public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  version TEXT NOT NULL,
  hyperparameters JSONB,
  training_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metrics JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'training')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_models_name_version ON public.ml_models(model_name, version);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON public.ml_models(status);

-- Enable RLS for ML models (read-only for authenticated users)
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ML models"
ON public.ml_models FOR SELECT
TO authenticated
USING (true);

-- Create user roles enum and table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- Enable RLS for user roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for ML models table
CREATE POLICY "Admins can insert ML models"
ON public.ml_models FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ML models"
ON public.ml_models FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for cluster assignments table
CREATE POLICY "Admins can insert clusters"
ON public.cluster_assignments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clusters"
ON public.cluster_assignments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to update engagement metrics when favorites are added/removed
CREATE OR REPLACE FUNCTION public.update_song_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.songs 
    SET likes = likes + 1 
    WHERE id = NEW.song_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.songs 
    SET likes = GREATEST(0, likes - 1) 
    WHERE id = OLD.song_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_song_likes_trigger
AFTER INSERT OR DELETE ON public.user_favorites
FOR EACH ROW EXECUTE FUNCTION public.update_song_likes();

-- Function to update plays count
CREATE OR REPLACE FUNCTION public.update_song_plays()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.songs 
  SET plays = plays + 1 
  WHERE id = NEW.song_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_song_plays_trigger
AFTER INSERT ON public.user_listening_history
FOR EACH ROW EXECUTE FUNCTION public.update_song_plays();