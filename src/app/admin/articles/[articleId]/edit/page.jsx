"use client";
import { ArticleForm } from "../../../../../../components/forms";
import { ConditionalRender } from "../../../../../../components/common";
import { useEditArticle } from "../../../../../../hooks";

export default function EditArticlePage() {
  const { initialData, loading, submitting, error, handleSubmit } =
    useEditArticle();

  return (
    <ConditionalRender loading={loading} error={error}>
      <ArticleForm
        initialData={initialData}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </ConditionalRender>
  );
}
