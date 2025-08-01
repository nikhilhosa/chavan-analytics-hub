import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Headphones, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ServiceDashboard: React.FC = () => {
  const ticketData = [
    { day: 'Mon', new: 23, resolved: 18, pending: 12 },
    { day: 'Tue', new: 31, resolved: 28, pending: 8 },
    { day: 'Wed', new: 18, resolved: 22, pending: 15 },
    { day: 'Thu', new: 28, resolved: 25, pending: 11 },
    { day: 'Fri', new: 35, resolved: 32, pending: 6 },
    { day: 'Sat', new: 12, resolved: 15, pending: 3 },
    { day: 'Sun', new: 8, resolved: 10, pending: 2 },
  ];

  const satisfactionData = [
    { month: 'Jan', rating: 4.2 },
    { month: 'Feb', rating: 4.3 },
    { month: 'Mar', rating: 4.1 },
    { month: 'Apr', rating: 4.4 },
    { month: 'May', rating: 4.5 },
    { month: 'Jun', rating: 4.6 },
  ];

  const priorityData = [
    { name: 'Low', value: 45, color: '#10b981' },
    { name: 'Medium', value: 35, color: '#f59e0b' },
    { name: 'High', value: 15, color: '#ef4444' },
    { name: 'Critical', value: 5, color: '#7c3aed' },
  ];

  const agentPerformance = [
    { name: 'Alice Johnson', tickets: 89, avgTime: '2h 15m', satisfaction: 4.8, status: 'online' },
    { name: 'Bob Smith', tickets: 76, avgTime: '1h 45m', satisfaction: 4.6, status: 'online' },
    { name: 'Carol Davis', tickets: 82, avgTime: '2h 30m', satisfaction: 4.7, status: 'away' },
    { name: 'David Wilson', tickets: 65, avgTime: '3h 10m', satisfaction: 4.3, status: 'offline' },
    { name: 'Emma Brown', tickets: 91, avgTime: '1h 58m', satisfaction: 4.9, status: 'online' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Dashboard</h1>
          <p className="text-muted-foreground">Monitor customer support performance and satisfaction</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
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
                <p className="text-sm font-medium text-muted-foreground">Active Tickets</p>
                <p className="text-2xl font-bold">127</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-sm ml-1 text-red-500">+8</span>
                  <span className="text-xs text-muted-foreground ml-1">from yesterday</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2h 15m</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm ml-1 text-green-500">-15m</span>
                  <span className="text-xs text-muted-foreground ml-1">from yesterday</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold">87.3%</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm ml-1 text-green-500">+2.1%</span>
                  <span className="text-xs text-muted-foreground ml-1">from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">4.6</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm ml-1 text-green-500">+0.2</span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="new" fill="hsl(var(--primary))" name="New" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {priorityData.map((priority, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: priority.color }}
                  />
                  <span className="text-sm">{priority.name}: {priority.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Satisfaction Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformance.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                      agent.status === 'online' ? 'bg-green-500' : 
                      agent.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.tickets} tickets • {agent.avgTime} avg time
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{agent.satisfaction}</span>
                  </div>
                  <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                    {agent.status}
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

export default ServiceDashboard;