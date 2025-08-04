-- Create dashboard templates table
CREATE TABLE public.dashboard_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  thumbnail_url TEXT,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard themes table
CREATE TABLE public.dashboard_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  fonts JSONB NOT NULL DEFAULT '{}'::jsonb,
  spacing JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard filters table
CREATE TABLE public.dashboard_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard comments table
CREATE TABLE public.dashboard_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  position JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard versions table
CREATE TABLE public.dashboard_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard analytics table
CREATE TABLE public.dashboard_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.dashboard_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_templates
CREATE POLICY "Users can view all templates" ON public.dashboard_templates
FOR SELECT USING (true);

CREATE POLICY "Users can create their own templates" ON public.dashboard_templates
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON public.dashboard_templates
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON public.dashboard_templates
FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for dashboard_themes
CREATE POLICY "Users can view all themes" ON public.dashboard_themes
FOR SELECT USING (true);

CREATE POLICY "Users can create their own themes" ON public.dashboard_themes
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own themes" ON public.dashboard_themes
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own themes" ON public.dashboard_themes
FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for dashboard_filters
CREATE POLICY "Users can manage filters of their own dashboards" ON public.dashboard_filters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM dashboards d 
    WHERE d.id = dashboard_filters.dashboard_id 
    AND d.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view filters of accessible dashboards" ON public.dashboard_filters
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM dashboards d 
    WHERE d.id = dashboard_filters.dashboard_id 
    AND (d.is_public = true OR d.created_by = auth.uid())
  )
);

-- RLS Policies for dashboard_comments
CREATE POLICY "Users can manage comments on their own dashboards" ON public.dashboard_comments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM dashboards d 
    WHERE d.id = dashboard_comments.dashboard_id 
    AND d.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view comments on accessible dashboards" ON public.dashboard_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM dashboards d 
    WHERE d.id = dashboard_comments.dashboard_id 
    AND (d.is_public = true OR d.created_by = auth.uid())
  )
);

CREATE POLICY "Users can create comments" ON public.dashboard_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for dashboard_versions
CREATE POLICY "Users can manage versions of their own dashboards" ON public.dashboard_versions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM dashboards d 
    WHERE d.id = dashboard_versions.dashboard_id 
    AND d.created_by = auth.uid()
  )
);

-- RLS Policies for dashboard_analytics
CREATE POLICY "Users can view analytics of their own dashboards" ON public.dashboard_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM dashboards d 
    WHERE d.id = dashboard_analytics.dashboard_id 
    AND d.created_by = auth.uid()
  )
);

CREATE POLICY "Anyone can insert analytics" ON public.dashboard_analytics
FOR INSERT WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.dashboard_filters 
ADD CONSTRAINT fk_dashboard_filters_dashboard_id 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

ALTER TABLE public.dashboard_comments 
ADD CONSTRAINT fk_dashboard_comments_dashboard_id 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

ALTER TABLE public.dashboard_versions 
ADD CONSTRAINT fk_dashboard_versions_dashboard_id 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

ALTER TABLE public.dashboard_analytics 
ADD CONSTRAINT fk_dashboard_analytics_dashboard_id 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_dashboard_templates_updated_at
BEFORE UPDATE ON public.dashboard_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_themes_updated_at
BEFORE UPDATE ON public.dashboard_themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_filters_updated_at
BEFORE UPDATE ON public.dashboard_filters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_comments_updated_at
BEFORE UPDATE ON public.dashboard_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_dashboard_templates_category ON public.dashboard_templates(category);
CREATE INDEX idx_dashboard_templates_featured ON public.dashboard_templates(is_featured);
CREATE INDEX idx_dashboard_filters_dashboard_id ON public.dashboard_filters(dashboard_id);
CREATE INDEX idx_dashboard_comments_dashboard_id ON public.dashboard_comments(dashboard_id);
CREATE INDEX idx_dashboard_versions_dashboard_id ON public.dashboard_versions(dashboard_id);
CREATE INDEX idx_dashboard_analytics_dashboard_id ON public.dashboard_analytics(dashboard_id);
CREATE INDEX idx_dashboard_analytics_event_type ON public.dashboard_analytics(event_type);
CREATE INDEX idx_dashboard_analytics_created_at ON public.dashboard_analytics(created_at);