 "use client";
 import useFetchList from "../useFetchList";
 
 export default function useCategories() {
   const {
     data: categories,
     pagination,
     loading,
     error: err,
     goToPage,
     changePerPage,
     reload,
   } = useFetchList({
     url: "/api/categories",
   });
 
   return {
     categories,
     pagination,
     loading,
     err,
     goToPage,
     changePerPage,
     reload,
   };
 }
