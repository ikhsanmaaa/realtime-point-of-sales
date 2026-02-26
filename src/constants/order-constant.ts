import { INITIAL_STATE_ACTION } from "./general-constant";

export const HEADER_ORDER_MANAGEMENT = [
  "No",
  "Order ID",
  "Customer Name",
  "Table",
  "Status",
  "Action",
];

export const INITIAL_CREATE_ORDER_FORM = {
  customer_name: "",
  table_id: "",
  status: "",
};

export const INITIAL_STATE_ORDER = {
  status: "idle",
  errors: {
    id: [],
    customer_name: [],
    table_id: [],
    status: [],
    _form: [],
  },
};

export const STATUS_CREATE_ORDER = [
  {
    value: "reserved",
    label: "Reserved",
  },
  {
    value: "proccess",
    label: "Proccess",
  },
];

export const HEADER_TABLE_DETAIL_ORDER = [
  "No",
  "Menu",
  "Total",
  "Status",
  "Action",
];

export const FILTER_MENU = [
  {
    value: "",
    label: "All",
  },
  {
    value: "Coffee",
    label: "Coffee",
  },
  {
    value: "Non-Coffee",
    label: "non-Coffee",
  },
  {
    value: "Breakfast",
    label: "Breakfast",
  },
  {
    value: "Main Course",
    label: "Main Course",
  },
  {
    value: "Dessert",
    label: "Dessert",
  },
];

export const INITIAL_STATE_GENERATE_PAYMENT={
  ...INITIAL_STATE_ACTION,
  data:{
    payment_token:''
  }
}