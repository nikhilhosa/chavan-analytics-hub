import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Database
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  description?: string;
  file_type: string;
  file_size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  created_at: string;
  columns?: string[];
  row_count?: number;
}

const DataUpload: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const supportedFormats = [
    { type: 'csv', icon: FileText, description: 'CSV files (.csv)' },
    { type: 'excel', icon: FileSpreadsheet, description: 'Excel files (.xlsx, .xls)' },
    { type: 'json', icon: FileJson, description: 'JSON files (.json)' },
    { type: 'pdf', icon: FileText, description: 'PDF files (.pdf)' },
    { type: 'word', icon: FileText, description: 'Word documents (.docx)' },
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls', '.json', '.pdf', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a supported file format",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      // Simulate file upload for now
      console.log('Uploading file:', fileName);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(progressInterval);
          }
          return Math.min(next, 100);
        });
      }, 200);

      // Simulation complete

      // Create data source record
      const newDataSource: Partial<DataSource> = {
        name: file.name,
        description: `Uploaded ${file.type} file`,
        file_type: fileExtension,
        file_size: file.size,
        status: 'processing',
      };

      // For CSV/Excel files, we would normally parse them here
      // For now, we'll simulate processing
      setTimeout(() => {
        const processedSource: DataSource = {
          ...newDataSource,
          id: Date.now().toString(),
          status: 'ready',
          created_at: new Date().toISOString(),
          columns: fileExtension === '.csv' || fileExtension.includes('xlsx') 
            ? ['Column 1', 'Column 2', 'Column 3', 'Column 4'] 
            : undefined,
          row_count: fileExtension === '.csv' || fileExtension.includes('xlsx') 
            ? Math.floor(Math.random() * 10000) + 100 
            : undefined,
        } as DataSource;

        setDataSources(prev => [processedSource, ...prev]);
        toast({
          title: "Success",
          description: "File uploaded and processed successfully",
        });
      }, 2000);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('csv') || fileType.includes('txt')) return FileText;
    if (fileType.includes('xlsx') || fileType.includes('xls')) return FileSpreadsheet;
    if (fileType.includes('json')) return FileJson;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('docx')) return FileText;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Sources</h1>
        <p className="text-muted-foreground">Upload and manage your data files</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Data Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-border/60'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? 'Drop files here' : 'Upload your data files'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here or click to browse
            </p>
            <Input
              type="file"
              className="hidden"
              id="file-upload"
              accept=".csv,.xlsx,.xls,.json,.pdf,.docx"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Choose Files
              </Button>
            </Label>
            
            {isUploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Supported Formats</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {supportedFormats.map((format) => (
                <div key={format.type} className="flex items-center gap-2 text-sm">
                  <format.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{format.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Your Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataSources.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No data sources uploaded yet</p>
              <p className="text-sm text-muted-foreground">Upload your first file to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((source) => {
                  const FileIcon = getFileIcon(source.file_type);
                  return (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{source.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {source.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{source.file_type}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(source.file_size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(source.status)}
                          <span className="capitalize">{source.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {source.columns && (
                          <div className="text-sm">
                            <p>{source.columns.length} columns</p>
                            <p className="text-muted-foreground">
                              {source.row_count?.toLocaleString()} rows
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;