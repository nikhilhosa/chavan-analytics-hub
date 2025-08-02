import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  Calendar,
  Eye,
  MoreVertical,
  Share2,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';
import { Dashboard } from '@/hooks/useDashboards';

interface DashboardCardProps {
  dashboard: Dashboard;
  onView: (dashboard: Dashboard) => void;
  onEdit: (dashboard: Dashboard) => void;
  onDelete: (dashboard: Dashboard) => void;
  onDuplicate: (dashboard: Dashboard) => void;
  onShare: (dashboard: Dashboard) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  dashboard,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'service':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {dashboard.name}
              </CardTitle>
              {dashboard.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {dashboard.description}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(dashboard)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(dashboard)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(dashboard)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(dashboard)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(dashboard)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(dashboard.type)}>
              {dashboard.type.charAt(0).toUpperCase() + dashboard.type.slice(1)}
            </Badge>
            {dashboard.is_public && (
              <Badge variant="outline">Public</Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(dashboard.updated_at)}
          </div>
        </div>
        <div className="mt-4">
          <Button 
            onClick={() => onView(dashboard)}
            className="w-full"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Open Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;