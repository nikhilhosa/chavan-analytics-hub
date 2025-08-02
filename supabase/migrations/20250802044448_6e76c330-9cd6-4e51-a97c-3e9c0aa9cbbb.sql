-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'analyst', 'user')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboards table
CREATE TABLE public.dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sales', 'service', 'admin', 'custom')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_pages table
CREATE TABLE public.dashboard_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  layout JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dashboard_id, slug)
);

-- Create visualizations table
CREATE TABLE public.visualizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_page_id UUID NOT NULL REFERENCES public.dashboard_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chart', 'table', 'metric', 'map', 'text')),
  chart_type TEXT CHECK (chart_type IN ('line', 'bar', 'pie', 'area', 'scatter')),
  data_source_id UUID,
  config JSONB DEFAULT '{}',
  position JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_sources table
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('csv', 'json', 'api', 'database')),
  connection_config JSONB DEFAULT '{}',
  schema_info JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_permissions table
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('dashboard', 'data_source')),
  resource_id UUID NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_type, resource_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for dashboards
CREATE POLICY "Users can view public dashboards" ON public.dashboards
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own dashboards" ON public.dashboards
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own dashboards" ON public.dashboards
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own dashboards" ON public.dashboards
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for dashboard_pages
CREATE POLICY "Users can view dashboard pages they have access to" ON public.dashboard_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboards d 
      WHERE d.id = dashboard_pages.dashboard_id 
      AND (d.is_public = true OR d.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage pages of their own dashboards" ON public.dashboard_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dashboards d 
      WHERE d.id = dashboard_pages.dashboard_id 
      AND d.created_by = auth.uid()
    )
  );

-- Create RLS policies for visualizations
CREATE POLICY "Users can view visualizations they have access to" ON public.visualizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboard_pages dp
      JOIN public.dashboards d ON d.id = dp.dashboard_id
      WHERE dp.id = visualizations.dashboard_page_id 
      AND (d.is_public = true OR d.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage visualizations of their own dashboards" ON public.visualizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dashboard_pages dp
      JOIN public.dashboards d ON d.id = dp.dashboard_id
      WHERE dp.id = visualizations.dashboard_page_id 
      AND d.created_by = auth.uid()
    )
  );

-- Create RLS policies for data_sources
CREATE POLICY "Users can view their own data sources" ON public.data_sources
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own data sources" ON public.data_sources
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own data sources" ON public.data_sources
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own data sources" ON public.data_sources
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('dashboard-files', 'dashboard-files', false),
  ('avatars', 'avatars', true),
  ('data-uploads', 'data-uploads', false);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for dashboard files
CREATE POLICY "Users can view dashboard files they have access to" ON storage.objects
  FOR SELECT USING (bucket_id = 'dashboard-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload dashboard files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dashboard-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for data uploads
CREATE POLICY "Users can view their own data uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'data-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload data files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'data-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_pages_updated_at
  BEFORE UPDATE ON public.dashboard_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visualizations_updated_at
  BEFORE UPDATE ON public.visualizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();