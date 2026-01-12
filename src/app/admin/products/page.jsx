
"use client";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useProducts } from "../../../../hooks";
import Table from "../../../../components/home/Table";
import { ConditionalRender } from "../../../../components/common";

export function ProductsPageClient() {
  const params = useParams();
  const search = useSearchParams();

  const subId = useMemo(() => {
    let id = params?.id;
    if (Array.isArray(id)) id = id[0];
    return id ?? "";
  }, [params]);

  const page = Number(search?.get("page") ?? 1);
  const per_page = Number(search?.get("per_page") ?? 10);

  // استخدام hook الخاص بالـ fetching
  const { data, meta, loading, err } = useProducts(subId, page, per_page);

  return (
    <div className="relative font-sans gap-16 sm:p-20">
      <div className="absolute top-4 right-4 sm:right-8">
        <Link href="/branches/sub-branch">
          <div className="flex items-center text-xs sm:text-sm text-[#5A443A] hover:text-[#F7931D] transition-colors">
            <MoveLeft className="mr-1 sm:mr-2" size={16} />
            <span className="mr-3">الأقسام الفرعية</span>
          </div>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b mb-5 gap-4">
        <h2 className="text-xl font-bold text-[#5A443A]">
          المنتجات — القسم الفرعي #{subId}
        </h2>

        <Link
          href={`/products/new?sub_id=${subId}`}
          className="bg-[#5A443A] text-white px-4 py-2 rounded-md hover:bg-[#402E32] transition-colors"
        >
          إضافة منتج جديد
        </Link>
      </div>

      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جار تحميل منتجات القسم"
      >
        <Table
          data={data}
          categorie="اسم المنتج"
          sub="null"
          url="/products"
          editHref={(item) => `/products/${item.id}/update`}
        />
      </ConditionalRender>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ProductsPageClient), { ssr: false });
