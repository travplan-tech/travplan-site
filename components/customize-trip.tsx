"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetExpertsQuery } from '@/lib/api/publicApi';

// --- Interface for Trip Designer Data ---
interface TripDesigner {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  expertise: string[];
  whatsappNumber: string | null;
  type: string;
}

// --- Main Component ---
export default function ExpertTripDesignerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const [selectedType, setSelectedType] = useState<'DOMESTIC' | 'INTERNATIONAL'>('INTERNATIONAL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // IntersectionObserver to detect when section enters viewport
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mounted = true;

    // Wait multiple frames for layout to fully settle
    const setupObserver = () => {
      if (!mounted) return;

      const element = sectionRef.current;
      if (!element) return;

      // Get element position after layout has settled
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if element top is significantly below the viewport
      // Use a threshold of 200px to be safe
      const isBelowViewport = rect.top > viewportHeight + 200;

      if (!isBelowViewport) {
        // Element is visible or close to viewport, fetch immediately
        setIsInView(true);
        return;
      }

      // Set up observer for when user scrolls to it
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && mounted) {
            setIsInView(true);
            observer?.disconnect();
          }
        },
        { rootMargin: '100px' }
      );

      observer.observe(element);
    };

    // Use double RAF to ensure layout is complete
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(setupObserver);
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);

  // RTK Query hook - only fetch when in view
  const { data: expertsData, isLoading: loading } = useGetExpertsQuery(selectedType, {
    skip: !isInView
  });

  // Cast experts data
  const designers = useMemo(() => {
    if (!expertsData) return [];
    return expertsData as TripDesigner[];
  }, [expertsData]);

  // Handle responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // Tablet: 2 items
      } else {
        setItemsPerPage(4); // Desktop: 4 items
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset current index when type changes or designers change
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedType, designers.length]);

  // Calculate max index for navigation
  const maxIndex = Math.max(0, designers.length - itemsPerPage);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  // Check if navigation buttons should be disabled
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = designers.length <= itemsPerPage || currentIndex >= maxIndex;

  // Get unique countries from all experts for tags (normalized to prevent duplicates)
  const countryTags = useMemo(() => {
    const allExpertise = designers.flatMap((d) => d.expertise);
    const seenNormalized = new Set<string>();
    const uniqueTags: string[] = [];

    for (const tag of allExpertise) {
      const normalized = tag.trim().toLowerCase();
      if (normalized && !seenNormalized.has(normalized)) {
        seenNormalized.add(normalized);
        // Store the original (or title-cased) version
        uniqueTags.push(tag.trim());
      }
    }

    return uniqueTags.slice(0, 12);
  }, [designers]);

  return (
    <div ref={sectionRef} id='customize-trip' className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white p-4 md:p-6">

        {/* --- Header and Toggle Buttons --- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 md:mb-4">
          <div className="">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Customize Your Trip With <span className="text-primary">Expert</span>
            </h2>
            <p className="text-sm md:text-base max-w-2xl text-gray-600 mt-2">
              Not sure where to start? We will help you decide. Tell us your budget, date and travel style our expert will suggest the best option.
            </p>
          </div>

          {/* Domestic/International Toggle */}
          <div className='flex justify-between items-center mt-3 md:mt-0 md:flex-col md:items-end'>
            <div className="max-w-fit flex h-10 md:h-12">
              <button
                onClick={() => setSelectedType('DOMESTIC')}
                className={`font-semibold px-3 md:px-6 rounded-l-md flex items-center transition-colors text-sm md:text-base ${selectedType === 'DOMESTIC'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <span>Domestic</span>
              </button>
              <button
                onClick={() => setSelectedType('INTERNATIONAL')}
                className={`font-semibold px-3 md:px-6 rounded-r-md flex items-center transition-colors text-sm md:text-base ${selectedType === 'INTERNATIONAL'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <span>International</span>
              </button>
            </div>
            <div className="flex gap-2 md:mt-4 justify-end">
              <button
                onClick={handlePrev}
                disabled={isPrevDisabled}
                aria-label="Previous expert"
                className={`p-2 border border-gray-300 shrink-0 rounded-full transition ${isPrevDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-500 hover:bg-gray-100 hover:border-primary hover:text-primary'
                  }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                disabled={isNextDisabled}
                aria-label="Next expert"
                className={`p-2 border border-gray-300 shrink-0 rounded-full transition ${isNextDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-500 hover:bg-gray-100 hover:border-primary hover:text-primary'
                  }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Loading State --- */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* --- No Experts State --- */}
        {!loading && designers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {selectedType.toLowerCase()} experts available at the moment.</p>
          </div>
        )}

        {/* --- Experts Carousel --- */}
        {!loading && designers.length > 0 && (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out cursor-grab active:cursor-grabbing"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const startX = touch.clientX;
                const onTouchMove = (e: TouchEvent) => {
                  const currentX = e.touches[0].clientX;
                  if (Math.abs(startX - currentX) > 50) {
                    if (startX - currentX > 0) {
                      handleNext();
                    } else {
                      handlePrev();
                    }
                    document.removeEventListener('touchmove', onTouchMove);
                  }
                };
                document.addEventListener('touchmove', onTouchMove);
                document.addEventListener('touchend', () => {
                  document.removeEventListener('touchmove', onTouchMove);
                }, { once: true });
              }}
            >
              {designers.map((designer) => (
                <div
                  key={designer.id}
                  className="shrink-0 px-2 md:px-3 pb-2"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <div className="bg-white rounded-lg flex flex-col flex-1 p-3 border border-gray-100 shadow-md h-full">

                    <div className='flex-1'>
                      {/* Profile Image */}
                      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100">
                        {designer.avatar ? (
                          <Image
                            src={designer.avatar}
                            alt={designer.name}
                            width={300}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary">
                              {designer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Text Content */}
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight mb-2">
                        {designer.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">
                        {designer.bio || 'Expert travel designer ready to help you plan your perfect trip.'}
                      </p>
                      {/* Expertise Tags */}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {designer.expertise.slice(0, 3).map((country) => (
                        <span
                          key={country}
                          className="text-xs py-0.5 px-2 bg-gray-100 text-gray-700 rounded-md font-medium"
                        >
                          {country}
                        </span>
                      ))}
                      {designer.expertise.length > 3 && (
                        <span className="text-xs py-0.5 px-2 text-gray-500">
                          +{designer.expertise.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Connect with Expert via WhatsApp */}
                    <a
                      href={`https://wa.me/${designer.whatsappNumber || '919999999999'}?text=Hi%20${encodeURIComponent(designer.name)},%20I%20would%20like%20to%20customize%20my%20trip.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-fit items-center gap-2 text-sm font-medium text-white bg-[#25D366] hover:bg-[#128C7E] px-4 py-2 rounded-full transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Connect with expert
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots Indicator for Mobile */}
            {designers.length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(designers.length - itemsPerPage + 1) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index
                      ? 'bg-primary w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}