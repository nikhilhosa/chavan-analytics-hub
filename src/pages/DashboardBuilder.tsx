import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboards, useDataSources } from '@/hooks/useDashboards';
import VisualizationRenderer from '@/components/VisualizationRenderer';
import FileUploadZone from '@/components/FileUploadZone';
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
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Square,
  Circle,
  Trash2,
  Copy,
  Move3D
} from 'lucide-react';

interface Visualization {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data_source_id?: string;
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
  { id: 'kpi-card', name: 'KPI Card', icon: Hash, category: 'KPI' },
  { id: 'metric', name: 'Metric', icon: TrendingUp, category: 'KPI' },
  { id: 'gauge', name: 'Gauge', icon: Gauge, category: 'KPI' },
  { id: 'table', name: 'Table', icon: Table, category: 'Data' },
  { id: 'text-box', name: 'Text Box', icon: Type, category: 'Visual' }
];

const DashboardBuilder: React.FC = () => {
  const { user } = useAuth();
  const { createDashboard } = useDashboards();
  const { dataSources, fetchDataSources, createDataSource } = useDataSources();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Dashboard state
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [selectedPage, setSelectedPage] = useState(0);
  const [pages, setPages] = useState<DashboardPage[]>([
    { id: '1', name: 'Page 1', visualizations: [] }
  ]);
  
  // UI state
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedViz, setDraggedViz] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    fetchDataSources();
  }, []);

  // Get selected visualization object
  const getSelectedVisualization = (): Visualization | null => {
    if (!selectedVisualization) return null;
    return pages[selectedPage]?.visualizations.find(v => v.id === selectedVisualization) || null;
  };

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
      const dashboard = await createDashboard({
        name: dashboardName,
        description: dashboardDescription,
        type: 'custom',
        layout: { 
          pages: pages.map(page => ({
            ...page,
            visualizations: page.visualizations
          })), 
          settings: { viewMode, zoom } 
        },
        is_public: false
      });

      if (dashboard) {
        toast({
          title: "Success",
          description: "Dashboard saved successfully",
        });
      }
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
  const addVisualization = (type: string, x = 50, y = 50) => {
    const newViz: Visualization = {
      id: Date.now().toString(),
      type,
      title: `New ${VISUALIZATION_TYPES.find(v => v.id === type)?.name || type}`,
      x,
      y,
      width: 300,
      height: 200,
      config: getDefaultConfig(type)
    };

    const updatedPages = [...pages];
    updatedPages[selectedPage].visualizations.push(newViz);
    setPages(updatedPages);
    setSelectedVisualization(newViz.id);
  };

  // Get default config for visualization type
  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'kpi-card':
        return { value: "12,345", change: 12.5, changeType: "increase" };
      case 'text-box':
        return { content: "Add your text content here" };
      case 'gauge':
        return { value: 75, min: 0, max: 100 };
      default:
        return { color: "hsl(var(--primary))" };
    }
  };

  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const vizType = e.dataTransfer.getData('visualization-type');
    if (vizType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, (e.clientX - rect.left) / (zoom / 100) - 150);
      const y = Math.max(0, (e.clientY - rect.top) / (zoom / 100) - 100);
      addVisualization(vizType, x, y);
    }
  };

  // Handle visualization drag start
  const handleVizDragStart = (e: React.MouseEvent, vizId: string) => {
    if (isPreviewMode) return;
    
    setIsDragging(true);
    setDraggedViz(vizId);
    
    const viz = pages[selectedPage].visualizations.find(v => v.id === vizId);
    if (viz && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - viz.x * (zoom / 100),
        y: e.clientY - rect.top - viz.y * (zoom / 100)
      });
    }
    
    setSelectedVisualization(vizId);
    e.preventDefault();
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedViz || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, (e.clientX - rect.left - dragOffset.x) / (zoom / 100));
    const newY = Math.max(0, (e.clientY - rect.top - dragOffset.y) / (zoom / 100));

    updateVisualizationPosition(draggedViz, newX, newY);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedViz(null);
  };

  // Update visualization position
  const updateVisualizationPosition = (vizId: string, x: number, y: number) => {
    const updatedPages = [...pages];
    const viz = updatedPages[selectedPage].visualizations.find(v => v.id === vizId);
    if (viz) {
      viz.x = x;
      viz.y = y;
      setPages(updatedPages);
    }
  };

  // Update visualization property
  const updateVisualizationProperty = (vizId: string, property: string, value: any) => {
    const updatedPages = [...pages];
    const viz = updatedPages[selectedPage].visualizations.find(v => v.id === vizId);
    if (viz) {
      if (property.startsWith('config.')) {
        const configKey = property.replace('config.', '');
        viz.config = { ...viz.config, [configKey]: value };
      } else {
        (viz as any)[property] = value;
      }
      setPages(updatedPages);
    }
  };

  // Delete visualization
  const deleteVisualization = (vizId: string) => {
    const updatedPages = [...pages];
    updatedPages[selectedPage].visualizations = updatedPages[selectedPage].visualizations.filter(v => v.id !== vizId);
    setPages(updatedPages);
    if (selectedVisualization === vizId) {
      setSelectedVisualization(null);
    }
  };

  // Duplicate visualization
  const duplicateVisualization = (vizId: string) => {
    const viz = pages[selectedPage].visualizations.find(v => v.id === vizId);
    if (viz) {
      const newViz: Visualization = {
        ...viz,
        id: Date.now().toString(),
        x: viz.x + 20,
        y: viz.y + 20,
        title: `${viz.title} Copy`
      };
      const updatedPages = [...pages];
      updatedPages[selectedPage].visualizations.push(newViz);
      setPages(updatedPages);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const dataSource = await createDataSource({
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: file.type.includes('csv') ? 'csv' : 'json',
          connection_config: {
            filename: file.name,
            size: file.size
          }
        });

        if (dataSource) {
          toast({
            title: "Success",
            description: `Data source "${dataSource.name}" created successfully`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    setShowUploadDialog(false);
  };

  const selectedViz = getSelectedVisualization();

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
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setZoom(Math.max(25, zoom - 25))}
            disabled={zoom <= 25}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            disabled={zoom >= 200}
          >
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
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Data Source</DialogTitle>
                      </DialogHeader>
                      <FileUploadZone
                        onFilesUploaded={(uploadedFiles) => {
                          uploadedFiles.forEach(file => {
                            handleFileUpload([{ name: file.name, size: file.size, type: file.type } as File]);
                          });
                        }}
                        maxFiles={5}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Data Sources</h4>
                    {dataSources.map((source) => (
                      <div key={source.id} className="p-2 border rounded text-sm">
                        <div className="font-medium">{source.name}</div>
                        <div className="text-muted-foreground text-xs">{source.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="format" className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <Label>Dashboard Description</Label>
                    <Textarea
                      value={dashboardDescription}
                      onChange={(e) => setDashboardDescription(e.target.value)}
                      placeholder="Describe your dashboard..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <Input type="color" className="w-full h-8 mt-1" />
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
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
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
                  onMouseDown={(e) => handleVizDragStart(e, viz.id)}
                  style={{ cursor: isDragging && draggedViz === viz.id ? 'grabbing' : 'grab' }}
                >
                  <VisualizationRenderer
                    id={viz.id}
                    type={viz.type}
                    title={viz.title}
                    config={viz.config}
                    isSelected={selectedVisualization === viz.id}
                    onClick={() => setSelectedVisualization(viz.id)}
                    style={{
                      left: viz.x,
                      top: viz.y,
                      width: viz.width,
                      height: viz.height,
                    }}
                  />
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
        {!isPreviewMode && selectedViz && (
          <div className="w-80 border-l bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Properties</h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => duplicateVisualization(selectedViz.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteVisualization(selectedViz.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={selectedViz.title}
                    onChange={(e) => updateVisualizationProperty(selectedViz.id, 'title', e.target.value)}
                    placeholder="Chart title" 
                  />
                </div>
                
                <div>
                  <Label>Data Source</Label>
                  <Select
                    value={selectedViz.data_source_id || ''}
                    onValueChange={(value) => updateVisualizationProperty(selectedViz.id, 'data_source_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Position & Size</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
                      <Input 
                        type="number" 
                        value={selectedViz.x}
                        onChange={(e) => updateVisualizationProperty(selectedViz.id, 'x', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Y</Label>
                      <Input 
                        type="number" 
                        value={selectedViz.y}
                        onChange={(e) => updateVisualizationProperty(selectedViz.id, 'y', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input 
                        type="number" 
                        value={selectedViz.width}
                        onChange={(e) => updateVisualizationProperty(selectedViz.id, 'width', parseInt(e.target.value) || 100)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input 
                        type="number" 
                        value={selectedViz.height}
                        onChange={(e) => updateVisualizationProperty(selectedViz.id, 'height', parseInt(e.target.value) || 100)}
                      />
                    </div>
                  </div>
                </div>

                {/* Type-specific configuration */}
                {selectedViz.type === 'kpi-card' && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">KPI Configuration</h4>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Input 
                            value={selectedViz.config?.value || ''}
                            onChange={(e) => updateVisualizationProperty(selectedViz.id, 'config.value', e.target.value)}
                            placeholder="12,345"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Change (%)</Label>
                          <Input 
                            type="number"
                            value={selectedViz.config?.change || ''}
                            onChange={(e) => updateVisualizationProperty(selectedViz.id, 'config.change', parseFloat(e.target.value) || 0)}
                            placeholder="12.5"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Change Type</Label>
                          <Select
                            value={selectedViz.config?.changeType || 'increase'}
                            onValueChange={(value) => updateVisualizationProperty(selectedViz.id, 'config.changeType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="increase">Increase</SelectItem>
                              <SelectItem value="decrease">Decrease</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedViz.type === 'text-box' && (
                  <>
                    <Separator />
                    <div>
                      <Label>Content</Label>
                      <Textarea 
                        value={selectedViz.config?.content || ''}
                        onChange={(e) => updateVisualizationProperty(selectedViz.id, 'config.content', e.target.value)}
                        placeholder="Add your text content here"
                      />
                    </div>
                  </>
                )}

                {(selectedViz.type.includes('chart') || selectedViz.type === 'gauge') && (
                  <>
                    <Separator />
                    <div>
                      <Label>Color</Label>
                      <Input 
                        type="color"
                        value={selectedViz.config?.color || '#000000'}
                        onChange={(e) => updateVisualizationProperty(selectedViz.id, 'config.color', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBuilder;