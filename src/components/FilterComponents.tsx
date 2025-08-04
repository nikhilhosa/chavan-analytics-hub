import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Button } from '@/components/ui/button';
import { Calendar, Filter, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

export interface FilterConfig {
  id: string;
  type: 'dropdown' | 'text' | 'dateRange' | 'number';
  label: string;
  field: string;
  options?: string[];
  value?: any;
  min?: number;
  max?: number;
}

interface FilterComponentProps {
  config: FilterConfig;
  onChange: (filterId: string, value: any) => void;
  onRemove?: (filterId: string) => void;
  className?: string;
}

export const FilterComponent: React.FC<FilterComponentProps> = ({
  config,
  onChange,
  onRemove,
  className = ''
}) => {
  const handleValueChange = (value: any) => {
    onChange(config.id, value);
  };

  const renderFilterInput = () => {
    switch (config.type) {
      case 'dropdown':
        return (
          <Select value={config.value || ''} onValueChange={handleValueChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${config.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {config.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
        return (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${config.label}`}
              value={config.value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              className="pl-8"
            />
          </div>
        );

      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={config.value?.min || ''}
              onChange={(e) => handleValueChange({ ...config.value, min: e.target.value })}
              min={config.min}
              max={config.max}
            />
            <Input
              type="number"
              placeholder="Max"
              value={config.value?.max || ''}
              onChange={(e) => handleValueChange({ ...config.value, max: e.target.value })}
              min={config.min}
              max={config.max}
            />
          </div>
        );

      case 'dateRange':
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {config.value?.from ? format(config.value.from, 'PPP') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={config.value?.from}
                  onSelect={(date) => handleValueChange({ ...config.value, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {config.value?.to ? format(config.value.to, 'PPP') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={config.value?.to}
                  onSelect={(date) => handleValueChange({ ...config.value, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`filter-component ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {config.label}
          </CardTitle>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(config.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderFilterInput()}
      </CardContent>
    </Card>
  );
};

interface FilterPanelProps {
  filters: FilterConfig[];
  onFilterChange: (filterId: string, value: any) => void;
  onFilterRemove: (filterId: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onFilterRemove,
  onClearAll,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {filters.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>
      
      {filters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No filters added yet</p>
          <p className="text-xs">Add filters to interact with your visualizations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filters.map((filter) => (
            <FilterComponent
              key={filter.id}
              config={filter}
              onChange={onFilterChange}
              onRemove={onFilterRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FILTER_TYPES = [
  { id: 'dropdown', name: 'Dropdown', icon: Filter },
  { id: 'text', name: 'Text Search', icon: Search },
  { id: 'dateRange', name: 'Date Range', icon: Calendar },
  { id: 'number', name: 'Number Range', icon: Filter },
];