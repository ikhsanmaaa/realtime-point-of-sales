import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  INITIAL_CREATE_ORDER_TAKEAWAY_FORM,
  INITIAL_STATE_ORDER_TAKEAWAY,
} from "@/constants/order-constant";
import { createOrderTakeAway } from "../action";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  OrderTakeAwayForm,
  orderTakeAwayFormSchema,
} from "@/validations/order-validation";

export default function DialogCreateOrderTakeAway({
  closeDialog,
}: {
  closeDialog: () => void;
}) {
  const form = useForm<OrderTakeAwayForm>({
    resolver: zodResolver(orderTakeAwayFormSchema),
    defaultValues: INITIAL_CREATE_ORDER_TAKEAWAY_FORM,
  });

  const [createOrderState, createOrderAction, isPendingcreateOrder] =
    useActionState(createOrderTakeAway, INITIAL_STATE_ORDER_TAKEAWAY);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    startTransition(() => {
      createOrderAction(formData);
    });
  });

  useEffect(() => {
    if (createOrderState?.status === "error") {
      toast.error("Create Order Failed", {
        description: createOrderState.errors?._form?.[0],
      });
    }
    if (createOrderState?.status === "success") {
      toast.success("Create Order Success");
      form.reset();
      closeDialog();
    }
  }, [createOrderState]);

  return (
    <DialogContent className="sm:max-w-106.25 max-h-[90vh]">
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>Create Order Takeaway</DialogTitle>
          <DialogDescription>Add a new order from customer</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4  ">
          <div className="space-y-4 max-h-[50vh] p-1 overflow-y-auto">
            <FormInput
              form={form}
              name={"customer_name"}
              label="Customer name"
              placeholder="insert customer name here"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {isPendingcreateOrder ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
