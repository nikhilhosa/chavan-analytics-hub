import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  FileSpreadsheet, 
  Database,
  CheckCircle,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface FileUploadZoneProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls', '.json'],
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const getFileIcon = (type: string) => {
    if (type.includes('csv') || type.includes('sheet')) {
      return FileSpreadsheet;
    }
    if (type.includes('json')) {
      return Database;
    }
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = Date.now().toString();
    const fileName = `${user?.id}/${fileId}_${file.name}`;
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    };

    setFiles(prev => [...prev, uploadedFile]);

    try {
      const { data, error } = await supabase.storage
        .from('data-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('data-uploads')
        .getPublicUrl(fileName);

      const successFile: UploadedFile = {
        ...uploadedFile,
        status: 'success',
        progress: 100,
        url: urlData.publicUrl,
      };

      setFiles(prev => prev.map(f => f.id === fileId ? successFile : f));
      return successFile;

    } catch (error) {
      console.error('Upload error:', error);
      const errorFile: UploadedFile = {
        ...uploadedFile,
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      };

      setFiles(prev => prev.map(f => f.id === fileId ? errorFile : f));
      return errorFile;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length + files.length > maxFiles) {
      toast({
        title: "Error",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxFileSize) {
        toast({
          title: "Error",
          description: `File ${file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const uploadPromises = validFiles.map(uploadFile);
    const uploadedFiles = await Promise.all(uploadPromises);
    
    const successfulFiles = uploadedFiles.filter(f => f.status === 'success');
    if (successfulFiles.length > 0) {
      onFilesUploaded?.(successfulFiles);
      toast({
        title: "Success",
        description: `${successfulFiles.length} file(s) uploaded successfully`,
      });
    }
  }, [user, files.length, maxFiles, maxFileSize, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
    },
    maxFiles,
    maxSize: maxFileSize,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = async (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (!fileToRetry) return;

    // We would need to store the original File object to retry
    // For now, just show a message
    toast({
      title: "Info",
      description: "Please re-upload the file",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Upload your data files'}
              </h3>
              <p className="text-muted-foreground">
                Drag and drop files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: {acceptedFileTypes.join(', ')} • Max {formatFileSize(maxFileSize)} per file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{file.name}</p>
                        <Badge
                          variant={
                            file.status === 'success' ? 'default' :
                            file.status === 'error' ? 'destructive' : 'secondary'
                          }
                        >
                          {file.status === 'uploading' && (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                              Uploading
                            </div>
                          )}
                          {file.status === 'success' && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Uploaded
                            </div>
                          )}
                          {file.status === 'error' && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Failed
                            </div>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                      {file.status === 'error' && file.error && (
                        <p className="text-sm text-destructive mt-1">{file.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {file.status === 'success' && file.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {file.status === 'error' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryUpload(file.id)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadZone;