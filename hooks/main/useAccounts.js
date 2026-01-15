"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

/**
 * named export so your existing imports like:
 * import { useAccounts } from ".../hooks"
 * keep working.
 */
export default function useAccounts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: accounts,
    pagination,
    loading,
    error,
    goToPage,
    changePerPage,
    reload,
    setData: setAccounts
  } = useFetchList({
    url: "/api/customers"
  });

  const handleDelete = async (customer) => {
    const id = customer?.id;
    if (!id) return;
    if (!confirm(`هل تريد حذف المستخدم: ${customer.name}?`)) return;

    // Snapshot
    const previous = [...accounts];

    // Optimistic Update
    // Access setData from useFetchList via a new destructuring in the hook body
    // Wait, I need to destructure it first.
    // I will do that in a separate edit or assume I can't access it unless I look at lines 15-25.
    // Let's assume I can't see lines 15-25 in this chunk.
    // I will replace the hook body start as well.
    // Actually, I can't update lines 1-25 and 27-45 in one go nicely if they are far apart.
    // But they are close enough (line 27 follows 25).
    // Let's resize the chunk. 
    // Actually, I should update the destructuring first.

    // Changing strategy: Update the hook body to destructure setData, then update handleDelete.
    // But I can't do two separate replace_file_content calls on the same file in parallel conveniently if they overlap context.
    // I will take a larger chunk.
  };

  return {
    accounts,
    pagination,
    loading,
    error,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
