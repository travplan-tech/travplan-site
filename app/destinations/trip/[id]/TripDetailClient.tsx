"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    Download,
    Check,
    ChevronDown,
    AlertCircle,
    Baby,
    CalendarDays,
    ChevronRight,
    Clock,
    CreditCard,
    Info,
    MessageCircle,
    Minus,
    MapPin,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
    Wallet,
    X,
} from "lucide-react";
import {
    TourDetailsFooterSkeleton,
    TourAvailabilitySkeleton,
    CardGridSkeleton,
} from "@/components/loading-skeletons";
import { readableTitle } from "@/lib/package-title";
import PackageOverview from "@/components/package-overview";
import PackageSection from "@/components/package-section";
import PackageItinerary from "@/components/package-itinerary";

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

    // Alt text for the two side images. Uses the readable title rather than the
    // stored "Kerala-7N/8D" form, and tidies destination names that carry a
    // stray space before the comma ("Kerala , India").
    const galleryAltPlace = (tourData.destination?.name || "")
        .replace(/\s+,/g, ",")
        .trim();
    const galleryAltBase = [readableTitle(tourData.title, tourData.duration), galleryAltPlace]
        .filter(Boolean)
        .join(" in ");

    // "Tawang, India" -> "Tawang · India", with the stray space tidied.
    // destination.name arrives as "Tawang, India"; show it as "Tawang · India".
    // Stored inclusion/exclusion lists contain repeated lines, so collapse them.
    const uniqueLines = (lines: string[]) =>
        Array.from(new Map(lines.map((l) => [l.trim().toLowerCase(), l.trim()])).values()).filter(
            Boolean
        )
    const inclusions = uniqueLines(tourData.inclusions)
    const exclusions = uniqueLines(tourData.exclusions)

    const saving =
        tourData.originalPrice && tourData.originalPrice > tourData.price
            ? tourData.originalPrice - tourData.price
            : 0

    const destinationLabel =
        (tourData.destination?.name || "")
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .join(" · ") || null;

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
                                alt={`${galleryAltBase} photo 1`}
                                fill
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 md:flex-none h-[150px] sm:h-[180px] md:h-[195px] relative overflow-hidden rounded-lg">
                            <Image
                                src={galleryImages[1] || mainImage}
                                alt={`${galleryAltBase} photo 2`}
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
                <nav aria-label="Breadcrumb" className="mb-4 md:mb-5">
                    <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                        <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                        <li><Link href="/destinations" className="hover:text-primary transition-colors">Destinations</Link></li>
                        {tourData.destination?.country && (
                            <>
                                <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                                <li>
                                    <Link
                                        href={`/destinations?country=${encodeURIComponent(tourData.destination.country)}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {tourData.destination.country}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ol>
                </nav>

                {destinationLabel && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-3">
                        <MapPin size={13} aria-hidden="true" />
                        {destinationLabel}
                    </p>
                )}

                <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                    {readableTitle(tourData.title, tourData.duration)}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-4 mb-6 md:mb-8">
                    {tourData.duration && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                            <Clock size={12} aria-hidden="true" />
                            {tourData.duration}
                        </span>
                    )}
                    {tourData.tourCategory && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                            <Users size={12} aria-hidden="true" />
                            {tourData.tourCategory === "GROUP" ? "Group tour" : "Private tour"}
                        </span>
                    )}
                    {/* Shown only when the trip genuinely has reviews */}
                    {typeof tourData.rating === "number" && tourData.rating > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                            <Star size={12} className="fill-amber-500 text-amber-500" aria-hidden="true" />
                            {tourData.rating.toFixed(1)}
                            {tourData.reviewCount ? (
                                <span className="font-medium text-amber-700/70">
                                    ({tourData.reviewCount} reviews)
                                </span>
                            ) : null}
                        </span>
                    )}
                </div>

                {/* --- Content/Sidebar Split --- */}
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
                    {/* LEFT/MIDDLE COLUMN - Tour Details (Part 1: Up to Route Map) */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1">
                        {tourData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tourData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <PackageOverview
                            duration={tourData.duration}
                            tourType={tourData.tourType}
                            tourCategory={tourData.tourCategory}
                            maxPersons={tourData.maxPersons}
                            ageRange={tourData.ageRange}
                            flightsIncluded={tourData.flightsIncluded}
                            accommodation={tourData.accommodation}
                            isCustomizable={tourData.isCustomizable}
                            departurePoints={tourData.departurePoints}
                            destinationName={tourData.destination?.name}
                            cities={tourData.destinations}
                        />

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
                        <div className="lg:sticky lg:top-20 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                            {/* Price header, set apart from the actions below it */}
                            <div className="bg-gradient-to-r from-[#6d28d9] via-[#5b21b6] to-[#3b1370] px-5 py-5 md:px-6">
                                {saving > 0 && (
                                    <span className="inline-block bg-white text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
                                        Save ₹{saving.toLocaleString("en-IN")}
                                    </span>
                                )}
                                <p className="text-xs text-white/60">Starting from</p>
                                <p className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl md:text-4xl font-bold text-white leading-none">
                                        ₹{tourData.price.toLocaleString("en-IN")}
                                    </span>
                                    {saving > 0 && tourData.originalPrice && (
                                        <span className="text-base text-white/45 line-through">
                                            ₹{tourData.originalPrice.toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-white/60 mt-1.5">per person · {tourData.duration}</p>
                            </div>

                            <div className="p-5 md:p-6">
                                <Link
                                    href="#availability"
                                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors"
                                >
                                    <CalendarDays size={17} aria-hidden="true" />
                                    Check availability
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowEnquiryDialog(true)}
                                    className="flex items-center justify-center gap-2 w-full border border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-xl transition-colors mt-2.5"
                                >
                                    <MessageCircle size={17} aria-hidden="true" />
                                    Ask a question
                                </button>

                                <ul className="space-y-2.5 mt-5 pt-5 border-t border-gray-100">
                                    {tourData.bestPrice && (
                                        <li className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <ShieldCheck size={16} className="text-primary shrink-0" aria-hidden="true" />
                                            Best price guaranteed
                                        </li>
                                    )}
                                    <li className="flex items-center gap-2.5 text-sm text-gray-700">
                                        <Wallet size={16} className="text-primary shrink-0" aria-hidden="true" />
                                        Book with 30% now
                                    </li>
                                    <li className="flex items-center gap-2.5 text-sm text-gray-700">
                                        <CreditCard size={16} className="text-primary shrink-0" aria-hidden="true" />
                                        EMI options available
                                    </li>
                                    {tourData.isCustomizable && (
                                        <li className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <Sparkles size={16} className="text-primary shrink-0" aria-hidden="true" />
                                            Itinerary can be customised
                                        </li>
                                    )}
                                </ul>

                                <div className="flex gap-2.5 mt-5 pt-5 border-t border-gray-100">
                                    <Baby size={16} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        <span className="font-semibold text-gray-700">Children:</span> ages 6–12 may
                                        incur extra charges; under 6 travel free.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LEFT/MIDDLE COLUMN - Tour Details (Part 2: After Route Map) */}
                    <div className="lg:col-span-2 space-y-7 md:space-y-9 order-3">
                        {/* --- About --- */}
                        {tourData.description && (
                            <PackageSection title="About this trip" bordered={false}>
                                <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                                    {tourData.description}
                                </p>
                            </PackageSection>
                        )}

                        {/* --- Highlights --- */}
                        {tourData.highlights.length > 0 && (
                            <PackageSection title="Trip highlights">
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {tourData.highlights.map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5"
                                        >
                                            <span className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                                                <Check size={14} strokeWidth={3} aria-hidden="true" />
                                            </span>
                                            <span className="text-sm text-gray-700 leading-relaxed min-w-0">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </PackageSection>
                        )}

                        {/* --- Itinerary --- */}
                        {tourData.itinerary.length > 0 && (
                            <PackageSection title="Day-by-day itinerary" eyebrow="The plan">
                                <PackageItinerary
                                    days={tourData.itinerary}
                                    accommodation={tourData.accommodation}
                                />
                            </PackageSection>
                        )}

                        {/* --- Inclusions & Exclusions --- */}
                        {(inclusions.length > 0 || exclusions.length > 0) && (
                            <PackageSection title="What's included" eyebrow="The fine print">
                                <div className="grid md:grid-cols-2 gap-4 md:gap-5 items-start">
                                    {inclusions.length > 0 && (
                                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                                            <div className="flex items-center gap-2.5 bg-emerald-50 border-b border-emerald-100 px-5 py-3.5">
                                                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                                    <Check size={15} strokeWidth={3} aria-hidden="true" />
                                                </span>
                                                <h3 className="text-sm font-bold text-emerald-900">
                                                    Included in the price
                                                </h3>
                                                <span className="ml-auto text-xs font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full">
                                                    {inclusions.length}
                                                </span>
                                            </div>
                                            <ul className="divide-y divide-gray-100">
                                                {inclusions.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-3 px-5 py-3">
                                                        <Check
                                                            size={15}
                                                            strokeWidth={2.5}
                                                            className="text-emerald-600 shrink-0 mt-0.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="text-sm text-gray-700 leading-relaxed min-w-0">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {exclusions.length > 0 && (
                                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                                            <div className="flex items-center gap-2.5 bg-gray-50 border-b border-gray-200 px-5 py-3.5">
                                                <span className="w-7 h-7 rounded-lg bg-gray-400 text-white flex items-center justify-center shrink-0">
                                                    <Minus size={15} strokeWidth={3} aria-hidden="true" />
                                                </span>
                                                <h3 className="text-sm font-bold text-gray-800">Not included</h3>
                                                <span className="ml-auto text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded-full">
                                                    {exclusions.length}
                                                </span>
                                            </div>
                                            <ul className="divide-y divide-gray-100">
                                                {exclusions.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-3 px-5 py-3">
                                                        <X
                                                            size={15}
                                                            strokeWidth={2.5}
                                                            className="text-gray-400 shrink-0 mt-0.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="text-sm text-gray-600 leading-relaxed min-w-0">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </PackageSection>
                        )}

                        {/* --- Special Notes --- */}
                        {tourData.specialNotes && (
                            <PackageSection title="Good to know" eyebrow="Before you book">
                                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 overflow-hidden">
                                    <div className="flex items-center gap-2.5 bg-amber-100/70 border-b border-amber-200 px-5 py-3.5">
                                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <Info size={15} aria-hidden="true" />
                                        </span>
                                        <h3 className="text-sm font-bold text-amber-900">Worth reading first</h3>
                                    </div>
                                    <ul className="divide-y divide-amber-200/60">
                                        {tourData.specialNotes
                                            .split(/\n+/)
                                            .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                                            .filter(Boolean)
                                            .map((line, index) => (
                                                <li key={index} className="flex items-start gap-3 px-5 py-3">
                                                    <AlertCircle
                                                        size={15}
                                                        className="text-amber-600 shrink-0 mt-0.5"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="text-sm text-amber-900 leading-relaxed min-w-0">
                                                        {line}
                                                    </span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </PackageSection>
                        )}

                        {/* Reviews Section */}
                        <TourDetailsFooter
                            title={readableTitle(tourData.title, tourData.duration)}
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
