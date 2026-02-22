import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";
import { deleteMenu } from "../action";
import { Menu } from "@/validations/menu-validations";

export default function DialogDeleteMenu({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Menu;
  handleChangeAction: (open: boolean) => void;
  open: boolean;
}) {
  const [deleteMenuState, deleteMenuAction, isPendingDeleteMenu] =
    useActionState(deleteMenu, INITIAL_STATE_ACTION);

  const onSubmit = () => {
    const formData = new FormData();
    formData.append("id", currentData!.id as string);
    formData.append("image_url", currentData!.image_url as string);
    startTransition(() => {
      deleteMenuAction(formData);
    });
  };

  useEffect(() => {
    if (deleteMenuState?.status === "error") {
      toast.error("Delete Menu Failed", {
        description: deleteMenuState.errors?._form?.[0],
      });
    }
    if (deleteMenuState?.status === "success") {
      toast.success("Delete Menu Success");
      handleChangeAction?.(false);
      refetch();
    }
  }, [deleteMenuState]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPendingDeleteMenu}
      onSubmit={onSubmit}
      title="Menu"
    />
  );
}
