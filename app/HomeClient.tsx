/**
 * The homepage sections below the hero.
 *
 * These used to be loaded with next/dynamic and `ssr: false`, which meant none
 * of the content existed in the HTML: a visitor got skeletons, then waited for
 * JS, then for each section to scroll into view, then for an API round trip.
 * They are now rendered on the server from prefetched data, so the page is
 * complete in the static HTML and the client queries are skipped entirely.
 *
 * This is a server component — the sections themselves are still client
 * components for their carousels and observers, but they receive their data as
 * props rather than fetching it.
 */
import ToursByBudget from "@/components/tours-by-budget"
import TourCategories from "@/components/tour-categories"
import DestinationsCarousel from "@/components/destinations-carousel"
import TravelInfoSection from "@/components/travel-info"
import PlanWithUs from "@/components/destination-plan"
import TailoredTours from "@/components/tailored-tours"
import VideoTestimonialsSection from "@/components/video-testimonials-section"
import Gallery from "@/components/gallery"
import type {
    BudgetStats,
    DestinationCard,
    ExpertCard,
    FeatureBox,
    VideoReview,
} from "@/lib/home-data"

/**
 * Every field is optional. A loader returns null when the database was
 * unreachable, and the section then falls back to fetching on the client
 * rather than rendering empty.
 */
export interface HomeData {
    budgetStats?: BudgetStats
    tourTypeStats?: Record<string, number>
    destinations?: DestinationCard[]
    featureBoxes?: FeatureBox[]
    homepageSettings?: Record<string, string>
    videoReviews?: VideoReview[]
    experts?: ExpertCard[]
}

export default function HomeClient({ data }: { data: HomeData }) {
    return (
        <>
            <ToursByBudget initialStats={data.budgetStats} />
            <TourCategories />
            <DestinationsCarousel initialDestinations={data.destinations} />
            <TravelInfoSection
                initialFeatureBoxes={data.featureBoxes}
                initialSettings={data.homepageSettings}
            />
            <PlanWithUs initialExperts={data.experts} />
            <TailoredTours initialStats={data.tourTypeStats} />
            <VideoTestimonialsSection initialTestimonials={data.videoReviews} />
            <Gallery />
        </>
    )
}
