import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Plus, Save, Eye, EyeOff, Download, Upload, Share2, Settings, 
  BarChart3, LineChart, PieChart, Table, Type, Image, 
  Grid, Layout, Palette, Filter, Users, MessageSquare,
  History, Play, Square, Circle, Triangle, Zap, Star,
  Copy, Trash2, Move, RotateCcw, ZoomIn, ZoomOut,
  Layers, MousePointer, Hand, Code, Database, Globe,
  Lock, Unlock, Bell, Search, MoreHorizontal, Monitor, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import VisualizationRenderer from '@/components/VisualizationRenderer';
import { ChartCustomization, getDefaultChartStyle } from '@/components/ChartCustomization';
import { FilterPanel, FilterConfig, FILTER_TYPES } from '@/components/FilterComponents';
import FileUploadZone from '@/components/FileUploadZone';
import { ShareDialog, getDefaultShareSettings } from '@/components/ShareDashboard';

// Enhanced interfaces
interface Visualization {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config: any;
  data?: any[];
  style?: any;
  filters?: any[];
}

interface DashboardPage {
  id: string;
  name: string;
  slug: string;
  visualizations: Visualization[];
  filters?: any[];
  theme?: any;
}

interface Dashboard {
  id?: string;
  name: string;
  description: string;
  type: string;
  pages: DashboardPage[];
  theme?: any;
  isPublic?: boolean;
  created_by?: string;
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  layout: any;
  is_featured: boolean;
}

interface DashboardTheme {
  id: string;
  name: string;
  colors: any;
  fonts: any;
  spacing: any;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  connection_config: any;
  schema_info: any;
}

// Visualization types with enhanced categories
const VISUALIZATION_TYPES = [
  // Charts
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, category: 'charts' },
  { id: 'line', name: 'Line Chart', icon: LineChart, category: 'charts' },
  { id: 'area', name: 'Area Chart', icon: LineChart, category: 'charts' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, category: 'charts' },
  
  // Data
  { id: 'table', name: 'Data Table', icon: Table, category: 'data' },
  { id: 'kpi', name: 'KPI Card', icon: Square, category: 'data' },
  
  // Content
  { id: 'text', name: 'Text Box', icon: Type, category: 'content' },
  { id: 'image', name: 'Image', icon: Image, category: 'content' },
  
  // Interactive
  { id: 'filter', name: 'Filter', icon: Filter, category: 'interactive' },
  { id: 'button', name: 'Action Button', icon: Zap, category: 'interactive' },
];

const TEMPLATE_CATEGORIES = [
  'all', 'business', 'sales', 'marketing', 'finance', 'hr', 'analytics'
];

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

export default function EnhancedDashboardBuilder() {
  const { user } = useAuth();
  
  // Core dashboard state
  const [dashboard, setDashboard] = useState<Dashboard>({
    name: 'New Dashboard',
    description: '',
    type: 'business',
    pages: [{
      id: 'page-1',
      name: 'Page 1',
      slug: 'page-1',
      visualizations: [],
      filters: [],
    }]
  });
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  
  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [sidebarTab, setSidebarTab] = useState('visualizations');
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [draggedViz, setDraggedViz] = useState<string | null>(null);
  
  // Data and resources
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [themes, setThemes] = useState<DashboardTheme[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  
  // Advanced features state
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [shareSettings, setShareSettings] = useState(getDefaultShareSettings());
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load resources on component mount
  useEffect(() => {
    if (user) {
      loadTemplates();
      loadThemes();
      loadDataSources();
      loadDashboards();
    }
  }, [user]);

  // Resource loading functions
  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_templates')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_themes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('Error loading themes:', error);
    }
  };

  const loadDataSources = async () => {
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDataSources(data || []);
    } catch (error) {
      console.error('Error loading data sources:', error);
    }
  };

  const loadDashboards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      // Transform Supabase data to Dashboard interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        type: item.type,
        pages: (item.layout as any)?.pages || [],
        isPublic: item.is_public,
        created_by: item.created_by
      }));
      setDashboards(transformedData);
    } catch (error) {
      console.error('Error loading dashboards:', error);
    }
  };

  // Dashboard operations
  const saveDashboard = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const dashboardData = {
        name: dashboard.name,
        description: dashboard.description,
        type: dashboard.type,
        layout: { pages: dashboard.pages },
        is_public: dashboard.isPublic || false,
        created_by: user.id,
      };

      let result;
      if (dashboard.id) {
        const { data, error } = await supabase
          .from('dashboards')
          .update(dashboardData)
          .eq('id', dashboard.id)
          .select()
          .single();
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from('dashboards')
          .insert(dashboardData)
          .select()
          .single();
        result = { data, error };
      }

      if (result.error) throw result.error;
      
      setDashboard(prev => ({ ...prev, id: result.data.id }));
      await saveVersion();
      toast.success('Dashboard saved successfully!');
      
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error('Failed to save dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const saveVersion = async () => {
    if (!dashboard.id || !user) return;
    
    try {
      const { data: existingVersions } = await supabase
        .from('dashboard_versions')
        .select('version_number')
        .eq('dashboard_id', dashboard.id)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = existingVersions?.[0]?.version_number ? existingVersions[0].version_number + 1 : 1;

      await supabase.from('dashboard_versions').insert({
        dashboard_id: dashboard.id,
        version_number: nextVersion,
        layout: { pages: dashboard.pages },
        created_by: user.id,
      });
    } catch (error) {
      console.error('Error saving version:', error);
    }
  };

  // Visualization operations
  const addVisualization = (type: string) => {
    const newVisualization: Visualization = {
      id: `viz-${Date.now()}`,
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      config: getDefaultConfig(type),
      style: getDefaultChartStyle(),
    };

    setDashboard(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) =>
        index === selectedPageIndex
          ? { ...page, visualizations: [...page.visualizations, newVisualization] }
          : page
      )
    }));

    setSelectedVisualization(newVisualization.id);
  };

  const getDefaultConfig = (type: string) => {
    const configs = {
      bar: { dataKey: 'value', xAxisKey: 'name' },
      line: { dataKey: 'value', xAxisKey: 'name' },
      area: { dataKey: 'value', xAxisKey: 'name' },
      pie: { dataKey: 'value', nameKey: 'name' },
      table: { columns: ['name', 'value'], pageSize: 10 },
      kpi: { value: 0, title: 'KPI', format: 'number' },
      text: { content: 'Enter your text here', fontSize: 16 },
      image: { src: '', alt: 'Image' },
      filter: { type: 'dropdown', options: [] },
      button: { label: 'Click me', action: 'custom' },
    };
    return configs[type as keyof typeof configs] || {};
  };

  const updateVisualization = (id: string, updates: Partial<Visualization>) => {
    setDashboard(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) =>
        index === selectedPageIndex
          ? {
              ...page,
              visualizations: page.visualizations.map(viz =>
                viz.id === id ? { ...viz, ...updates } : viz
              )
            }
          : page
      )
    }));
  };

  const deleteVisualization = (id: string) => {
    setDashboard(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) =>
        index === selectedPageIndex
          ? {
              ...page,
              visualizations: page.visualizations.filter(viz => viz.id !== id)
            }
          : page
      )
    }));
    setSelectedVisualization(null);
  };

  const duplicateVisualization = (id: string) => {
    const currentPage = dashboard.pages[selectedPageIndex];
    const viz = currentPage.visualizations.find(v => v.id === id);
    if (!viz) return;

    const newViz = {
      ...viz,
      id: `viz-${Date.now()}`,
      x: viz.x + 20,
      y: viz.y + 20,
      name: `${viz.name} Copy`,
    };

    setDashboard(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) =>
        index === selectedPageIndex
          ? { ...page, visualizations: [...page.visualizations, newViz] }
          : page
      )
    }));
  };

  // Page operations
  const addNewPage = () => {
    const newPage: DashboardPage = {
      id: `page-${Date.now()}`,
      name: `Page ${dashboard.pages.length + 1}`,
      slug: `page-${dashboard.pages.length + 1}`,
      visualizations: [],
      filters: [],
    };

    setDashboard(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setSelectedPageIndex(dashboard.pages.length);
  };

  const deletePage = (index: number) => {
    if (dashboard.pages.length <= 1) {
      toast.error('Cannot delete the last page');
      return;
    }

    setDashboard(prev => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== index)
    }));

    if (selectedPageIndex >= dashboard.pages.length - 1) {
      setSelectedPageIndex(Math.max(0, selectedPageIndex - 1));
    }
  };

  // Template operations
  const applyTemplate = async (template: DashboardTemplate) => {
    try {
      setDashboard(prev => ({
        ...prev,
        pages: template.layout.pages || [{
          id: 'page-1',
          name: 'Page 1',
          slug: 'page-1',
          visualizations: [],
          filters: [],
        }]
      }));
      toast.success('Template applied successfully!');
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    }
  };

  const saveAsTemplate = async () => {
    if (!user) return;
    
    try {
      const templateData = {
        name: `${dashboard.name} Template`,
        description: dashboard.description,
        category: 'custom',
        layout: { pages: dashboard.pages },
        created_by: user.id,
      };

      const { error } = await supabase
        .from('dashboard_templates')
        .insert(templateData);

      if (error) throw error;
      toast.success('Template saved successfully!');
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // File operations
  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const text = await file.text();
        let data;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(text);
        }

        if (data) {
          const dataSource = {
            name: file.name.replace(/\.[^/.]+$/, ""),
            type: 'file',
            connection_config: { fileName: file.name },
            schema_info: { data },
            created_by: user?.id,
          };

          const { error } = await supabase
            .from('data_sources')
            .insert(dataSource);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
    
    loadDataSources();
    toast.success('Files uploaded successfully!');
    setShowUploadDialog(false);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    }).filter(obj => Object.values(obj).some(v => v !== ''));
  };

  // Export functions
  const exportDashboard = () => {
    const dataStr = JSON.stringify(dashboard, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dashboard.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Drag and drop handlers
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addVisualizationAtPosition(type, x, y);
  };

  const addVisualizationAtPosition = (type: string, x: number, y: number) => {
    const newVisualization: Visualization = {
      id: `viz-${Date.now()}`,
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: Math.max(0, x - 150),
      y: Math.max(0, y - 100),
      width: 300,
      height: 200,
      config: getDefaultConfig(type),
      style: getDefaultChartStyle(),
    };

    setDashboard(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) =>
        index === selectedPageIndex
          ? { ...page, visualizations: [...page.visualizations, newVisualization] }
          : page
      )
    }));

    setSelectedVisualization(newVisualization.id);
  };

  const handleVizDragStart = (e: React.MouseEvent, vizId: string) => {
    if (isPreviewMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    setDraggedViz(vizId);
    setSelectedVisualization(vizId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedVisualization || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    updateVisualization(selectedVisualization, {
      x: Math.max(0, Math.round(x / GRID_SIZE) * GRID_SIZE),
      y: Math.max(0, Math.round(y / GRID_SIZE) * GRID_SIZE)
    });
  }, [isDragging, selectedVisualization, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDraggedViz(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Filter management
  const addFilter = (type: string) => {
    const newFilter: FilterConfig = {
      id: `filter-${Date.now()}`,
      type: type as any,
      label: `New ${type} Filter`,
      field: '',
      options: type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };
    setActiveFilters([...activeFilters, newFilter]);
  };

  const updateFilter = (filterId: string, value: any) => {
    setFilterValues({ ...filterValues, [filterId]: value });
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
    const newFilterValues = { ...filterValues };
    delete newFilterValues[filterId];
    setFilterValues(newFilterValues);
  };

  const clearAllFilters = () => {
    setFilterValues({});
  };

  // Analytics tracking
  const trackEvent = async (eventType: string, eventData: any) => {
    if (!dashboard.id) return;
    
    try {
      await supabase.from('dashboard_analytics').insert({
        dashboard_id: dashboard.id,
        event_type: eventType,
        event_data: eventData,
        user_id: user?.id,
        session_id: `session-${Date.now()}`,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveDashboard();
            break;
          case 'd':
            if (selectedVisualization) {
              e.preventDefault();
              duplicateVisualization(selectedVisualization);
            }
            break;
        }
      }
      
      if (e.key === 'Delete' && selectedVisualization) {
        deleteVisualization(selectedVisualization);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVisualization]);

  // Get current page
  const currentPage = dashboard.pages[selectedPageIndex];
  const selectedViz = currentPage?.visualizations.find(v => v.id === selectedVisualization);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dashboard Builder</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                onClick={saveDashboard}
                disabled={isSaving}
              >
                {isSaving ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              value={dashboard.name}
              onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Dashboard name"
            />
            <Textarea
              value={dashboard.description}
              onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Dashboard description"
              rows={2}
            />
          </div>
        </div>

        <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4 px-4 py-2">
            <TabsTrigger value="visualizations" className="text-xs">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Database className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              <Layout className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-4">
            <TabsContent value="visualizations" className="space-y-4 mt-4">
              <div>
                <h3 className="font-medium mb-3">Add Visualizations</h3>
                <div className="grid grid-cols-2 gap-2">
                  {VISUALIZATION_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 text-xs"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', type.id)}
                      onClick={() => addVisualization(type.id)}
                    >
                      <type.icon className="w-6 h-6" />
                      {type.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Data Sources</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Data</DialogTitle>
                      </DialogHeader>
                      <FileUploadZone onFilesUploaded={handleFileUpload} />
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2">
                  {dataSources.map((source) => (
                    <Card key={source.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.type}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Templates</h3>
                  <Button size="sm" variant="outline" onClick={saveAsTemplate}>
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="p-3 cursor-pointer hover:bg-accent"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.category}</p>
                        </div>
                        {template.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Dashboard Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Public Dashboard</Label>
                      <Switch
                        checked={dashboard.isPublic || false}
                        onCheckedChange={(checked) => 
                          setDashboard(prev => ({ ...prev, isPublic: checked }))
                        }
                      />
                    </div>
                    
                    <div>
                      <Label>Dashboard Type</Label>
                      <Select
                        value={dashboard.type}
                        onValueChange={(value) => 
                          setDashboard(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Export & Share</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={exportDashboard}>
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                    
                    <ShareDialog
                      dashboardId={dashboard.id || ''}
                      dashboardName={dashboard.name}
                      shareSettings={shareSettings}
                      onSettingsChange={setShareSettings}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Page Tabs */}
            <div className="flex items-center gap-1">
              {dashboard.pages.map((page, index) => (
                <Button
                  key={page.id}
                  variant={index === selectedPageIndex ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPageIndex(index)}
                  className="relative"
                >
                  {page.name}
                  {dashboard.pages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                    >
                      ×
                    </Button>
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addNewPage}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm min-w-[3rem] text-center">{zoomLevel}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-muted/30">
          <div
            ref={canvasRef}
            className={`relative mx-auto bg-background shadow-lg transition-all duration-200 ${
              viewMode === 'desktop' ? 'w-full max-w-[1200px]' :
              viewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
            }`}
            style={{
              minHeight: '800px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => setSelectedVisualization(null)}
          >
            {/* Grid */}
            {!isPreviewMode && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
              />
            )}

            {/* Filters */}
            {currentPage?.filters && currentPage.filters.length > 0 && (
              <div className="p-4 border-b border-border">
                <FilterPanel
                  filters={currentPage.filters}
                  onFilterChange={() => {}}
                  onFilterRemove={() => {}}
                  onClearAll={() => {}}
                />
              </div>
            )}

            {/* Visualizations */}
            {currentPage?.visualizations.map((viz) => (
              <div
                key={viz.id}
                className={`absolute cursor-move group ${
                  selectedVisualization === viz.id ? 'ring-2 ring-primary' : ''
                } ${isPreviewMode ? 'cursor-default' : ''}`}
                style={{
                  left: viz.x,
                  top: viz.y,
                  width: viz.width,
                  height: viz.height,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleVizDragStart(e, viz.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVisualization(viz.id);
                }}
              >
                <VisualizationRenderer
                  id={viz.id}
                  type={viz.type}
                  title={viz.name}
                  config={viz.config}
                  data={viz.data}
                  style={viz.style}
                  isSelected={selectedVisualization === viz.id}
                  onClick={() => setSelectedVisualization(viz.id)}
                />

                {/* Resize Handles */}
                {!isPreviewMode && selectedVisualization === viz.id && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary cursor-nw-resize" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary cursor-ne-resize" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary cursor-sw-resize" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary cursor-se-resize" />
                  </>
                )}

                {/* Action Buttons */}
                {!isPreviewMode && selectedVisualization === viz.id && (
                  <div className="absolute -top-8 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateVisualization(viz.id);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVisualization(viz.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {currentPage?.visualizations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Start Building Your Dashboard</p>
                  <p className="text-sm">Drag visualizations from the sidebar or click the + buttons</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      {showPropertiesPanel && selectedViz && !isPreviewMode && (
        <div className="w-80 border-l border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">Properties</h3>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Basic Properties */}
              <div>
                <h4 className="font-medium mb-3">Basic</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={selectedViz.name}
                      onChange={(e) => updateVisualization(selectedViz.id, { name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={selectedViz.width}
                        onChange={(e) => updateVisualization(selectedViz.id, { width: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={selectedViz.height}
                        onChange={(e) => updateVisualization(selectedViz.id, { height: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>X Position</Label>
                      <Input
                        type="number"
                        value={selectedViz.x}
                        onChange={(e) => updateVisualization(selectedViz.id, { x: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Y Position</Label>
                      <Input
                        type="number"
                        value={selectedViz.y}
                        onChange={(e) => updateVisualization(selectedViz.id, { y: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Customization */}
              {['bar', 'line', 'area', 'pie'].includes(selectedViz.type) && (
                <div>
                  <h4 className="font-medium mb-3">Chart Style</h4>
                  <ChartCustomization
                    chartType={selectedViz.type}
                    style={selectedViz.style || {}}
                    onStyleChange={(newStyle) => updateVisualization(selectedViz.id, { style: newStyle })}
                  />
                </div>
              )}

              {/* Type-specific Configuration */}
              <div>
                <h4 className="font-medium mb-3">Configuration</h4>
                <div className="space-y-3">
                  {selectedViz.type === 'text' && (
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={selectedViz.config?.content || ''}
                        onChange={(e) => updateVisualization(selectedViz.id, {
                          config: { ...selectedViz.config, content: e.target.value }
                        })}
                        rows={4}
                      />
                    </div>
                  )}
                  
                  {selectedViz.type === 'kpi' && (
                    <>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={selectedViz.config?.title || ''}
                          onChange={(e) => updateVisualization(selectedViz.id, {
                            config: { ...selectedViz.config, title: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          type="number"
                          value={selectedViz.config?.value || 0}
                          onChange={(e) => updateVisualization(selectedViz.id, {
                            config: { ...selectedViz.config, value: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedViz.type === 'image' && (
                    <>
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={selectedViz.config?.src || ''}
                          onChange={(e) => updateVisualization(selectedViz.id, {
                            config: { ...selectedViz.config, src: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Alt Text</Label>
                        <Input
                          value={selectedViz.config?.alt || ''}
                          onChange={(e) => updateVisualization(selectedViz.id, {
                            config: { ...selectedViz.config, alt: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}
                  
                  {['bar', 'line', 'area'].includes(selectedViz.type) && (
                    <>
                      <div>
                        <Label>Data Key</Label>
                        <Input
                          value={selectedViz.config?.dataKey || ''}
                          onChange={(e) => updateVisualization(selectedViz.id, {
                            config: { ...selectedViz.config, dataKey: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>X Axis Key</Label>
                        <Input
                          value={selectedViz.config?.xAxisKey || ''}
                          onChange={(e) => updateVisualization(selectedViz.id, {
                            config: { ...selectedViz.config, xAxisKey: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}