import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'service' | 'admin' | 'custom';
  created_by: string;
  is_public: boolean;
  layout: any;
  created_at: string;
  updated_at: string;
}

export interface DashboardPage {
  id: string;
  dashboard_id: string;
  name: string;
  slug: string;
  layout: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Visualization {
  id: string;
  dashboard_page_id: string;
  name: string;
  type: string;
  chart_type?: string;
  data_source_id?: string;
  config: any;
  position: any;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'api' | 'database';
  connection_config: any;
  schema_info: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useDashboards = () => {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDashboards((data || []) as Dashboard[]);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = async (dashboard: Partial<Dashboard>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .insert({
          name: dashboard.name || '',
          description: dashboard.description || '',
          type: dashboard.type || 'custom',
          is_public: dashboard.is_public || false,
          layout: dashboard.layout || {},
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchDashboards();
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to create dashboard",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDashboard = async (id: string, updates: Partial<Dashboard>) => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchDashboards();
      toast({
        title: "Success",
        description: "Dashboard updated successfully",
      });
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to update dashboard",
        variant: "destructive",
      });
    }
  };

  const deleteDashboard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDashboards();
      toast({
        title: "Success",
        description: "Dashboard deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to delete dashboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [user]);

  return {
    dashboards,
    loading,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  };
};

export const useDashboardPages = (dashboardId: string) => {
  const [pages, setPages] = useState<DashboardPage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPages = async () => {
    if (!dashboardId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_pages')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('created_at');

      if (error) throw error;
      setPages((data || []) as DashboardPage[]);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (page: Partial<DashboardPage>) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_pages')
        .insert({
          name: page.name || '',
          slug: page.slug || '',
          layout: page.layout || {},
          is_default: page.is_default || false,
          dashboard_id: dashboardId,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchPages();
      return data;
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchPages();
  }, [dashboardId]);

  return {
    pages,
    loading,
    fetchPages,
    createPage,
  };
};

export const useDataSources = () => {
  const { user } = useAuth();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDataSources = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDataSources((data || []) as DataSource[]);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data sources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDataSource = async (dataSource: Partial<DataSource>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('data_sources')
        .insert({
          name: dataSource.name || '',
          type: dataSource.type || 'csv',
          connection_config: dataSource.connection_config || {},
          schema_info: dataSource.schema_info || {},
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchDataSources();
      toast({
        title: "Success",
        description: "Data source created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating data source:', error);
      toast({
        title: "Error",
        description: "Failed to create data source",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, [user]);

  return {
    dataSources,
    loading,
    fetchDataSources,
    createDataSource,
  };
};