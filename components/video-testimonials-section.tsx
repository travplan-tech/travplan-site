'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { useGetVideoReviewsQuery } from '@/lib/api/reviewsApi'

// --- Interfaces ---

interface VideoTestimonial {
    id: number
    video: string
    name: string
    destination: string
}

// --- Utility: Cloudinary Optimizers ---
const getCloudinaryThumbnail = (url: string) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    try {
        const parts = url.split('/upload/');
        if (parts.length !== 2) return url;
        const videoPath = parts[1];
        const imagePath = videoPath.replace(/\.[^/.]+$/, ".jpg");
        return `${parts[0]}/upload/so_auto,c_fill,h_640,w_360,q_auto,f_auto/${imagePath}`;
    } catch (e) {
        return url;
    }
};

const getCloudinaryVideo = (url: string) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    try {
        const parts = url.split('/upload/');
        if (parts.length !== 2) return url;
        // Apply auto format, auto quality, and ensure compatible codec
        return `${parts[0]}/upload/f_auto,q_auto,vc_auto/${parts[1]}`;
    } catch (e) {
        return url;
    }
};

// --- Video Modal Component ---

const VideoModal = ({
    video,
    name,
    destination,
    onClose
}: {
    video: string
    name: string
    destination: string
    onClose: () => void
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // Escape key listener
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [onClose])

    // Body scroll lock
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = originalStyle
        }
    }, [])

    const thumbnailUrl = getCloudinaryThumbnail(video)

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-black rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Video Wrapper */}
                <div className="flex-1 min-h-0 relative flex items-center justify-center">
                    {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            {thumbnailUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={thumbnailUrl}
                                    className="w-full h-full object-contain opacity-50 blur-sm"
                                    alt=""
                                />
                            ) : (
                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            )}
                        </div>
                    )}

                    {/* 
            TECHNIQUE: Standard video tag without complex CSS to avoid mobile bugs.
          */}
                    <video
                        key={video}
                        ref={videoRef}
                        src={getCloudinaryVideo(video)}
                        className="w-full h-full max-h-[70vh] object-contain block mx-auto relative z-10"
                        style={{
                            WebkitTransform: 'translateZ(0)',
                            transform: 'translateZ(0)',
                            backgroundColor: 'black',
                            // Critical iOS Safari fix: forces the rendering engine to attach the video track
                            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                        }}
                        controls
                        autoPlay
                        playsInline
                        crossOrigin="anonymous"
                        // @ts-ignore
                        webkit-playsinline="true"
                        // @ts-ignore
                        x5-playsinline="true"
                        // @ts-ignore
                        x5-video-player-type="h5"
                        // @ts-ignore
                        x5-video-player-fullscreen="true"
                        disablePictureInPicture
                        disableRemotePlayback
                        onLoadedData={() => setIsLoaded(true)}
                        onError={(e) => {
                            console.error("Video loading error:", e);
                            setIsLoaded(true);
                        }}
                    />
                </div>

                {/* Info Bar */}
                <div className="p-6 bg-linear-to-t from-black to-black/50 text-white">
                    <h3 className="text-xl font-bold">{name}</h3>
                    <p className="text-white/70 text-sm mt-1">{destination}</p>
                </div>
            </div>
        </div>
    )
}

const VideoCard = ({
    video,
    name,
    destination,
    onClick,
    disabled = false
}: {
    video: string
    name: string
    destination: string
    onClick: () => void
    disabled?: boolean
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isInView, setIsInView] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    const thumbnailUrl = getCloudinaryThumbnail(video)

    // TECHNIQUE: Singleton Decoder Management
    // Only mount if the parent says we are the active centered card.
    // This guarantees exactly ONE background preview, sparing decoders for the Modal.
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting)
            },
            {
                threshold: 0.1,
                rootMargin: '10px'
            }
        )
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // Handle Play/Pause
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        if (isInView && !disabled) {
            const playPromise = vid.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            }
        } else {
            vid.pause();
            setIsPlaying(false);
        }
    }, [isInView, disabled])

    // Mount logic: Strictly only if NOT disabled AND (isInView)
    const shouldMountVideo = !disabled && isInView;

    return (
        <div
            ref={containerRef}
            className="relative group cursor-pointer transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div
                className="w-[280px] md:w-[280px] aspect-[9/16] bg-gray-950 rounded-[2.5rem] overflow-hidden relative shadow-lg ring-1 ring-black/5 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all"
                style={{
                    // Fix iOS Safari black-video bug when border-radius is applied
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                }}
            >

                {/* 
                  CRITICAL FIX: Always show a high-quality thumbnail as background.
                  This ensures that even if the video is blocked/fails, the user sees an image.
                */}
                {thumbnailUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={thumbnailUrl}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                    />
                )}

                {hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-gray-900 px-4 text-center">
                        <div className="w-10 h-10 mb-2 bg-white/10 rounded-full flex items-center justify-center">
                            <X className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider">Preview Unavailable</span>
                    </div>
                ) : (
                    // Only mount video if in view, but keep it hidden until it actually starts playing
                    shouldMountVideo && (
                        <video
                            ref={videoRef}
                            src={getCloudinaryVideo(video)}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                            loop
                            muted
                            playsInline
                            crossOrigin="anonymous"
                            // @ts-ignore
                            webkit-playsinline="true"
                            // @ts-ignore
                            x5-playsinline="true"
                            // @ts-ignore
                            x5-video-player-type="h5"
                            // @ts-ignore
                            x5-video-player-fullscreen="false"
                            // @ts-ignore
                            x-webkit-airplay="allow"
                            // @ts-ignore
                            airplay="allow"
                            disablePictureInPicture
                            disableRemotePlayback
                            preload="auto"
                            onLoadedData={() => setIsLoaded(true)}
                            onError={() => setHasError(true)}
                        />
                    )
                )}

                {/* Loading Spinner / Play Icon Overlay */}
                {isInView && !isPlaying && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300">
                    <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-widest">{destination}</p>
                    <h4 className="text-lg font-bold leading-tight">{name}</h4>
                </div>

                {/* Play Button Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                    </div>
                </div>

                {/* Mobile Touch Indicator */}
                <div className="md:hidden absolute top-6 right-6">
                    <div className="w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                        <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Main Section Component ---

const VideoTestimonialsSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'center',
        containScroll: 'trimSnaps',
        dragFree: false,
        loop: false
    })

    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null)
    const [sectionInView, setSectionInView] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const isModalOpen = !!selectedVideo

    const sectionRef = useRef<HTMLElement>(null)

    // Fetch reviews
    const { data: testimonials = [], isLoading } = useGetVideoReviewsQuery(undefined, {
        skip: !sectionInView
    })

    // Scroll detection logic
    const onSelect = useCallback((api: any) => {
        setCanScrollPrev(api.canScrollPrev())
        setCanScrollNext(api.canScrollNext())
        setActiveIndex(api.selectedScrollSnap())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        onSelect(emblaApi)
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)
    }, [emblaApi, onSelect])

    // Section lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSectionInView(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 bg-white overflow-hidden"
        >
            <div className="container mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                            Real Stories, <span className="text-primary italic">Real Travelers</span>
                        </h2>
                        <p className="mt-4 text-gray-500 text-lg">
                            Hear directly from our community about their unforgettable journeys.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => emblaApi?.scrollPrev()}
                            disabled={!canScrollPrev}
                            className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center transition-all ${canScrollPrev ? 'hover:bg-primary hover:border-primary hover:text-white' : 'opacity-40 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => emblaApi?.scrollNext()}
                            disabled={!canScrollNext}
                            className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center transition-all ${canScrollNext ? 'hover:bg-primary hover:border-primary hover:text-white' : 'opacity-40 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Carousel Container */}
                {isLoading ? (
                    <div className="flex gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-[280px] aspect-[9/16] bg-gray-100 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : testimonials.length > 0 ? (
                    <div className="embla w-full overflow-hidden" ref={emblaRef}>
                        <div className="embla__container flex">
                            {testimonials.map((testimonial, idx) => (
                                <div key={testimonial.id} className="embla__slide flex-[0_0_100%] md:flex-none md:mr-6 flex justify-center md:block">
                                    <VideoCard
                                        {...testimonial}
                                        onClick={() => setSelectedVideo(testimonial)}
                                        disabled={isModalOpen || activeIndex !== idx}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-gray-400">No testimonials found yet.</p>
                    </div>
                )}
            </div>

            {/* Full-Screen Modal */}
            {selectedVideo && (
                <VideoModal
                    {...selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            <style jsx>{`
        .embla {
          overflow: hidden;
          width: 100%;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          touch-action: pan-y pinch-zoom;
        }
      `}</style>
        </section>
    )
}

export default VideoTestimonialsSection
