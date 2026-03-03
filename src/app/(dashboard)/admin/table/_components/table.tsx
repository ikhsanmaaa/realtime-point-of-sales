"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_MANAGEMENT } from "@/constants/table-constant";
import useDataTable from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";
import { Table } from "@/validations/table-validation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DialogCreateTable from "./dialog-create-table";
import DialogUpdateTable from "./dialog-update-table";
import DialogDeleteTable from "./dialog-delete-table";
import { supabaseDefault } from "@/lib/supabase/default";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableMap from "./table-map";
import { useAuthStore } from "@/stores/auth-store";

export default function TableManagement() {
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangeLimit,
    handleChangePage,
    handleChangeSearch,
  } = useDataTable();

  const profile = useAuthStore((state) => state.profile);

  const {
    data: tables,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tables", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabaseDefault
        .from("tables")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("name", { ascending: true });

      if (currentSearch) {
        query.or(
          `name.ilike.%${currentSearch}%,status.ilike.%${currentSearch}%`,
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Tables data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: Table;
    type: "update" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const filterData = useMemo(() => {
    return (tables?.data || []).map((table: Table, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div>
          <h4 className="font-bold">{table.name}</h4>
          <p className="text-xs">{table.description}</p>
        </div>,
        table.capacity,
        <div
          className={cn("px-2 py-1 rounded-full text-white w-fit capitalize", {
            "bg-green-500": table.status === "available",
            "bg-amber-500": table.status === "reserved",
            "bg-red-500": table.status === "unavailable",
          })}
        >
          {table.status}
        </div>,
        <DropdownAction
          menu={[
            {
              label: (
                <span className="flex item-center gap-2">
                  <Pencil />
                  Edit
                </span>
              ),
              action: () => {
                setSelectedAction({
                  data: table,
                  type: "update",
                });
              },
            },
            {
              label: (
                <span className="flex item-center gap-2">
                  <Trash2 className="text-red-400" />
                  Delete
                </span>
              ),
              variant: "destructive",
              action: () => {
                setSelectedAction({
                  data: table,
                  type: "delete",
                });
              },
            },
          ]}
        />,
      ];
    });
  }, [tables]);

  const totalPages = useMemo(() => {
    return tables && tables.count !== null
      ? Math.ceil(tables.count / currentLimit)
      : 0;
  }, [tables]);

  const { data: tables1stFloor, refetch: refetch1st } = useQuery({
    queryKey: ["tables-1st-floor"],
    queryFn: async () => {
      const result = await supabaseDefault
        .from("tables")
        .select("*")
        .eq("floor", "1F");

      return result.data;
    },
  });

  const { data: tables2ndFloor, refetch: refetch2nd } = useQuery({
    queryKey: ["tables-2nd-floor"],
    queryFn: async () => {
      const result = await supabaseDefault
        .from("tables")
        .select("*")
        .eq("floor", "2F");

      return result.data;
    },
  });

  useEffect(() => {
    const channel = supabaseDefault
      .channel("change-table")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
        },
        () => {
          refetch();
          refetch1st();
          refetch2nd();
        },
      )
      .subscribe();

    return () => {
      supabaseDefault.removeChannel(channel);
    };
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="list">
        <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
          <h1 className="text-2xl font-bold">Table Management</h1>
          <TabsList>
            <TabsTrigger value="list">Table List</TabsTrigger>
            <TabsTrigger value="1st" hidden={profile.role !== "admin"}>
              Table 1st Floor
            </TabsTrigger>
            <TabsTrigger value="2nd" hidden={profile.role !== "admin"}>
              Table 2nd Floor
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or status"
              onChange={(e) => handleChangeSearch(e.target.value)}
              className="max-w-64 justify-between mb-4"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create</Button>
              </DialogTrigger>
              <DialogCreateTable refetch={refetch} />
            </Dialog>
          </div>
          <DataTable
            header={HEADER_TABLE_MANAGEMENT}
            isLoading={isLoading}
            data={filterData}
            totalPages={totalPages}
            currentPage={currentPage}
            currentLimit={currentLimit}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
          />
          <DialogUpdateTable
            open={selectedAction !== null && selectedAction.type === "update"}
            refetch={refetch}
            currentData={selectedAction?.data}
            handleChangeAction={handleChangeAction}
          />
          <DialogDeleteTable
            open={selectedAction !== null && selectedAction.type === "delete"}
            refetch={refetch}
            currentData={selectedAction?.data}
            handleChangeAction={handleChangeAction}
          />
        </TabsContent>
        <TabsContent value="1st">
          <TableMap tables={tables1stFloor || []} />
        </TabsContent>
        <TabsContent value="2nd">
          <TableMap tables={tables2ndFloor || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
