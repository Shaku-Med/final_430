"use client";

import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  CalendarIcon,
  Check,
  Clock,
  Star,
  Users,
  Trash,
  X
} from "lucide-react";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilterState } from "../ChatSidebar";

interface FilterPanelProps {
  activeFilters: FilterState;
  handleFilterChange: (filterName: keyof FilterState, value: any) => void;
  resetFilters: () => void;
}

export function FilterPanel({ 
  activeFilters, 
  handleFilterChange, 
  resetFilters 
}: FilterPanelProps): JSX.Element {
  const [dateRange, setDateRange] = useState<string>("all");
  
  const handleDateRangeChange = (value: string): void => {
    setDateRange(value);
    handleFilterChange("date", value);
  };
  
  return (
    <Card className="border rounded-lg">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-xs h-7"
            >
              Reset
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={activeFilters.unread ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFilterChange("unread", !activeFilters.unread)}
              >
                Unread
              </Badge>
              <Badge 
                variant={activeFilters.recent ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFilterChange("recent", !activeFilters.recent)}
              >
                Recent
              </Badge>
              <Badge 
                variant={activeFilters.favorites ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFilterChange("favorites", !activeFilters.favorites)}
              >
                Favorites
              </Badge>
            </div>
            
            <div>
              <Select onValueChange={handleDateRangeChange} value={dateRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeArchived"
                  onCheckedChange={(checked) => handleFilterChange("archived", checked)}
                />
                <Label htmlFor="includeArchived">Include archived</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="onlyShared"
                  onCheckedChange={(checked) => handleFilterChange("shared", checked)}
                />
                <Label htmlFor="onlyShared">Only shared with me</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}