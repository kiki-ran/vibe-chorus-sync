-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  country TEXT,
  region TEXT,
  age_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  popularity INTEGER DEFAULT 0,
  social_ranking INTEGER DEFAULT 0,
  community_country TEXT,
  community_region TEXT,
  community_age_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Songs policies - anyone authenticated can view songs
CREATE POLICY "Authenticated users can view songs"
  ON public.songs FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample songs for demo purposes
INSERT INTO public.songs (title, artist, genre, popularity, social_ranking, community_country, community_region, community_age_group) VALUES
('Midnight Dreams', 'Luna Eclipse', 'Electronic', 95, 1, 'USA', 'West Coast', '18-25'),
('Rhythm of the Night', 'DJ Pulse', 'Dance', 88, 2, 'USA', 'West Coast', '18-25'),
('Urban Legends', 'City Beats', 'Hip Hop', 92, 3, 'USA', 'East Coast', '18-25'),
('Sunset Boulevard', 'The Wanderers', 'Indie', 78, 4, 'USA', 'West Coast', '26-35'),
('Electric Soul', 'Nova Sound', 'Electronic', 85, 5, 'UK', 'London', '18-25'),
('Retro Vibes', 'The Classics', 'Pop', 82, 6, 'USA', 'Midwest', '26-35'),
('Bass Drop', 'Frequency', 'Dubstep', 90, 7, 'Canada', 'Toronto', '18-25'),
('Acoustic Dreams', 'Sarah Mitchell', 'Folk', 76, 8, 'USA', 'South', '35-50'),
('Neon Lights', 'Cyber Wave', 'Synthwave', 87, 9, 'USA', 'West Coast', '26-35'),
('Heart & Soul', 'The Emotions', 'R&B', 84, 10, 'USA', 'East Coast', '26-35');