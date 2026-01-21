"use client";

import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { NotificationsTable } from "../../../../components/tables";
import { useNotifications } from "../../../../hooks";

function NotificationsPageClient() {
  const {
    notifications,
    pagination,
    loading,
    err,
    goToPage,
    reload,
    changePerPage,
    handleMarkRead,
  } = useNotifications();

  return (
    <SectionLayout title="إدارة الإشعارات">
      <ConditionalRender loading={loading} error={err} loadingText="جاري تحميل الإشعارات">
        <NotificationsTable
          items={notifications}
          pagination={pagination}
          reload={reload}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
          onMarkRead={handleMarkRead}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(NotificationsPageClient), { ssr: false });
