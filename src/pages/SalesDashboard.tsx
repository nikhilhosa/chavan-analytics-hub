import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const SalesDashboard: React.FC = () => {
  const monthlyData = [
    { month: 'Jan', revenue: 45000, target: 50000, deals: 23 },
    { month: 'Feb', revenue: 52000, target: 50000, deals: 31 },
    { month: 'Mar', revenue: 48000, target: 50000, deals: 28 },
    { month: 'Apr', revenue: 61000, target: 55000, deals: 35 },
    { month: 'May', revenue: 55000, target: 55000, deals: 32 },
    { month: 'Jun', revenue: 67000, target: 60000, deals: 42 },
  ];

  const salesRepData = [
    { name: 'John Smith', revenue: 125000, deals: 23, conversion: 68 },
    { name: 'Sarah Johnson', revenue: 110000, deals: 28, conversion: 72 },
    { name: 'Mike Davis', revenue: 98000, deals: 19, conversion: 65 },
    { name: 'Lisa Wang', revenue: 87000, deals: 21, conversion: 58 },
    { name: 'Tom Brown', revenue: 76000, deals: 16, conversion: 61 },
  ];

  const salesPipelineData = [
    { stage: 'Prospecting', count: 45, value: 450000 },
    { stage: 'Qualification', count: 32, value: 320000 },
    { stage: 'Proposal', count: 18, value: 540000 },
    { stage: 'Negotiation', count: 12, value: 480000 },
    { stage: 'Closed Won', count: 8, value: 320000 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-muted-foreground">Track sales performance and manage your pipeline</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="this-month">
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$328K</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm ml-1 text-green-500">+15.3%</span>
                  <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deals Closed</p>
                <p className="text-2xl font-bold">127</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm ml-1 text-green-500">+8.1%</span>
                  <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">24.8%</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-sm ml-1 text-red-500">-2.3%</span>
                  <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">1,249</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm ml-1 text-green-500">+22.5%</span>
                  <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Revenue vs Target
              <Badge variant="outline">6 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--muted-foreground))" 
                    fill="hsl(var(--muted-foreground))" 
                    fillOpacity={0.1}
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesPipelineData.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">${stage.value.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">({stage.count} deals)</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stage.value / 540000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesRepData.map((rep, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {rep.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{rep.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${rep.revenue.toLocaleString()} revenue • {rep.deals} deals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={rep.conversion >= 65 ? 'default' : 'secondary'}>
                    {rep.conversion}% conversion
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboard;