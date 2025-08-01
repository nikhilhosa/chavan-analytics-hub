import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity, 
  TrendingUp, 
  Grid3X3,
  Table,
  Gauge,
  MapPin,
  Calendar,
  Hash,
  Type,
  Image,
  Monitor,
  Smartphone,
  Save,
  Play,
  Plus,
  Settings,
  Upload,
  Eye,
  Download,
  Share2,
  Trash2,
  Copy,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Square,
  Circle
} from 'lucide-react';

interface Visualization {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data_source?: string;
  config?: any;
}

interface DashboardPage {
  id: string;
  name: string;
  visualizations: Visualization[];
}

const VISUALIZATION_TYPES = [
  { id: 'bar-chart', name: 'Bar Chart', icon: BarChart3, category: 'Charts' },
  { id: 'line-chart', name: 'Line Chart', icon: LineChart, category: 'Charts' },
  { id: 'pie-chart', name: 'Pie Chart', icon: PieChart, category: 'Charts' },
  { id: 'area-chart', name: 'Area Chart', icon: Activity, category: 'Charts' },
  { id: 'scatter-plot', name: 'Scatter Plot', icon: Grid3X3, category: 'Charts' },
  { id: 'histogram', name: 'Histogram', icon: BarChart3, category: 'Charts' },
  { id: 'box-plot', name: 'Box Plot', icon: Square, category: 'Charts' },
  { id: 'violin-plot', name: 'Violin Plot', icon: Activity, category: 'Charts' },
  { id: 'heatmap', name: 'Heatmap', icon: Grid3X3, category: 'Charts' },
  { id: 'treemap', name: 'Treemap', icon: Square, category: 'Charts' },
  { id: 'sunburst', name: 'Sunburst', icon: Circle, category: 'Charts' },
  { id: 'waterfall', name: 'Waterfall', icon: BarChart3, category: 'Charts' },
  { id: 'funnel', name: 'Funnel', icon: TrendingUp, category: 'Charts' },
  { id: 'gauge', name: 'Gauge', icon: Gauge, category: 'KPI' },
  { id: 'kpi-card', name: 'KPI Card', icon: Hash, category: 'KPI' },
  { id: 'metric', name: 'Metric', icon: TrendingUp, category: 'KPI' },
  { id: 'sparkline', name: 'Sparkline', icon: LineChart, category: 'KPI' },
  { id: 'table', name: 'Table', icon: Table, category: 'Data' },
  { id: 'matrix', name: 'Matrix', icon: Grid3X3, category: 'Data' },
  { id: 'card', name: 'Card', icon: Square, category: 'Data' },
  { id: 'map', name: 'Map', icon: MapPin, category: 'Geo' },
  { id: 'filled-map', name: 'Filled Map', icon: MapPin, category: 'Geo' },
  { id: 'shape-map', name: 'Shape Map', icon: MapPin, category: 'Geo' },
  { id: 'slicer', name: 'Slicer', icon: Settings, category: 'Filters' },
  { id: 'date-slicer', name: 'Date Slicer', icon: Calendar, category: 'Filters' },
  { id: 'text-box', name: 'Text Box', icon: Type, category: 'Visual' },
  { id: 'image', name: 'Image', icon: Image, category: 'Visual' },
  { id: 'button', name: 'Button', icon: MousePointer2, category: 'Interactive' },
  { id: 'bookmark', name: 'Bookmark', icon: Save, category: 'Interactive' }
];

const DashboardBuilder: React.FC = () => {
  // const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dashboardName, setDashboardName] = useState('');
  const [selectedPage, setSelectedPage] = useState(0);
  const [pages, setPages] = useState<DashboardPage[]>([
    { id: '1', name: 'Page 1', visualizations: [] }
  ]);
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Save dashboard
  const saveDashboard = async () => {
    if (!dashboardName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a dashboard name",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate saving for now
      console.log('Saving dashboard:', {
        name: dashboardName,
        pages,
        settings: { viewMode, zoom }
      });

      toast({
        title: "Success",
        description: "Dashboard saved successfully",
      });
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to save dashboard",
        variant: "destructive",
      });
    }
  };

  // Add new page
  const addNewPage = () => {
    const newPage: DashboardPage = {
      id: Date.now().toString(),
      name: `Page ${pages.length + 1}`,
      visualizations: []
    };
    setPages([...pages, newPage]);
    setSelectedPage(pages.length);
  };

  // Add visualization to canvas
  const addVisualization = (type: string) => {
    const newViz: Visualization = {
      id: Date.now().toString(),
      type,
      title: `New ${type}`,
      x: 50,
      y: 50,
      width: 300,
      height: 200,
    };

    const updatedPages = [...pages];
    updatedPages[selectedPage].visualizations.push(newViz);
    setPages(updatedPages);
  };

  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const vizType = e.dataTransfer.getData('visualization-type');
    if (vizType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newViz: Visualization = {
        id: Date.now().toString(),
        type: vizType,
        title: `New ${vizType}`,
        x: Math.max(0, x - 150),
        y: Math.max(0, y - 100),
        width: 300,
        height: 200,
      };

      const updatedPages = [...pages];
      updatedPages[selectedPage].visualizations.push(newViz);
      setPages(updatedPages);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Dashboard Name"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="w-64"
          />
          <Button onClick={saveDashboard} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant={isPreviewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button size="sm" variant="outline">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Visualizations Panel */}
        {!isPreviewMode && (
          <div className="w-80 border-r bg-card flex flex-col">
            <Tabs defaultValue="visualizations" className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visualizations">Visuals</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="format">Format</TabsTrigger>
              </TabsList>

              <TabsContent value="visualizations" className="flex-1 p-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {Object.entries(
                      VISUALIZATION_TYPES.reduce((acc, viz) => {
                        if (!acc[viz.category]) acc[viz.category] = [];
                        acc[viz.category].push(viz);
                        return acc;
                      }, {} as Record<string, typeof VISUALIZATION_TYPES>)
                    ).map(([category, visuals]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-sm mb-2">{category}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {visuals.map((viz) => (
                            <Button
                              key={viz.id}
                              variant="outline"
                              className="h-20 flex flex-col gap-1 p-2"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('visualization-type', viz.id);
                              }}
                              onClick={() => addVisualization(viz.id)}
                            >
                              <viz.icon className="w-6 h-6" />
                              <span className="text-xs">{viz.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="flex-1 p-4">
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Data
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Upload CSV, Excel, JSON files to create data sources
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="format" className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <Label>Background Color</Label>
                    <Input type="color" className="w-full h-8" />
                  </div>
                  <div>
                    <Label>Grid</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Grid type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="lines">Lines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Page Tabs */}
          {!isPreviewMode && (
            <div className="border-b bg-card px-4 py-2 flex items-center gap-2">
              {pages.map((page, index) => (
                <Button
                  key={page.id}
                  variant={selectedPage === index ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPage(index)}
                >
                  {page.name}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={addNewPage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-muted/20 relative">
            <div
              ref={canvasRef}
              className={`relative bg-background border border-dashed border-border/20 mx-auto my-4 ${
                viewMode === 'desktop' ? 'w-[1200px] h-[800px]' : 'w-[375px] h-[667px]'
              }`}
              style={{ transform: `scale(${zoom / 100})` }}
              onDrop={handleCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Grid */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Visualizations */}
              {pages[selectedPage]?.visualizations.map((viz) => (
                <div
                  key={viz.id}
                  className={`absolute border-2 rounded-lg bg-card shadow-sm cursor-pointer ${
                    selectedVisualization === viz.id 
                      ? 'border-primary' 
                      : 'border-border hover:border-border/60'
                  }`}
                  style={{
                    left: viz.x,
                    top: viz.y,
                    width: viz.width,
                    height: viz.height,
                  }}
                  onClick={() => setSelectedVisualization(viz.id)}
                >
                  <div className="p-4 h-full flex items-center justify-center">
                    <div className="text-center">
                      {VISUALIZATION_TYPES.find(v => v.id === viz.type)?.icon && (
                        <div className="flex justify-center mb-2">
                          {React.createElement(
                            VISUALIZATION_TYPES.find(v => v.id === viz.type)!.icon,
                            { className: "w-8 h-8 text-muted-foreground" }
                          )}
                        </div>
                      )}
                      <div className="text-sm font-medium">{viz.title}</div>
                      <div className="text-xs text-muted-foreground">{viz.type}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Drop Zone Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {pages[selectedPage]?.visualizations.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Drag visualizations here</p>
                    <p className="text-sm">or click on visualization types to add them</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        {!isPreviewMode && selectedVisualization && (
          <div className="w-80 border-l bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Properties</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Chart title" />
                </div>
                <div>
                  <Label>Data Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data1">Sales Data</SelectItem>
                      <SelectItem value="data2">Customer Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Position & Size</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
                      <Input type="number" size={8} />
                    </div>
                    <div>
                      <Label className="text-xs">Y</Label>
                      <Input type="number" size={8} />
                    </div>
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input type="number" size={8} />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input type="number" size={8} />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBuilder;