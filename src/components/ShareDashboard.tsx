import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Share2, Copy, Link, Mail, Globe, Lock, Users, Eye } from 'lucide-react';

export interface ShareSettings {
  isPublic: boolean;
  allowEmbedding: boolean;
  accessLevel: 'view' | 'edit' | 'admin';
  sharedUsers: Array<{
    email: string;
    role: 'viewer' | 'editor' | 'admin';
  }>;
  expiresAt?: Date;
}

interface ShareDashboardProps {
  dashboardId: string;
  dashboardName: string;
  shareSettings: ShareSettings;
  onSettingsChange: (settings: ShareSettings) => void;
  className?: string;
}

export const ShareDashboard: React.FC<ShareDashboardProps> = ({
  dashboardId,
  dashboardName,
  shareSettings,
  onSettingsChange,
  className = ''
}) => {
  const [shareUrl, setShareUrl] = useState(`${window.location.origin}/dashboard/${dashboardId}`);
  const [embedCode, setEmbedCode] = useState(
    `<iframe src="${window.location.origin}/embed/dashboard/${dashboardId}" width="800" height="600" frameborder="0"></iframe>`
  );
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const addUser = () => {
    if (!newUserEmail.trim()) return;
    
    const updatedUsers = [
      ...shareSettings.sharedUsers,
      { email: newUserEmail.trim(), role: newUserRole }
    ];
    
    onSettingsChange({
      ...shareSettings,
      sharedUsers: updatedUsers
    });
    
    setNewUserEmail('');
    setNewUserRole('viewer');
  };

  const removeUser = (email: string) => {
    const updatedUsers = shareSettings.sharedUsers.filter(user => user.email !== email);
    onSettingsChange({
      ...shareSettings,
      sharedUsers: updatedUsers
    });
  };

  const updateUserRole = (email: string, role: 'viewer' | 'editor' | 'admin') => {
    const updatedUsers = shareSettings.sharedUsers.map(user =>
      user.email === email ? { ...user, role } : user
    );
    onSettingsChange({
      ...shareSettings,
      sharedUsers: updatedUsers
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={shareSettings.isPublic}
              onCheckedChange={(checked) => 
                onSettingsChange({ ...shareSettings, isPublic: checked })
              }
            />
            <div className="flex-1">
              <Label className="flex items-center gap-2">
                {shareSettings.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                Make dashboard public
              </Label>
              <p className="text-xs text-muted-foreground">
                {shareSettings.isPublic 
                  ? 'Anyone with the link can view this dashboard'
                  : 'Only invited users can access this dashboard'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={shareSettings.allowEmbedding}
              onCheckedChange={(checked) => 
                onSettingsChange({ ...shareSettings, allowEmbedding: checked })
              }
            />
            <Label>Allow embedding</Label>
          </div>
        </CardContent>
      </Card>

      {shareSettings.isPublic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Public Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Share URL</Label>
              <div className="flex gap-2 mt-1">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareUrl, 'Share URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {shareSettings.allowEmbedding && (
              <div>
                <Label>Embed Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={embedCode} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(embedCode, 'Embed code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invited Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addUser} disabled={!newUserEmail.trim()}>
              <Mail className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            {shareSettings.sharedUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users invited yet</p>
                <p className="text-xs">Add users to collaborate on this dashboard</p>
              </div>
            ) : (
              shareSettings.sharedUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(value: any) => updateUserRole(user.email, value)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUser(user.email)}
                      className="h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ShareDialogProps {
  dashboardId: string;
  dashboardName: string;
  shareSettings: ShareSettings;
  onSettingsChange: (settings: ShareSettings) => void;
  trigger?: React.ReactNode;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  dashboardId,
  dashboardName,
  shareSettings,
  onSettingsChange,
  trigger
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{dashboardName}"</DialogTitle>
        </DialogHeader>
        <ShareDashboard
          dashboardId={dashboardId}
          dashboardName={dashboardName}
          shareSettings={shareSettings}
          onSettingsChange={onSettingsChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export const getDefaultShareSettings = (): ShareSettings => ({
  isPublic: false,
  allowEmbedding: false,
  accessLevel: 'view',
  sharedUsers: []
});