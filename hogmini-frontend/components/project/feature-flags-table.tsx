/* eslint-disable react-hooks/exhaustive-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
"use client";
"use no memo";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  Users,
  MoreHorizontal,
  Copy,
  Check,
  User,
  Power,
  Edit2,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { withApi } from "@/lib/api";
import { toast } from "sonner";
import EditFlagDialog from "./edit-flag-dialog";
import { cn, getColorForString, getInitials } from "@/lib/utils";

export type FeatureFlagRow = {
  id: string;
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  creator?: {
    id: string;
    name: string;
    image?: string;
    email?: string;
  };
};

import { useProject } from "@/app/contexts/ProjectContext";

export function FeatureFlagsTable({
  projectId,
  refTable
}: {
  projectId: string;
  refTable?: (ref: (isInitial?: boolean) => void) => void;
}) {
  const { selectedEnvironment } = useProject();
  const [data, setData] = useState<FeatureFlagRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [sortBy, setSortBy] = useState("last_modified_desc");

  const [editFlag, setEditFlag] = useState<FeatureFlagRow | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState<FeatureFlagRow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchFlags = useCallback(async (isInitial = false) => {
    if (!selectedEnvironment?.id) return;
    if (isInitial) {
      console.time(`Frontend: Fetch Flags [${selectedEnvironment.name}]`);
      setIsLoading(true);
    }
    try {
      const res = await fetch(withApi(`/api/projects/${projectId}/flags?environmentId=${selectedEnvironment.id}&t=${Date.now()}`), {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.flags || []);
        if (isInitial) console.timeEnd(`Frontend: Fetch Flags [${selectedEnvironment.name}]`);
      }
    } catch (e) {
      console.error("Failed to fetch flags", e);
      // toast.error("Failed to load feature flags");
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [projectId, selectedEnvironment?.id]);

  useEffect(() => {
    fetchFlags(true);
    if (refTable) {
      refTable(() => fetchFlags);
    }
  }, [fetchFlags, refTable, selectedEnvironment?.id]);

  const toggleFlag = async (flagId: string, currentStatus: boolean) => {
    if (!selectedEnvironment?.id) return;
    const newStatus = !currentStatus;
    try {
      const res = await fetch(withApi(`/api/projects/${projectId}/flags/${flagId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isActive: newStatus,
          environmentId: selectedEnvironment.id 
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`Flag ${newStatus ? 'enabled' : 'disabled'} in ${selectedEnvironment.name}`);
        setData(prev => prev.map(f => f.id === flagId ? { ...f, isActive: newStatus } : f));
      } else {
        toast.error("Failed to update flag");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Key copied to clipboard");
  };

  const handleDelete = async () => {
    if (!deleteFlag) return;
    setIsDeleting(true);
    try {
      const res = await fetch(withApi(`/api/projects/${projectId}/flags/${deleteFlag.id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`Flag "${deleteFlag.key}" deleted`);
        setData(prev => prev.filter(f => f.id !== deleteFlag.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Failed to delete flag");
      }
    } catch (e) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<FeatureFlagRow>[]>(
    () => [
      {
        accessorKey: "key",
        header: "Flag key",
        cell: ({ row }) => {
          const key = row.original.key;
          return (
            <div className="flex items-center gap-2 group">
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-foreground truncate">{key}</span>
                {row.original.description && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                    {row.original.description}
                  </span>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(key)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-all"
                title="Copy key"
              >
                {copiedKey === key ? (
                  <Check className="size-3 text-green-600" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          );
        }
      },
      {
        accessorKey: "updatedAt",
        header: "Last modified",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.updatedAt
              ? new Date(row.original.updatedAt).toLocaleDateString()
              : new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        )
      },
      {
        accessorKey: "creator",
        header: "Created by",
        cell: ({ row }) => {
          const creator = row.original.creator;
          const name = creator?.name || "Unknown";
          const email = creator?.email;
          const idForColor = creator?.id || email || "anonymous";

          return (
            <div
              className={cn(
                "flex items-center justify-center size-8 rounded-full border border-border/50 overflow-hidden cursor-help shrink-0",
                !creator?.image && getColorForString(idForColor)
              )}
              title={email || name}
            >
              {creator?.image ? (
                <Image
                  src={creator.image}
                  alt={name}
                  width={32}
                  height={32}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-white">
                  {getInitials(name, email)}
                </span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isActive ? 'text-green-600 bg-green-50/50' : 'text-red-600 bg-red-50/50'
              }`}>
              {isActive ? 'ENABLED' : 'DISABLED'}
            </span>
          );
        }
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const flag = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-8 p-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => toggleFlag(flag.id, flag.isActive)}>
                    <Power className="mr-2 size-4" />
                    {flag.isActive ? 'Disable' : 'Enable'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setEditFlag(flag);
                    setIsEditDialogOpen(true);
                  }}>
                    <Edit2 className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      setDeleteFlag(flag);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
      }
    ],
    [projectId, copiedKey]
  );

  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);

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
      return key.includes(query);
    },
  });

  const applySort = (value: string) => {
    setSortBy(value);
    if (value === "last_modified_desc") setSorting([{ id: "updatedAt", desc: true }]);
    if (value === "key_asc") setSorting([{ id: "key", desc: false }]);
  };

  return (
    <>
      <section className="w-full min-w-0 overflow-hidden rounded-lg border border-border/70">
        <div className="border-b border-border/70 bg-linear-to-r from-muted/50 via-background to-background px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Feature Flags</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-6">
            <div className="relative lg:col-span-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by key"
                value={globalSearch}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>

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
                    Status
                  </span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="any">Any</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="enabled">Enabled</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full min-w-40! justify-between">
                  <span className="inline-flex items-center gap-2">
                    <ArrowUpDown className="size-4" />
                    {sortBy === "last_modified_desc" && "Last modified"}
                    {sortBy === "key_asc" && "Flag key"}
                  </span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={applySort}>
                  <DropdownMenuRadioItem value="last_modified_desc">
                    Last modified (newest)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="key_asc">Flag key (A-Z)</DropdownMenuRadioItem>
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={columns.length} className="px-4 py-8">
                       <div className="h-4 bg-muted/60 rounded w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
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
                    <p className="text-sm font-normal text-foreground">
                      No feature flag created yet
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <EditFlagDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projectId={projectId}
        flag={editFlag}
        onSuccess={fetchFlags}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Feature Flag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the flag <span className="font-semibold text-foreground">"{deleteFlag?.key}"</span>? <br />
              This action cannot be undone and will permanently remove the flag from this project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
