import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter } from 'lucide-react';
import { useDashboards } from '@/hooks/useDashboards';
import { useAuth } from '@/contexts/AuthContext';
import { 
  KPICard, 
  AreaChartComponent, 
  MetricsList,
  kpiIcons 
} from '@/components/ChartComponents';

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboards, loading } = useDashboards();
  const [timeRange, setTimeRange] = useState('this-month');
  
  // Sample data - in a real app, this would come from your data sources
  const monthlyData = [
    { month: 'Jan', revenue: 45000, target: 50000, deals: 23 },
    { month: 'Feb', revenue: 52000, target: 50000, deals: 31 },
    { month: 'Mar', revenue: 48000, target: 50000, deals: 28 },
    { month: 'Apr', revenue: 61000, target: 55000, deals: 35 },
    { month: 'May', revenue: 55000, target: 55000, deals: 32 },
    { month: 'Jun', revenue: 67000, target: 60000, deals: 42 },
  ];

  const salesMetrics = [
    { name: 'Average Deal Size', value: '$12.5K', change: 8.2, changeType: 'increase' as const },
    { name: 'Sales Cycle Length', value: '18 days', change: -5.1, changeType: 'decrease' as const },
    { name: 'Pipeline Velocity', value: '$2.3M', change: 12.4, changeType: 'increase' as const },
    { name: 'Win Rate', value: '24.8%', change: -2.3, changeType: 'decrease' as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-muted-foreground">Track sales performance and manage your pipeline</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value="$328K"
          change={15.3}
          changeType="increase"
          icon={kpiIcons.revenue}
        />
        <KPICard
          title="Deals Closed"
          value="127"
          change={8.1}
          changeType="increase"
          icon={kpiIcons.target}
        />
        <KPICard
          title="Conversion Rate"
          value="24.8%"
          change={-2.3}
          changeType="decrease"
          icon={kpiIcons.activity}
        />
        <KPICard
          title="New Leads"
          value="1,249"
          change={22.5}
          changeType="increase"
          icon={kpiIcons.users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartComponent
          data={monthlyData}
          title="Revenue vs Target"
          xKey="month"
          yKey="revenue"
          color="hsl(var(--primary))"
        />
        <MetricsList
          metrics={salesMetrics}
          title="Key Sales Metrics"
        />
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;