import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  Globe, 
  Settings, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'building' | 'failed' | 'pending';
  lastDeployed: string;
  version: string;
  environment: 'production' | 'staging' | 'development';
}

const DeploymentCenter: React.FC = () => {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  const deployments: Deployment[] = [
    {
      id: '1',
      name: 'Chavan Hero Production',
      url: 'https://chavan-hero.com',
      status: 'active',
      lastDeployed: '2024-01-15 14:30',
      version: 'v1.2.0',
      environment: 'production'
    },
    {
      id: '2',
      name: 'Staging Environment',
      url: 'https://staging.chavan-hero.com',
      status: 'active',
      lastDeployed: '2024-01-15 12:15',
      version: 'v1.2.1-beta',
      environment: 'staging'
    },
    {
      id: '3',
      name: 'Development Build',
      url: 'https://dev.chavan-hero.com',
      status: 'building',
      lastDeployed: '2024-01-15 16:45',
      version: 'v1.3.0-dev',
      environment: 'development'
    }
  ];

  const handleDeploy = async (environment: string) => {
    setIsDeploying(true);
    setDeployProgress(0);

    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDeploying(false);
          toast({
            title: 'Deployment Successful',
            description: `Successfully deployed to ${environment}`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'URL has been copied to your clipboard',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'building':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'building':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployment Center</h1>
          <p className="text-muted-foreground">Manage and deploy your dashboards</p>
        </div>
        <Button onClick={() => handleDeploy('production')} disabled={isDeploying}>
          <Rocket className="h-4 w-4 mr-2" />
          {isDeploying ? 'Deploying...' : 'Deploy Now'}
        </Button>
      </div>

      {isDeploying && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Deployment in Progress
            </CardTitle>
            <CardDescription>
              Your dashboard is being deployed to production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{deployProgress}%</span>
              </div>
              <Progress value={deployProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="deployments" className="w-full">
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="domains">Custom Domains</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <div className="grid gap-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <CardTitle className="text-lg">{deployment.name}</CardTitle>
                        <CardDescription>{deployment.url}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                      <Badge variant="outline">{deployment.version}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Last deployed: {deployment.lastDeployed}</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`} />
                        <span className="capitalize">{deployment.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(deployment.url)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(deployment.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit
                      </Button>
                      <Button size="sm" variant="secondary">
                        Redeploy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
              <CardDescription>
                Configure your deployment preferences and build settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="build-command">Build Command</Label>
                  <Input
                    id="build-command"
                    placeholder="npm run build"
                    defaultValue="npm run build"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output-directory">Output Directory</Label>
                  <Input
                    id="output-directory"
                    placeholder="dist"
                    defaultValue="dist"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="node-version">Node.js Version</Label>
                <Input
                  id="node-version"
                  placeholder="18.x"
                  defaultValue="18.x"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h4 className="font-medium">Auto-deploy</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically deploy when changes are pushed to main branch
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domains</CardTitle>
              <CardDescription>
                Connect your custom domain to your deployed dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input placeholder="your-domain.com" />
                <Button>Add Domain</Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4" />
                    <span>chavan-hero.com</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4" />
                    <span>dashboard.example.com</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentCenter;