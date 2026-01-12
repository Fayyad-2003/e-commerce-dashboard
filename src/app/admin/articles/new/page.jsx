"use client";
import { ArticleForm } from "../../../../../components/forms";
import { useNewArticle } from "../../../../../hooks/create/useNewArticle";

export default function NewArticlePage() {
  const { submitting, handleSubmit, goBack } = useNewArticle();
  return (
    <div className="container mx-auto p-4">
      <ArticleForm
        onSubmit={handleSubmit}
        onCancel={goBack}
        submitting={submitting}
      />
    </div>
  );
}
