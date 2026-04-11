"use client";

import React from 'react';
import Image from 'next/image';
import { Check, Download, Star } from 'lucide-react';

interface Review {
    id?: number;
    user?: {
        name: string | null;
        image: string | null;
    };
    userName?: string | null;
    avatar?: string | null;
    rating: number;
    comment: string | null;
    createdAt?: string;
}

interface TourDetailsFooterProps {
    title?: string;
    itineraryPdf?: string | null;
    reviews?: Review[];
    rating?: number;
    reviewCount?: number;
    onDownloadBrochure?: () => void;
}

// Helper component for star rating visualization
const ReviewStars: React.FC<{ rating: number }> = ({ rating }) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(<Star key={i} size={16} className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />);
    }
    return <div className="flex">{stars}</div>;
};

// --- Main Component ---
export default function TourDetailsFooter({
    title = "this tour",
    itineraryPdf,
    reviews = [],
    rating = 0,
    reviewCount = 0,
    onDownloadBrochure
}: TourDetailsFooterProps) {
    // Calculate rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0]; // 1 to 5 stars
    reviews.forEach(review => {
        const star = Math.round(review.rating);
        if (star >= 1 && star <= 5) {
            ratingDistribution[star - 1]++;
        }
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-10 lg:space-y-16">

            {/* --- Get Trip Brochure Banner --- */}
            {itineraryPdf && (
                <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between p-6 md:p-10">
                    {/* Background image for the banner */}
                    <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/40" />

                    <div className="relative z-10 text-white md:w-2/3">
                        <h3 className="text-xl md:text-2xl font-bold">Get Trip Brochure & Exclusive Discount</h3>
                        <p className="text-sm mt-1">Get a detailed PDF brochure and exclusive discount for this tour.</p>
                    </div>
                    <button
                        onClick={onDownloadBrochure}
                        className="relative z-10 mt-5 md:mt-0 bg-white text-gray-800 font-semibold px-6 py-3 rounded-full flex items-center hover:bg-gray-100 transition shadow-md"
                    >
                        Download Now
                        <Download className="w-4 h-4 ml-2" />
                    </button>
                </div>
            )}

            {/* --- Customer Reviews --- */}
            <div className="py-4 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Read what other travelers have to say about <span className="font-semibold">{title}</span>
                </p>

                {/* Overall Rating Box */}
                {reviewCount > 0 && (
                    <div className="flex items-center p-6 bg-green-50 rounded-lg max-w-lg mb-8">
                        <div className="mr-6 text-center">
                            <p className="text-5xl font-extrabold text-green-600">{rating.toFixed(1)}</p>
                            <ReviewStars rating={rating} />
                        </div>

                        <div className="flex-grow">
                            <p className="text-sm text-gray-600">based on {reviewCount} reviews</p>
                            <div className="mt-2 space-y-1">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="flex items-center text-xs">
                                        <span className="mr-2 w-4">{star} ★</span>
                                        <div className="flex-grow h-2 bg-gray-200 rounded">
                                            <div
                                                className="h-full bg-green-500 rounded"
                                                style={{ width: `${reviewCount > 0 ? (ratingDistribution[star - 1] / reviewCount) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 w-6 text-right">{ratingDistribution[star - 1]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Reviews */}
                {reviews.length > 0 ? (
                    <div className="space-y-8">
                        {reviews.map((review, index) => (
                            <div key={review.id || index} className="border-b border-gray-100 pb-8">

                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        {/* Avatar */}
                                        {(review.avatar || review.user?.image) ? (
                                            <Image
                                                src={review.avatar || review.user?.image || ''}
                                                alt={review.user?.name || review.userName || 'User'}
                                                width={32}
                                                height={32}
                                                className="rounded-full mr-3"
                                            />
                                        ) : (
                                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 bg-primary">
                                                {(review.user?.name || review.userName || 'U')[0].toUpperCase()}
                                            </span>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.user?.name || review.userName || 'Anonymous'}</p>
                                            <div className="flex items-center text-xs text-green-600">
                                                <Check className="w-3 h-3 mr-1" /> Verified Traveler
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                                </div>

                                {/* Rating and Comment */}
                                <div className="pl-11">
                                    <div className="flex items-center mb-2">
                                        <ReviewStars rating={review.rating} />
                                        <span className="text-sm font-medium text-gray-900 ml-2">{review.rating.toFixed(1)} out of 5</span>
                                    </div>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No reviews yet. Be the first to review this tour!</p>
                    </div>
                )}
            </div>

        </div>
    );
}