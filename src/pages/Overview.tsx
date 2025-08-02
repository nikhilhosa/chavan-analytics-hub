import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Plus,
  Grid3X3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useDashboards } from '@/hooks/useDashboards';
import DashboardCard from '@/components/DashboardCard';
import { useNavigate } from 'react-router-dom';

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { dashboards, loading, createDashboard, deleteDashboard } = useDashboards();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    type: 'custom' as const,
    is_public: false,
  });

  const handleCreateDashboard = async () => {
    if (!newDashboard.name.trim()) return;
    
    const dashboard = await createDashboard(newDashboard);
    if (dashboard) {
      setIsCreateDialogOpen(false);
      setNewDashboard({ name: '', description: '', type: 'custom', is_public: false });
      navigate(`/dashboard/builder?id=${dashboard.id}`);
    }
  };

  const handleViewDashboard = (dashboard: any) => {
    switch (dashboard.type) {
      case 'sales':
        navigate('/dashboard/sales');
        break;
      case 'service':
        navigate('/dashboard/service');
        break;
      case 'admin':
        navigate('/dashboard/admin');
        break;
      default:
        navigate(`/dashboard/builder?id=${dashboard.id}`);
    }
  };

  const handleEditDashboard = (dashboard: any) => {
    navigate(`/dashboard/builder?id=${dashboard.id}`);
  };

  const handleDeleteDashboard = async (dashboard: any) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      await deleteDashboard(dashboard.id);
    }
  };

  const handleDuplicateDashboard = async (dashboard: any) => {
    await createDashboard({
      name: `${dashboard.name} (Copy)`,
      description: dashboard.description,
      type: dashboard.type,
      is_public: false,
      layout: dashboard.layout,
    });
  };

  const handleShareDashboard = (dashboard: any) => {
    // Implement share functionality
    console.log('Share dashboard:', dashboard);
  };

  const salesData = [
    { month: 'Jan', sales: 45000, target: 50000 },
    { month: 'Feb', sales: 52000, target: 50000 },
    { month: 'Mar', sales: 48000, target: 50000 },
    { month: 'Apr', sales: 61000, target: 55000 },
    { month: 'May', sales: 55000, target: 55000 },
    { month: 'Jun', sales: 67000, target: 60000 },
  ];

  const departmentData = [
    { name: 'Sales', value: 35, color: '#3b82f6' },
    { name: 'Marketing', value: 25, color: '#10b981' },
    { name: 'Service', value: 20, color: '#f59e0b' },
    { name: 'Admin', value: 20, color: '#ef4444' },
  ];

  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: '18,542',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Orders',
      value: '3,241',
      change: '-2.4%',
      trend: 'down',
      icon: ShoppingCart,
      color: 'text-orange-600',
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      change: '+0.5%',
      trend: 'up',
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Dashboard Name</Label>
                  <Input
                    id="name"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                    placeholder="Enter dashboard name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newDashboard.description}
                    onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newDashboard.type} onValueChange={(value: any) => setNewDashboard({ ...newDashboard, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDashboard}>
                    Create Dashboard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Report
          </Button>
        </div>
      </div>

      {/* My Dashboards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Dashboards</h2>
          {dashboards.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/builder')}>
              <Grid3X3 className="w-4 h-4 mr-2" />
              View All
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboards.slice(0, 6).map((dashboard) => (
              <DashboardCard
                key={dashboard.id}
                dashboard={dashboard}
                onView={handleViewDashboard}
                onEdit={handleEditDashboard}
                onDelete={handleDeleteDashboard}
                onDuplicate={handleDuplicateDashboard}
                onShare={handleShareDashboard}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Grid3X3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">No dashboards yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first dashboard to start visualizing your data
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Dashboard
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted/20`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sales Performance
              <Badge variant="outline">6 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  <Bar dataKey="target" fill="hsl(var(--muted))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-sm">{dept.name}: {dept.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { user: 'John Doe', action: 'Created new dashboard', time: '2 hours ago', type: 'create' },
              { user: 'Jane Smith', action: 'Updated sales report', time: '4 hours ago', type: 'update' },
              { user: 'Mike Johnson', action: 'Exported data', time: '6 hours ago', type: 'export' },
              { user: 'Sarah Wilson', action: 'Shared dashboard with team', time: '8 hours ago', type: 'share' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;