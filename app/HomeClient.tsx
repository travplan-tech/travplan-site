"use client";

import dynamic from "next/dynamic";
import {
    CardGridSkeleton,
    TourTypesSkeleton,
    TravelInfoSkeleton,
    CustomizeTripSkeleton,
    CarouselSkeleton,
    VideoTestimonialsSkeleton,
    GallerySkeleton,
} from "@/components/loading-skeletons";

// Dynamic imports with ssr: false to reduce initial load time
const ToursByBudget = dynamic(() => import("@/components/tours-by-budget"), {
    loading: () => <CardGridSkeleton cards={2} />,
    ssr: false,
});

const TourCategories = dynamic(() => import("@/components/tour-categories"), {
    loading: () => <CardGridSkeleton cards={2} />,
    ssr: false,
});

const GroupTours = dynamic(() => import("@/components/group-tours"), {
    loading: () => <CardGridSkeleton cards={2} />,
    ssr: false,
});

const TravelInfoSection = dynamic(() => import("@/components/travel-info"), {
    loading: () => <TravelInfoSkeleton />,
    ssr: false,
});

const CustomizeTrip = dynamic(() => import("@/components/customize-trip"), {
    loading: () => <CustomizeTripSkeleton />,
    ssr: false,
});

const TopRated = dynamic(() => import("@/components/top-rated"), {
    loading: () => <CarouselSkeleton items={3} />,
    ssr: false,
});

const TailoredTours = dynamic(() => import("@/components/tailored-tours"), {
    loading: () => <TourTypesSkeleton />,
    ssr: false,
});

const VideoTestimonialsSection = dynamic(
    () => import("@/components/video-testimonials-section"),
    {
        loading: () => <VideoTestimonialsSkeleton />,
        ssr: false
    }
);

const Gallery = dynamic(() => import("@/components/gallery"), {
    loading: () => <GallerySkeleton />,
    ssr: false,
});

const DestinationsCarousel = dynamic(() => import("@/components/destinations-carousel"), {
    loading: () => <CarouselSkeleton />,
    ssr: false,
});

export default function HomeClient() {
    return (
        <>
            <ToursByBudget />
            <TourCategories />
            <DestinationsCarousel />
            <TravelInfoSection />
            <CustomizeTrip />
            {/* <TopRated /> */}
            <TailoredTours />
            <VideoTestimonialsSection />
            <Gallery />
        </>
    );
}
