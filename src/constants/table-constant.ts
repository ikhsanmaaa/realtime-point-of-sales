export const HEADER_TABLE_MANAGEMENT = [
  "No",
  "Name",
  "Description",
  "Capacity",
  "Status",
  "Action",
];

export const STATUS_LIST = [
  {
    value: "available",
    label: "Available",
  },
  {
    value: "unavailable",
    label: "Unavailable",
  },
  {
    value: "reserved",
    label: "Reserved",
  },
];

export const INITIAL_CREATE_TABLE_FORM = {
  name: "",
  description: "",
  capacity: "",
  status: "",
};

export const INITIAL_STATE_TABLE = {
  status: "idle",
  errors: {
    id: [],
    name: [],
    description: [],
    capacity: [],
    status: [],
    _form: [],
  },
};
