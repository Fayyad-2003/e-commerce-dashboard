"use client"
import { useSearchParams } from "next/navigation";
import ProductForm from "../../../../../components/products/ProductForm";
import dynamic from "next/dynamic";

export function Page() {
  const searchParams = useSearchParams()
  const defaultSubId = searchParams?.get("subId")?? "";
  return <ProductForm defaultSubCategoryId={defaultSubId} />;
}

export default dynamic(() => Promise.resolve(Page), { ssr: false });
