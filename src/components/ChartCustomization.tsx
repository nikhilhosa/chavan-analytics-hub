import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Palette, Settings, Eye, Grid, Type } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export interface ChartStyle {
  colors: string[];
  gridLines: boolean;
  legend: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  axes: {
    showX: boolean;
    showY: boolean;
    xLabel?: string;
    yLabel?: string;
  };
  title: {
    show: boolean;
    text?: string;
    fontSize: number;
  };
  animation: boolean;
  opacity: number;
}

interface ChartCustomizationProps {
  chartType: string;
  style: ChartStyle;
  onStyleChange: (updates: Partial<ChartStyle>) => void;
  className?: string;
}

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export const ChartCustomization: React.FC<ChartCustomizationProps> = ({
  chartType,
  style,
  onStyleChange,
  className = ''
}) => {
  const updateStyle = (key: keyof ChartStyle, value: any) => {
    onStyleChange({ [key]: value });
  };

  const updateNestedStyle = (parent: keyof ChartStyle, key: string, value: any) => {
    const currentValue = style[parent] as any;
    onStyleChange({
      [parent]: {
        ...currentValue,
        [key]: value
      }
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors & Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Color Scheme</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {DEFAULT_COLORS.map((color, index) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const newColors = [...style.colors];
                    newColors[index % newColors.length] = color;
                    updateStyle('colors', newColors);
                  }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <Label>Chart Opacity</Label>
            <div className="mt-2">
              <Slider
                value={[style.opacity * 100]}
                onValueChange={([value]) => updateStyle('opacity', value / 100)}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(style.opacity * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Title & Labels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={style.title.show}
              onCheckedChange={(checked) => updateNestedStyle('title', 'show', checked)}
            />
            <Label>Show Title</Label>
          </div>
          
          {style.title.show && (
            <>
              <div>
                <Label>Title Text</Label>
                <Input
                  value={style.title.text || ''}
                  onChange={(e) => updateNestedStyle('title', 'text', e.target.value)}
                  placeholder="Enter chart title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Title Size</Label>
                <Slider
                  value={[style.title.fontSize]}
                  onValueChange={([value]) => updateNestedStyle('title', 'fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {style.title.fontSize}px
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={style.axes.showX}
                onCheckedChange={(checked) => updateNestedStyle('axes', 'showX', checked)}
              />
              <Label>Show X Axis</Label>
            </div>
            
            {style.axes.showX && (
              <div>
                <Label>X Axis Label</Label>
                <Input
                  value={style.axes.xLabel || ''}
                  onChange={(e) => updateNestedStyle('axes', 'xLabel', e.target.value)}
                  placeholder="X axis label"
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={style.axes.showY}
                onCheckedChange={(checked) => updateNestedStyle('axes', 'showY', checked)}
              />
              <Label>Show Y Axis</Label>
            </div>
            
            {style.axes.showY && (
              <div>
                <Label>Y Axis Label</Label>
                <Input
                  value={style.axes.yLabel || ''}
                  onChange={(e) => updateNestedStyle('axes', 'yLabel', e.target.value)}
                  placeholder="Y axis label"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Layout & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={style.legend.show}
              onCheckedChange={(checked) => updateNestedStyle('legend', 'show', checked)}
            />
            <Label>Show Legend</Label>
          </div>
          
          {style.legend.show && (
            <div>
              <Label>Legend Position</Label>
              <Select
                value={style.legend.position}
                onValueChange={(value) => updateNestedStyle('legend', 'position', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={style.gridLines}
              onCheckedChange={(checked) => updateStyle('gridLines', checked)}
            />
            <Label>Show Grid Lines</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={style.animation}
              onCheckedChange={(checked) => updateStyle('animation', checked)}
            />
            <Label>Enable Animations</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const getDefaultChartStyle = (): ChartStyle => ({
  colors: DEFAULT_COLORS.slice(0, 5),
  gridLines: true,
  legend: {
    show: true,
    position: 'bottom'
  },
  axes: {
    showX: true,
    showY: true,
    xLabel: '',
    yLabel: ''
  },
  title: {
    show: false,
    text: '',
    fontSize: 16
  },
  animation: true,
  opacity: 1
});