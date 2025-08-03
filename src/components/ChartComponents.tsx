import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Activity
} from 'lucide-react';

interface ChartData {
  [key: string]: any;
}

interface BaseChartProps {
  data: ChartData[];
  title?: string;
  className?: string;
}

export const KPICard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, value, change, changeType, icon, className = '' }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                {changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${
                  changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {changeType === 'increase' ? '+' : ''}{change}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-full bg-primary/10">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const BarChartComponent: React.FC<BaseChartProps & {
  xKey: string;
  yKey: string;
  color?: string;
}> = ({ data, title, xKey, yKey, color = 'hsl(var(--primary))', className = '' }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const LineChartComponent: React.FC<BaseChartProps & {
  xKey: string;
  yKey: string;
  color?: string;
}> = ({ data, title, xKey, yKey, color = 'hsl(var(--primary))', className = '' }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const AreaChartComponent: React.FC<BaseChartProps & {
  xKey: string;
  yKey: string;
  color?: string;
}> = ({ data, title, xKey, yKey, color = 'hsl(var(--primary))', className = '' }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                stroke={color} 
                fill={color}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const PieChartComponent: React.FC<BaseChartProps & {
  dataKey: string;
  nameKey: string;
  colors?: string[];
}> = ({ data, title, dataKey, nameKey, colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'], className = '' }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsList: React.FC<{
  metrics: Array<{
    name: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease';
  }>;
  title?: string;
  className?: string;
}> = ({ metrics, title, className = '' }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div>
                <p className="font-medium">{metric.name}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              {metric.change && (
                <Badge variant={metric.changeType === 'increase' ? 'default' : 'secondary'}>
                  {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Preset KPI icons
export const kpiIcons = {
  revenue: <DollarSign className="w-6 h-6 text-green-600" />,
  users: <Users className="w-6 h-6 text-blue-600" />,
  target: <Target className="w-6 h-6 text-orange-600" />,
  activity: <Activity className="w-6 h-6 text-purple-600" />
};