import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface DashboardData {
  id: string;
  name: string;
  data: any;
  type: 'kpi' | 'chart' | 'table' | 'metric';
  config: {
    chartType?: string;
    xAxis?: string;
    yAxis?: string;
    color?: string;
  };
}

export const useDashboardData = (dashboardId?: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!user || !dashboardId) return;
    
    setLoading(true);
    try {
      // Fetch visualizations for the dashboard
      const { data: visualizations, error } = await supabase
        .from('visualizations')
        .select(`
          *,
          dashboard_pages!inner(dashboard_id)
        `)
        .eq('dashboard_pages.dashboard_id', dashboardId);

      if (error) throw error;

      // Transform visualizations into dashboard data format
      const dashboardData: DashboardData[] = visualizations?.map(viz => ({
        id: viz.id,
        name: viz.name,
        data: [], // This would be populated from actual data sources
        type: viz.type as any,
        config: {
          chartType: viz.chart_type || undefined,
          xAxis: (typeof viz.config === 'object' && viz.config !== null && 'xAxis' in viz.config) ? viz.config.xAxis as string : undefined,
          yAxis: (typeof viz.config === 'object' && viz.config !== null && 'yAxis' in viz.config) ? viz.config.yAxis as string : undefined,
          color: (typeof viz.config === 'object' && viz.config !== null && 'color' in viz.config) ? viz.config.color as string : undefined,
        }
      })) || [];

      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = (type: string, count: number = 6) => {
    switch (type) {
      case 'sales':
        return Array.from({ length: count }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i] || `Month ${i + 1}`,
          revenue: Math.floor(Math.random() * 50000) + 30000,
          target: Math.floor(Math.random() * 40000) + 40000,
          deals: Math.floor(Math.random() * 20) + 15
        }));
      
      case 'service':
        return Array.from({ length: count }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i] || `Month ${i + 1}`,
          tickets: Math.floor(Math.random() * 200) + 100,
          resolved: Math.floor(Math.random() * 180) + 90,
          satisfaction: Math.floor(Math.random() * 30) + 70
        }));
      
      case 'admin':
        return Array.from({ length: count }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i] || `Month ${i + 1}`,
          users: Math.floor(Math.random() * 1000) + 500,
          active: Math.floor(Math.random() * 800) + 400,
          growth: Math.floor(Math.random() * 50) + 10
        }));
      
      default:
        return Array.from({ length: count }, (_, i) => ({
          name: `Item ${i + 1}`,
          value: Math.floor(Math.random() * 100) + 10
        }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, dashboardId]);

  return {
    data,
    loading,
    fetchDashboardData,
    generateSampleData,
  };
};