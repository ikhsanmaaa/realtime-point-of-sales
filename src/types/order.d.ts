import { Menu } from "@/validations/menu-validations";

export type OrderFormState = {
  status?: string;
  errors?: {
    id?: string[];
    customer_name?: string[];
    table_id?: string[];
    status?: string[];
    _form?: string[];
  };
};

export type Cart = {
  menu_id: string;
  quantity: number;
  nominal: number;
  notes: string;
  menu: Menu;
  order_id?: string;
};
