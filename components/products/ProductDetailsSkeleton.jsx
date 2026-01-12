"use client";
import React from "react";

export default function ProductDetailsSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded w-40"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Images */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative h-80 bg-gray-200 rounded-lg"></div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-md"></div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    {/* Title and Model Number */}
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>

                    {/* Description */}
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>

                    {/* Price and Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="h-6 bg-gray-200 rounded w-28 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div>
                            <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>

                    {/* Sizes and Colors */}
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="border-b border-gray-200 pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3].map((j) => (
                                            <div key={j} className="h-8 bg-gray-200 rounded-full w-20"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Tiers */}
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-28 mb-2"></div>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-2 mt-4">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
