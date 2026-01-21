import { Bell, BookOpenTextIcon, Coins, Component, BadgeInfo, ListOrdered, MessagesSquare, Newspaper, RulerIcon, TagsIcon, UsersIcon, MonitorPlay, Store } from "lucide-react";

export const MENU_ITEMS = [
  {
    name: "الأقسام الرئيسية",
    icon: TagsIcon,
    href: "/",
    matchPaths: ["/", "/admin/branches/add", "/admin/branches/"],
  },
  {
    name: "المتاجر",
    icon: Store,
    href: "/admin/stores",
    matchPaths: ["/admin/stores", "/admin/stores/categories", "/admin/stores/sub-categories", "/admin/stores/products"],
  },
  {
    name: "العروض الأسبوعية",
    icon: Component,
    href: "/admin/bundles",
    matchPaths: ["/admin/bundles", "/admin/bundles/new", "/admin/bundles/[id]/update"],
  },
  {
    name: "الخصومات",
    icon: Coins,
    href: "/admin/discounts",
    matchPaths: ["/admin/discounts", "/admin/discounts/new", "/admin/discounts/[id]/update"],
  },
  {
    name: "الإعلانات",
    icon: MonitorPlay,
    href: "/admin/ads",
    matchPaths: ["/admin/ads", "/admin/ads/new", "/admin/ads/[id]/update"],
  },
  {
    name: "الاشعارات",
    icon: Bell,
    href: "/admin/notifications",
    matchPaths: ["/admin/notifications"],
    showBadge: true, // ✅ badge only here
  },
  {
    name: "وحدات القياس",
    icon: RulerIcon,
    href: "/admin/sizetable",
    matchPaths: ["/admin/sizetable", "/admin/sizetable/new", "/admin/sizetable/[id]/update"],
  },
  {
    name: "الحسابات",
    icon: UsersIcon,
    href: "/admin/accounts",
    matchPaths: ["/admin/accounts", "/admin/accounts/[id]", "/admin/accounts/new", "/admin/accounts/[id]/update"],
  },
  {
    name: "التقارير",
    icon: BookOpenTextIcon,
    href: "/admin/reports",
    matchPaths: ["/admin/reports"],
  },
  {
    name: "الطلبيات",
    icon: ListOrdered,
    href: "/admin/orders",
    matchPaths: ["/admin/orders", "/admin/orders/new", "/admin/orders/[id]"],
  },
  {
    name: "المقالات",
    icon: Newspaper,
    href: "/admin/articles",
    matchPaths: ["/admin/articles/", "/admin/articles/new", "/admin/articles/[id]/edit", "/admin/articles/[id]"],
  },
  {
    name: "المراجعات",
    icon: MessagesSquare,
    href: "/admin/reviews",
    matchPaths: ["/admin/reviews"],
  },
  {
    name: "المعلومات",
    icon: BadgeInfo,
    href: "/admin/footers",
    matchPaths: ["/admin/footers"],
  }
];
