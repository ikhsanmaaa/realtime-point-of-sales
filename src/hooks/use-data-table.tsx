"use client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/data-table-constant";
import { Search } from "lucide-react";
import { useState } from "react";
import useDebounce from "./use-debounce";

export default function useDataTable() {
  const debounce = useDebounce();

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
  const [currentSearch, setCurrentSearch] = useState("");
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };
  const handleChangeLimit = (limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleChangeSearch = (search: string) => {
    debounce(() => {
      setCurrentSearch(search);
      setCurrentPage(DEFAULT_PAGE);
    }, 500);
  };

  return {
    currentPage,
    currentLimit,
    currentSearch,

    handleChangeLimit,
    handleChangePage,
    handleChangeSearch,
  };
}
