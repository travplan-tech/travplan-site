"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    Download,
    Check,
    ChevronDown,
    Star,
} from "lucide-react";
import {
    TourDetailsFooterSkeleton,
    TourAvailabilitySkeleton,
    CardGridSkeleton,
} from "@/components/loading-skeletons";

// Dynamic Imports for below-the-fold content
const TourDetailsFooter = dynamic(() => import("@/components/tripdetails"), {
    loading: () => <TourDetailsFooterSkeleton />,
});
const TourAvailabilitySection = dynamic(() => import("@/components/tripavailability"), {
    loading: () => <TourAvailabilitySkeleton />,
});
const TopRatedSection = dynamic(() => import("@/components/top-rated"), {
    loading: () => <CardGridSkeleton cards={3} />,
});
const EnquiryDialog = dynamic(() => import("@/components/EnquiryDialog"));
const BrochureDialog = dynamic(() => import("@/components/BrochureDialog"));
const FavoriteButton = dynamic(() => import("@/components/FavoriteButton"));

// Types
interface Review {
    id: number;
    user: {
        name: string | null;
        image: string | null;
    };
    rating: number;
    comment: string | null;
    createdAt: string;
}

interface DepartureDate {
    date: string;
    seatsRemaining?: number | null;
}

export interface TourData {
    id: number;
    title: string;
    tags: string[];
    description: string | null;
    price: number;
    originalPrice: number | null;
    duration: string;
    rating: number;
    reviewCount: number;
    image: string | null;
    mapImage: string | null;
    priceChartImage?: string | null;
    galleryImages: string[];
    highlights: string[];
    itinerary: Array<{
        day: number;
        title: string;
        duration?: string;
        description: string;
        altitude?: string;
        showAccommodation?: boolean;
    }>;
    tourType: string | null;
    tourCategory?: string;
    maxPersons?: number;
    ageRange: string | null;
    accommodation: string | null;
    destinations: string[];
    departurePoints: string[];
    inclusions: string[];
    exclusions: string[];
    itineraryPdf: string | null;
    isCustomizable: boolean;
    bestPrice: boolean;
    flightsIncluded: boolean;
    specialNotes?: string | null;
    cancellationPolicy?: string | null;
    upcomingDepartures?: DepartureDate[];
    reviews?: Review[];
    destination: {
        name: string;
        country: string | null;
    };
}

interface ItineraryDayProps {
    dayData: TourData["itinerary"][0];
    isFirst?: boolean;
    isLast?: boolean;
    accommodation?: string | null;
}

const ItineraryDay: React.FC<ItineraryDayProps> = ({ dayData, isFirst = false, isLast = false, accommodation }) => {
    const [isOpen, setIsOpen] = useState(isFirst);
    const { day, title, description, showAccommodation } = dayData;

    return (
        <div className="relative">
            {/* Vertical Timeline Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-[40px] bottom-0 w-[2px] bg-gray-200" />
            )}

            <div className="flex gap-4">
                {/* Timeline Dot / Icon */}
                <div className="relative z-10 shrink-0">
                    {isOpen ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                    <button
                        className="flex justify-between items-center w-full text-left group"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-base md:text-lg font-semibold text-primary">Day {day}</span>
                            <span className="text-base md:text-lg font-semibold text-gray-800">- {title}</span>
                        </div>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {isOpen && (
                        <div className="mt-4 space-y-4">
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                {description}
                            </p>

                            {/* Accommodation Info */}
                            {accommodation && showAccommodation !== false && (
                                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-3">
                                    <svg
                                        className="w-5 h-5 text-primary shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                    <div>
                                        <span className="text-sm font-semibold text-gray-800">Accommodation: </span>
                                        <span className="text-sm text-gray-600">{accommodation}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface TripDetailClientProps {
    tourData: TourData;
}

export default function TripDetailClient({ tourData }: TripDetailClientProps) {
    const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);
    const [showBrochureDialog, setShowBrochureDialog] = useState(false);

    const mainImage = tourData.image || "/placeholder.jpg";
    const galleryImages = tourData.galleryImages.length > 0
        ? tourData.galleryImages
        : [mainImage, mainImage];

    return (
        <div className="bg-white">
            {/* --- Full-Width Gallery/Hero Section --- */}
            <div className="relative w-full overflow-hidden mb-4 md:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
                    {/* Main Large Image */}
                    <div className="md:col-span-3 h-[250px] sm:h-[300px] md:h-[400px] relative overflow-hidden rounded-lg">
                        <Image
                            src={mainImage}
                            alt={tourData.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 60vw"
                            priority
                            className="object-cover"
                        />
                        <FavoriteButton
                            packageId={tourData.id}
                            size="md"
                            className="absolute top-2 md:top-4 right-2 md:right-4"
                        />
                        {/* Download Brochure Button */}
                        {tourData.itineraryPdf && (
                            <button
                                onClick={() => setShowBrochureDialog(true)}
                                className="absolute bottom-3 md:bottom-6 left-4 md:left-8 text-white text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 bg-primary hover:bg-primary/90 rounded-full flex items-center shadow-lg transition"
                            >
                                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Download Brochure
                            </button>
                        )}
                    </div>

                    {/* Side Image Column */}
                    <div className="md:col-span-2 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                        <div className="flex-1 md:flex-none h-[150px] sm:h-[180px] md:h-[195px] relative overflow-hidden rounded-lg">
                            <Image
                                src={galleryImages[0] || mainImage}
                                alt="Gallery 1"
                                fill
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 md:flex-none h-[150px] sm:h-[180px] md:h-[195px] relative overflow-hidden rounded-lg">
                            <Image
                                src={galleryImages[1] || mainImage}
                                alt="Gallery 2"
                                fill
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Container --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- Breadcrumbs and Title --- */}
                <nav className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-primary">Home</Link>{" "}
                    /
                    <Link href="/destinations" className="hover:text-primary"> Destinations</Link>{" "}
                    /
                    {tourData.destination?.country && (
                        <>
                            <Link href={`/destinations?country=${tourData.destination.country}`} className="hover:text-primary">
                                {" "}{tourData.destination.country}
                            </Link>{" "}
                            /
                        </>
                    )}
                    <span className="font-medium text-wrap text-gray-700">
                        {" "}{tourData.title}
                    </span>
                </nav>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {tourData.title}
                </h1>
                <div className="flex items-center mb-4 md:mb-6">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-semibold text-sm md:text-base text-gray-700 mr-1">
                        {tourData.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm cursor-pointer">
                        based on {tourData.reviewCount || 0} reviews
                    </span>
                </div>

                {/* --- Content/Sidebar Split --- */}
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
                    {/* LEFT/MIDDLE COLUMN - Tour Details (Part 1: Up to Route Map) */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1">
                        {/* Tags and Key Details Row */}
                        <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 items-center border-b border-gray-200 pb-3 md:pb-4">
                            {tourData?.tags.map((tag, index) => (
                                <span key={index} className="px-2 md:px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Key Trip Facts Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm border-b border-gray-200 pb-3 md:pb-4 text-gray-700">
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">Start Point</p>
                                <p className="text-xs md:text-sm">{tourData.departurePoints[0] || tourData.destination?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">End Point</p>
                                <p className="text-xs md:text-sm">{tourData.departurePoints[tourData.departurePoints.length - 1] || tourData.destination?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">{tourData.duration}</p>
                                <p className="text-xs md:text-sm">Duration</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2">
                                    {tourData.tourType || "Private Tour"}
                                </p>
                                <p className="text-xs md:text-sm">Tour Type</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">{tourData.ageRange || "All ages"}</p>
                                <p className="text-xs md:text-sm line-clamp-2">Age range</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">
                                    {tourData.tourCategory === "GROUP" ? "Group Tour" : "Private Tour"}
                                </p>
                                <p className="text-xs md:text-sm">Category</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">{tourData.maxPersons || 10} Persons</p>
                                <p className="text-xs md:text-sm">Max Group Size</p>
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base text-gray-900">Flights</p>
                                <p className="text-xs md:text-sm">{tourData.flightsIncluded ? "Included" : "Excluded"}</p>
                            </div>
                        </div>

                        {/* --- Route Map Section --- */}
                        {tourData.mapImage && (
                            <div className="py-3 md:py-4">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                                    Route Map
                                </h2>
                                <div className="relative bg-gray-100 h-64 sm:h-80 md:h-96 w-full rounded-lg flex items-center justify-center">
                                    <Image
                                        src={tourData.mapImage}
                                        alt="Route Map"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                        loading="lazy"
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN - Booking Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:row-span-2">
                        <div className="lg:sticky lg:top-20 bg-white border border-gray-200 rounded-lg p-4 md:p-5 lg:p-6 shadow-lg">
                            {/* Price and Availability */}
                            <div className="mb-4 md:mb-6">
                                {tourData.originalPrice && tourData.originalPrice > tourData.price && (
                                    <p className="text-sm text-gray-400 line-through">
                                        ₹{tourData.originalPrice.toLocaleString("en-IN")}
                                    </p>
                                )}
                                <p className="text-xs md:text-sm text-gray-500">From</p>
                                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                                    ₹{tourData.price.toLocaleString("en-IN")}
                                </p>
                                <p className="text-xs text-gray-500">per person</p>
                            </div>

                            <Link href="#availability">
                                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 md:py-3 rounded-md mb-2 md:mb-3 transition text-sm md:text-base">
                                    Check Availability
                                </button>
                            </Link>
                            <button
                                onClick={() => setShowEnquiryDialog(true)}
                                className="w-full bg-white border border-primary text-primary hover:bg-primary/5 font-semibold py-2.5 md:py-3 rounded-md transition text-sm md:text-base"
                            >
                                Make an Enquiry
                            </button>

                            {/* Guarantees and Benefits */}
                            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200 space-y-2 md:space-y-3">
                                {tourData.bestPrice && (
                                    <div className="flex items-center text-xs md:text-sm text-gray-700">
                                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                        Best price guaranteed
                                    </div>
                                )}
                                <div className="flex items-center text-xs md:text-sm text-gray-700">
                                    <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                    Book your package at 30% Now
                                </div>
                                <div className="flex items-center text-xs md:text-sm text-gray-700">
                                    <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                    EMI options available
                                </div>
                                {tourData.isCustomizable && (
                                    <div className="flex items-center text-xs md:text-sm text-gray-700">
                                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                        Trip is customizable
                                    </div>
                                )}
                            </div>

                            {/* Child Policy Notice */}
                            <div className="mt-4 pt-3 md:pt-4 border-t border-gray-200">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs md:text-sm text-amber-800">
                                        <span className="font-semibold">Child Policy:</span> Children aged 6-12 years may incur additional charges. Children below 6 years are complimentary.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LEFT/MIDDLE COLUMN - Tour Details (Part 2: After Route Map) */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8 order-3">
                        {/* --- Description Section --- */}
                        {tourData.description && (
                            <div className="py-3 md:py-4 border-t border-gray-200">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                                    About This Tour
                                </h2>
                                <p className="text-sm md:text-base text-gray-600">
                                    {tourData.description}
                                </p>
                            </div>
                        )}

                        {/* --- Highlights Section --- */}
                        {tourData.highlights.length > 0 && (
                            <div className="py-3 md:py-4 border-t border-gray-200">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                                    Highlights
                                </h2>
                                <ul className="space-y-2">
                                    {tourData.highlights.map((item, index) => (
                                        <li key={index} className="flex items-start text-sm md:text-base text-gray-700">
                                            <Check className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* --- Special Notes Section --- */}
                        {tourData.specialNotes && (
                            <div className="py-3 md:py-4 border-t border-gray-200">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                                    Special Notes
                                </h2>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm md:text-base text-amber-900 whitespace-pre-line">
                                        {tourData.specialNotes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- Itinerary Section --- */}
                        {tourData.itinerary.length > 0 && (
                            <div className="py-3 md:py-4 border-t border-gray-200">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Itinerary</h2>

                                {/* Day-by-Day Collapsible List */}
                                <div className="mt-2">
                                    {tourData.itinerary.map((dayData, index) => (
                                        <ItineraryDay
                                            key={dayData.day}
                                            dayData={dayData}
                                            isFirst={index === 0}
                                            isLast={index === tourData.itinerary.length - 1}
                                            accommodation={tourData.accommodation}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- Inclusions & Exclusions --- */}
                        {(tourData.inclusions.length > 0 || tourData.exclusions.length > 0) && (
                            <div className="py-2">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {tourData.inclusions.length > 0 && (
                                        <div>
                                            <h3 className="text-base font-semibold text-green-700 mb-3">What's Included</h3>
                                            <ul className="space-y-2">
                                                {tourData.inclusions.map((item, index) => (
                                                    <li key={index} className="flex items-start text-sm text-gray-700">
                                                        <Check className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {tourData.exclusions.length > 0 && (
                                        <div>
                                            <h3 className="text-base font-semibold text-red-700 mb-3">What's Excluded</h3>
                                            <ul className="space-y-2">
                                                {tourData.exclusions.map((item, index) => (
                                                    <li key={index} className="flex items-start text-sm text-gray-700">
                                                        <span className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5">✕</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <TourDetailsFooter
                            title={tourData.title}
                            itineraryPdf={tourData.itineraryPdf}
                            reviews={tourData.reviews || []}
                            rating={tourData.rating}
                            reviewCount={tourData.reviewCount}
                            onDownloadBrochure={() => setShowBrochureDialog(true)}
                        />

                        {/* Availability Section */}
                        <TourAvailabilitySection
                            departureDates={tourData.upcomingDepartures || []}
                            departurePoints={tourData.departurePoints}
                            price={tourData.price}
                            originalPrice={tourData.originalPrice || undefined}
                            discountPercent={tourData.originalPrice && tourData.originalPrice > tourData.price
                                ? Math.round(((tourData.originalPrice - tourData.price) / tourData.originalPrice) * 100)
                                : 0}
                            duration={tourData.duration}
                            title={tourData.title}
                            destination={tourData.destination?.name}
                            packageId={tourData.id}
                            priceChartImage={tourData.priceChartImage}
                            cancellationPolicy={tourData.cancellationPolicy || undefined}
                        />
                    </div>
                </div>
                <TopRatedSection />
            </div>

            {/* Enquiry Dialog - Conditionally Rendered by dynamic import */}
            {showEnquiryDialog && (
                <EnquiryDialog
                    isOpen={showEnquiryDialog}
                    onClose={() => setShowEnquiryDialog(false)}
                    packageId={tourData.id}
                    packageName={tourData.title}
                />
            )}

            {/* Brochure Dialog - Conditionally Rendered by dynamic import */}
            {showBrochureDialog && (
                <BrochureDialog
                    isOpen={showBrochureDialog}
                    onClose={() => setShowBrochureDialog(false)}
                    packageId={tourData.id}
                    packageName={tourData.title}
                    brochureUrl={tourData.itineraryPdf}
                />
            )}
        </div>
    );
}
