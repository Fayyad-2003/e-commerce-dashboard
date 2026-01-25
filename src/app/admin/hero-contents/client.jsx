"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { useHeroContent } from "../../../../hooks";

function HeroContentPageClient() {
    const {
        heroContent,
        loading,
        error, // Updated from 'err'
        saving,
        updateHeroContent,
    } = useHeroContent();

    const [formData, setFormData] = useState({
        title: "",
        sub_title: "",
        image: null,
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (heroContent) {
            // heroContent is now a single object
            setFormData({
                title: heroContent.title || "",
                sub_title: heroContent.sub_title || "",
                image: null,
            });
        }
    }, [heroContent]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setFormData((prev) => ({ ...prev, image: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("sub_title", formData.sub_title);
        if (formData.image) {
            data.append("image", formData.image);
        }

        await updateHeroContent(data);
    };

    return (
        <SectionLayout title="القسم الرئيسي">
            <ConditionalRender
                loading={loading}
                error={error}
                loadingText="جاري تحميل المحتوى..."
            >
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A443A] focus:outline-none transition-all"
                                placeholder="مثال: منتجات حرفية مميزة لمنزلك"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفرعي</label>
                            <textarea
                                name="sub_title"
                                value={formData.sub_title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A443A] focus:outline-none transition-all"
                                placeholder="مثال: اكتشف منتجات حرفية فريدة تضيف دفئاً وشخصية لمساحة معيشتك"
                                rows="4"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A443A] focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F7931D] file:text-white hover:file:bg-[#e0851a]"
                            />
                            {heroContent?.full_image_url && !formData.image && (
                                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-2">الصورة الحالية:</p>
                                    <img
                                        src={heroContent.full_image_url}
                                        alt="Current Hero"
                                        className="max-h-60 rounded shadow-sm object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-3 px-6 rounded-lg text-white font-semibold transform transition-all duration-200
                ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#5A443A] hover:bg-[#4a3830] hover:shadow-lg active:scale-95"}`}
                        >
                            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </button>
                    </form>
                </div>
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(HeroContentPageClient), { ssr: false });
