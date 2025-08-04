import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChartComponent, 
  LineChartComponent, 
  AreaChartComponent, 
  PieChartComponent,
  KPICard,
  MetricsList 
} from '@/components/ChartComponents';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity, 
  TrendingUp,
  Table,
  Hash,
  Grid3X3
} from 'lucide-react';

interface VisualizationProps {
  id: string;
  type: string;
  title: string;
  config?: any;
  data?: any[];
  isSelected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Sample data for different visualization types
const getSampleData = (type: string) => {
  switch (type) {
    case 'bar-chart':
    case 'line-chart':
    case 'area-chart':
      return [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
        { name: 'Jun', value: 700 }
      ];
    case 'pie-chart':
      return [
        { name: 'Desktop', value: 400 },
        { name: 'Mobile', value: 300 },
        { name: 'Tablet', value: 200 }
      ];
    default:
      return [];
  }
};

const VisualizationRenderer: React.FC<VisualizationProps> = ({
  id,
  type,
  title,
  config = {},
  data,
  isSelected = false,
  onClick,
  style
}) => {
  const sampleData = data || getSampleData(type);
  
  const renderVisualization = () => {
    switch (type) {
      case 'bar-chart':
        return (
          <BarChartComponent
            data={sampleData}
            title={title}
            xKey="name"
            yKey="value"
            color={config.color || "hsl(var(--primary))"}
          />
        );
      
      case 'line-chart':
        return (
          <LineChartComponent
            data={sampleData}
            title={title}
            xKey="name"
            yKey="value"
            color={config.color || "hsl(var(--primary))"}
          />
        );
      
      case 'area-chart':
        return (
          <AreaChartComponent
            data={sampleData}
            title={title}
            xKey="name"
            yKey="value"
            color={config.color || "hsl(var(--primary))"}
          />
        );
      
      case 'pie-chart':
        return (
          <PieChartComponent
            data={sampleData}
            title={title}
            dataKey="value"
            nameKey="name"
          />
        );
      
      case 'kpi-card':
        return (
          <KPICard
            title={title}
            value={config.value || "12,345"}
            change={config.change || 12.5}
            changeType={config.changeType || "increase"}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        );
      
      case 'table':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleData.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'text-box':
        return (
          <Card className="h-full">
            <CardContent className="p-4 flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">
                  {config.content || "Add your text content here"}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        // Fallback placeholder
        const IconComponent = getIconForType(type);
        return (
          <Card className="h-full">
            <CardContent className="p-4 flex items-center justify-center h-full">
              <div className="text-center">
                <IconComponent className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-muted-foreground capitalize">{type.replace('-', ' ')}</div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div
      className={`absolute border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary shadow-lg' 
          : 'border-border hover:border-border/60 hover:shadow-md'
      }`}
      style={style}
      onClick={onClick}
    >
      {renderVisualization()}
    </div>
  );
};

const getIconForType = (type: string) => {
  const iconMap: Record<string, any> = {
    'bar-chart': BarChart3,
    'line-chart': LineChart,
    'pie-chart': PieChart,
    'area-chart': Activity,
    'kpi-card': Hash,
    'table': Table,
    'metric': TrendingUp,
    'gauge': Activity,
    'scatter-plot': Grid3X3,
    'heatmap': Grid3X3,
  };
  
  return iconMap[type] || Grid3X3;
};

export default VisualizationRenderer;