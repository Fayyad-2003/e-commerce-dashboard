"use client";
import { useRouter, useSearchParams } from "next/navigation";
import useFetchList from "../useFetchList";

export default function useNotifications() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: notifications,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
  } = useFetchList({
    url: "/api/notifications"
  });

  return {
    notifications,
    pagination,
    loading,
    err,
    reload,
    goToPage,
    changePerPage,
  };
}
