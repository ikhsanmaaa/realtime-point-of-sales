export const HEADER_TABLE_MENU = [
  "No",
  "Name",
  "Category",
  "Price",
  "Available",
  "Action",
];

export const CATEGORY_LIST = [
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

export const AVAILABILITY_LIST = [
  {
    value: "true",
    label: "Available",
  },
  {
    value: "false",
    label: "Not Available",
  },
];

export const INITIAL_CREATE_MENU_FORM = {
  name: "",
  description: "",
  price: "",
  discount: "",
  category: "",
  image_url: "",
  is_available: "",
};

export const INITIAL_STATE_MENU = {
  status: "idle",
  errors: {
    id: [],
    name: [],
    description: [],
    price: [],
    discount: [],
    category: [],
    image_url: [],
    is_available: [],
    _form: [],
  },
};
