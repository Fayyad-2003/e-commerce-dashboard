"use client";
import dynamic from "next/dynamic";
import {
  ConditionalRender,
  SectionLayout,
} from "../../../../components/common";
import ReviewsTable from "../../../../components/tables/ReviewsTable";
import { useReviews } from "../../../../hooks";

function CommentsPageClient() {
  const {
    comments,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleApprove,
    handleReject,
    dynamicBackHref,
  } = useReviews();

  return (
    <SectionLayout title="إدارة تعليقات المستخدمين" backHref={dynamicBackHref}>
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جار تحميل المراجعات"
      >
        <ReviewsTable
          comments={comments}
          onApprove={(c) => handleApprove(c.id ?? c)}
          onReject={(c) => handleReject(c.id ?? c)}
          pagination={pagination}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(CommentsPageClient), {
  ssr: false,
});
