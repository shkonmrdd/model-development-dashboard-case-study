"use client";

import { IconSearch } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sortOptions,
  typeOptions,
  type SortOption,
} from "@/components/projects/constants";
import type { ProjectTypeFilter } from "@/components/projects/use-filters";

const searchPlaceholder = "Search project, owner, dept\u2026";

type ProjectToolbarProps = {
  typeFilter: ProjectTypeFilter;
  sortFilter: SortOption;
  query: string;
  onTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onQueryChange: (value: string) => void;
};

export function ProjectToolbar({
  typeFilter,
  sortFilter,
  query,
  onTypeChange,
  onSortChange,
  onQueryChange,
}: ProjectToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="all">All types</SelectItem>
            {typeOptions.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortFilter} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[190px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent align="start">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full md:max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 pl-9"
        />
      </div>
    </div>
  );
}
