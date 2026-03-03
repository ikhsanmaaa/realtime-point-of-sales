"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_ORDER_MANAGEMENT } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Ban, Link2Icon, Package, ScrollText, Utensils } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { updateReservation } from "../action";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import DialogCreateOrderDineIn from "./dialog-create-order-dine-in";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DialogCreateOrderTakeAway from "./dialog-create-order-take-away";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableMap from "./table-map";
import { supabaseDefault } from "@/lib/supabase/default";

export default function OrderManagement() {
  const profile = useAuthStore((state) => state.profile);

  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangeLimit,
    handleChangePage,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: orders,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabaseDefault
        .from("orders")
        .select(
          `
            id,order_id,customer_name,status,payment_token, tables(name,id)
            `,
          { count: "exact" },
        )
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("updated_at", { ascending: true });

      if (currentSearch) {
        query.or(
          `order_id.ilike.%${currentSearch}%,customer_name.ilike.%${currentSearch}%`,
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Order data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const { data: tables, refetch: refetchTables } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const result = await supabaseDefault
        .from("tables")
        .select("*")
        .order("created_at")
        .order("status");

      return result.data;
    },
  });

  const { data: tables1stFloor } = useQuery({
    queryKey: ["tables-1st-floor"],
    queryFn: async () => {
      const result = await supabaseDefault
        .from("tables")
        .select("*")
        .eq("floor", "1F");

      return result.data;
    },
  });

  const { data: tables2ndFloor } = useQuery({
    queryKey: ["tables-2nd-floor"],
    queryFn: async () => {
      const result = await supabaseDefault
        .from("tables")
        .select("*")
        .eq("floor", "2F");

      return result.data;
    },
  });

  const { data: activeOrders, refetch: refetchActiveOrders } = useQuery({
    queryKey: ["active-orders"],
    queryFn: async () => {
      const query = supabaseDefault
        .from("orders")
        .select(
          `
            id,order_id,customer_name,status,payment_token, tables(name,id)
            `,
        )
        .in("status", ["proccess", "reserved"])

        .order("created_at");

      const result = await query;

      if (result.error)
        toast.error("Get Active Order data failed", {
          description: result.error.message,
        });

      return result.data;
    },
  });

  useEffect(() => {
    const orderChannel = supabaseDefault
      .channel("orders-change")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          refetchOrders();
          refetchActiveOrders();
        },
      )
      .subscribe();

    const tableChannel = supabaseDefault
      .channel("tables-change")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
        },
        () => {
          refetchTables();
        },
      )
      .subscribe();

    return () => {
      supabaseDefault.removeChannel(orderChannel);
      supabaseDefault.removeChannel(tableChannel);
    };
  }, []);

  const totalPages = useMemo(() => {
    return orders && orders.count !== null
      ? Math.ceil(orders.count / currentLimit)
      : 0;
  }, [orders]);

  const [reservedState, reservedAction] = useActionState(
    updateReservation,
    INITIAL_STATE_ACTION,
  );

  const handleReservation = async ({
    id,
    table_id,
    status,
  }: {
    id: string;
    table_id: string;
    status: string;
  }) => {
    const formData = new FormData();
    Object.entries({ id, table_id, status }).forEach(([Key, value]) => {
      formData.append(Key, value);
    });
    startTransition(() => {
      reservedAction(formData);
    });
  };

  useEffect(() => {
    if (reservedState?.status === "error") {
      toast.error("Update Reservation Failed", {
        description: reservedState.errors?._form?.[0],
      });
    }
    if (reservedState?.status === "success") {
      toast.success("Update Reservation Success");
    }
  }, [reservedState]);

  const reservedActionList = [
    {
      label: (
        <span className="flex items-center gap-2">
          <Link2Icon />
          Proccess
        </span>
      ),
      action: (id: string, table_id: string) => {
        handleReservation({ id, table_id, status: "proccess" });
      },
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Ban className="text-red-500" />
          Cancel
        </span>
      ),
      action: (id: string, table_id: string) => {
        handleReservation({ id, table_id, status: "canceled" });
      },
    },
  ];

  const filterData = useMemo(() => {
    return (orders?.data || []).map((order, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        order.order_id,
        order.customer_name,
        (order.tables as unknown as { name: string })?.name || "Takeaway",
        <div
          className={cn("px-2 py-1 rounded-full text-white w-fit capitalize", {
            "bg-lime-500": order.status === "settled",
            "bg-sky-500": order.status === "proccess",
            "bg-amber-500": order.status === "reserved",
            "bg-red-500": order.status === "canceled",
          })}
        >
          {order.status}
        </div>,
        <DropdownAction
          menu={
            order.status === "reserved" && profile.role !== "kitchen"
              ? reservedActionList.map((item) => ({
                  label: item.label,
                  action: () =>
                    item.action(
                      order.id,
                      (order.tables as unknown as { id: string })?.id,
                    ),
                }))
              : [
                  {
                    label: (
                      <Link
                        href={`/order/${order.order_id}`}
                        className="flex items-center gap-2"
                      >
                        <ScrollText />
                        Detail
                      </Link>
                    ),
                    type: "link",
                  },
                ]
          }
        />,
      ];
    });
  }, [orders]);

  const [openCreateOrder, setOpenCreateOrder] = useState(false);

  return (
    <div className="w-full">
      <Tabs defaultValue="list">
        <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <TabsList>
            <TabsTrigger value="list">Order List</TabsTrigger>
            <TabsTrigger value="1st" hidden={profile.role !== "admin"}>
              Table 1st Floor
            </TabsTrigger>
            <TabsTrigger value="2nd" hidden={profile.role !== "admin"}>
              Table 2nd Floor
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          <div className="flex gap-2 justify-between mb-4">
            <Input
              placeholder="Search by name or status"
              onChange={(e) => handleChangeSearch(e.target.value)}
              className="max-w-64"
            />
            <DropdownMenu
              open={openCreateOrder}
              onOpenChange={setOpenCreateOrder}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Create</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="font-bold">
                  Create Order
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Dialog>
                  {profile.role !== "kitchen" && (
                    <DialogTrigger className="flex items-center gap-2 text-sm p-2 w-full rounded-md hover:bg-muted ">
                      <Utensils className="size-4" />
                      Dine In
                    </DialogTrigger>
                  )}
                  <DialogCreateOrderDineIn
                    tables={tables}
                    closeDialog={() => setOpenCreateOrder(false)}
                  />
                </Dialog>
                <Dialog>
                  {profile.role !== "kitchen" && (
                    <DialogTrigger className="flex items-center gap-2 text-sm p-2 w-full rounded-md hover:bg-muted ">
                      <Package className="size-4" />
                      Takeaway
                    </DialogTrigger>
                  )}
                  <DialogCreateOrderTakeAway
                    closeDialog={() => setOpenCreateOrder(false)}
                  />
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DataTable
            header={HEADER_ORDER_MANAGEMENT}
            isLoading={isLoading}
            data={filterData}
            totalPages={totalPages}
            currentPage={currentPage}
            currentLimit={currentLimit}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
          />
        </TabsContent>

        <TabsContent value="1st">
          <TableMap
            tables={tables1stFloor || []}
            activeOrders={activeOrders || []}
            handleReservation={(
              id: string,
              table_id: string,
              status: string,
            ) => {
              handleReservation({ id, table_id, status });
            }}
          />
        </TabsContent>

        <TabsContent value="2nd">
          <TableMap
            tables={tables2ndFloor || []}
            activeOrders={activeOrders || []}
            handleReservation={(
              id: string,
              table_id: string,
              status: string,
            ) => {
              handleReservation({ id, table_id, status });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
