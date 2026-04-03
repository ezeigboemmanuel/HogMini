/* eslint-disable react-hooks/incompatible-library */
"use client";
"use no memo";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, Tag, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FeatureFlagRow = {
  key: string;
  name: string;
  type: string;
  status: "enabled" | "disabled";
  tags: string[];
  value: string;
  lastModified: string;
  owner: string;
};

export function FeatureFlagsTable() {
  const [globalSearch, setGlobalSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [sortBy, setSortBy] = useState("last_modified_desc");

  const data = useMemo<FeatureFlagRow[]>(() => [], []);

  const columns = useMemo<ColumnDef<FeatureFlagRow>[]>(
    () => [
      {
        accessorKey: "key",
        header: "Flag key",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "type",
        header: "Type badge",
      },
      {
        accessorKey: "status",
        header: "Status toggle",
      },
      {
        accessorKey: "tags",
        header: "Tags",
      },
      {
        accessorKey: "lastModified",
        header: "Last modified",
      },
      {
        accessorKey: "owner",
        header: "Owner",
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([{ id: "lastModified", desc: true }]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: globalSearch },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const query = String(filterValue).toLowerCase();
      const key = String(row.original.key || "").toLowerCase();
      const name = String(row.original.name || "").toLowerCase();
      return key.includes(query) || name.includes(query);
    },
  });

  const applySort = (value: string) => {
    setSortBy(value);
    if (value === "last_modified_desc") setSorting([{ id: "lastModified", desc: true }]);
    if (value === "name_asc") setSorting([{ id: "name", desc: false }]);
    if (value === "key_asc") setSorting([{ id: "key", desc: false }]);
    if (value === "owner_asc") setSorting([{ id: "owner", desc: false }]);
  };

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-lg border border-border/70">
      <div className="border-b border-border/70 bg-linear-to-r from-muted/50 via-background to-background px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Feature Flags</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by key or name"
              value={globalSearch}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full min-w-0 justify-between">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Tag className="size-4" />
                  <span className="truncate text-left">{tagSearch ? `Tags: ${tagSearch}` : "Tags"}</span>
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <DropdownMenuLabel>Tags</DropdownMenuLabel>
              <div className="px-2 pb-2">
                <Input
                  placeholder="Search tags"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full min-w-0 justify-between">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Users className="size-4" />
                  <span className="truncate text-left">{userSearch ? `Users: ${userSearch}` : "Users"}</span>
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <DropdownMenuLabel>Users</DropdownMenuLabel>
              <div className="px-2 pb-2">
                <Input
                  placeholder="Search users"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full min-w-0 justify-between">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="size-4" />
                  Value filter
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <DropdownMenuLabel>Filter by value</DropdownMenuLabel>
              <div className="px-2 pb-2">
                <Input
                  placeholder="Enter value"
                  value={valueSearch}
                  onChange={(e) => setValueSearch(e.target.value)}
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="any">Any</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="enabled">Enabled</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full min-w-0 justify-between">
                <span className="inline-flex items-center gap-2">
                  <ArrowUpDown className="size-4" />
                  {sortBy === "last_modified_desc" && "Last modified"}
                  {sortBy === "name_asc" && "Name"}
                  {sortBy === "key_asc" && "Flag key"}
                  {sortBy === "owner_asc" && "Owner"}
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={applySort}>
                <DropdownMenuRadioItem value="last_modified_desc">
                  Last modified (newest)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_asc">Name (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="key_asc">Flag key (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="owner_asc">Owner (A-Z)</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-b-2xl">
        <Table className="w-full">
          <TableHeader className="bg-muted/35 align-top">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-4 whitespace-normal">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-4 py-16 text-center">
                  <p className="text-sm font-normal text-foreground">No feature flag created yet</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
