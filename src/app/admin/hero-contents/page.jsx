"use client";
import { useEffect, useState } from "react"; // Added useState
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { useHeroContent } from "../../../../hooks";
import { toast } from "react-hot-toast";

function HeroContentPageClient() {
    const {
        heroContent,
        loading,
        err,
        saving,
        updateHeroContent,
    } = useHeroContent();

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
        image: null,
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (heroContent && heroContent.length > 0) {
            // Assuming heroContent is an array, take the first item or specific structure logic
            // If it's a single object, adjust accordingly. 
            // Based on useFetchList, data is usually an array.
            const data = heroContent[0] || {};
            setFormData({
                title: data.title || "",
                subtitle: data.subtitle || "",
                buttonText: data.buttonText || "",
                buttonLink: data.buttonLink || "",
                image: null, // Don't pre-fill file input
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
        data.append("subtitle", formData.subtitle);
        data.append("buttonText", formData.buttonText);
        data.append("buttonLink", formData.buttonLink);
        if (formData.image) {
            data.append("image", formData.image);
        }

        await updateHeroContent(data);
    };

    return (
        <SectionLayout title="Hero Content">
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="Loading hero content..."
            >
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter hero title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <textarea
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter hero subtitle"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="e.g. Shop Now"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                            <input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="/shop"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {heroContent?.[0]?.image && !formData.image && (
                                <div className="mt-2 text-sm text-gray-500">
                                    Current image: {heroContent[0].image}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors
                ${saving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {saving ? "Saving..." : "Update Hero Content"}
                        </button>
                    </form>
                </div>
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(HeroContentPageClient), { ssr: false });
