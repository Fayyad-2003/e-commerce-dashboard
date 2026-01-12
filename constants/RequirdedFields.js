export const REQUIRED_FIELDS = {
  sub_category_id: { type: "hidden", required: true, label: "المجموعة الفرعية (sub_category_id)" },
  unit_of_measure_id: { type: "integer", required: true, label: "وحدة القياس (unit_of_measure_id)" },
  name: { type: "string", maxLength: 255, required: true, label: "اسم المنتج" },
  model_number: { type: "string", maxLength: 255, required: true, label: "رقم الموديل" },
  description: { type: "string", required: true, label: "الوصف" },
  base_price: { type: "number", required: true, label: "السعر الأساسي" },
  images: {
    type: "array",
    required: true,
    label: "الصور",
    validation: {
      maxSize: 4_000, // بالكيلوبايت ~ 4MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
  },
};