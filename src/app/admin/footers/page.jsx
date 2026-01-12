// page.jsx
'use client'
import { ConditionalRender, SectionLayout } from '../../../../components/common';
import { FootersTable } from '../../../../components/tables';
import { useFooters } from '../../../../hooks';

const Page = () => {
  const {
    footerData,
    loading,
    saving,
    error,
    successMessage,
    handleChange,
    handleSave,
  } = useFooters();

  return (
    <SectionLayout title="إدارة المعلومات">
      <ConditionalRender
        loading={loading}
        error={Boolean(error)}
        errorText={error || "حدث خطأ أثناء تحميل بيانات التذييل."}
      >
        <FootersTable
          footerData={footerData}
          handleChange={handleChange}
          handleSave={handleSave}
          saving={saving}
          error={error}
          successMessage={successMessage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
};

export default Page;
