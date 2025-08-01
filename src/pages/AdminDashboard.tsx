import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Server, 
  Database, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
  Download,
  Settings,
  Lock,
  Key
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const systemMetrics = [
    { name: 'CPU Usage', value: '45%', status: 'normal', icon: Cpu },
    { name: 'Memory Usage', value: '67%', status: 'warning', icon: HardDrive },
    { name: 'Disk Space', value: '23%', status: 'normal', icon: Database },
    { name: 'Network', value: '12 Mbps', status: 'normal', icon: Wifi },
  ];

  const securityEvents = [
    { type: 'Login Attempt', user: 'admin@company.com', status: 'success', time: '2 minutes ago', ip: '192.168.1.100' },
    { type: 'Password Change', user: 'john.doe@company.com', status: 'success', time: '1 hour ago', ip: '10.0.1.45' },
    { type: 'Failed Login', user: 'unknown@external.com', status: 'blocked', time: '2 hours ago', ip: '185.220.101.45' },
    { type: 'Data Export', user: 'jane.smith@company.com', status: 'success', time: '4 hours ago', ip: '192.168.1.102' },
  ];

  const userActivity = [
    { name: 'Active Users', count: 1247, change: '+5.2%', trend: 'up' },
    { name: 'New Registrations', count: 89, change: '+12.3%', trend: 'up' },
    { name: 'Failed Logins', count: 23, change: '-8.1%', trend: 'down' },
    { name: 'Data Exports', count: 156, change: '+3.7%', trend: 'up' },
  ];

  const systemHealth = [
    { service: 'Authentication Service', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
    { service: 'Database Cluster', status: 'healthy', uptime: '99.8%', responseTime: '12ms' },
    { service: 'File Storage', status: 'warning', uptime: '98.2%', responseTime: '180ms' },
    { service: 'Email Service', status: 'healthy', uptime: '99.5%', responseTime: '230ms' },
    { service: 'Backup System', status: 'healthy', uptime: '100%', responseTime: '95ms' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'blocked':
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'healthy':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'blocked':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and security monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="p-3 rounded-full bg-muted/20">
                  <metric.icon className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Activity (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userActivity.map((activity, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">{activity.name}</p>
                <p className="text-2xl font-bold">{activity.count.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {activity.trend === 'up' ? (
                    <span className="text-sm text-green-500">{activity.change}</span>
                  ) : (
                    <span className="text-sm text-red-500">{activity.change}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-1">vs yesterday</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-medium">{service.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.uptime} uptime • {service.responseTime} response
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <p className="font-medium">{event.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.user} • {event.ip}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Key className="w-6 h-6" />
              <span>Reset Passwords</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span>Security Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;