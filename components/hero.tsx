"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, MapPin, Clock, ChevronDown } from "lucide-react";
import { Arimo, Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi";
import { useGetHomepageSettingsQuery } from "@/lib/api/homepageApi";

// Arial-like font for headings
const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Helvetica-like font for text
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const heroDestinations = ["Bali", "India", "Thailand", "Japan", "Maldives"];

interface Destination {
  id: number;
  name: string;
  country: string;
  region?: string;
  image?: string;
  tours?: number;
}

const EMPTY_ARRAY: Destination[] = [];

const Hero: React.FC = () => {
  const router = useRouter();

  // Typing animation states
  const [currentDestination, setCurrentDestination] = useState("");
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Search form states
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [tourMode, setTourMode] = useState<"all" | "customized">("all");

  // Homepage settings - hero background image
  const { data: homepageSettings } = useGetHomepageSettingsQuery();
  const defaultImageUrl = "https://images.unsplash.com/photo-1764276266750-4d6316e972e0?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Destinations data - using RTK Query
  const [shouldFetchDestinations, setShouldFetchDestinations] = useState(false);
  const { data: destinationsData, isLoading: isLoadingDestinations } = useGetDestinationsQuery(undefined, {
    skip: !shouldFetchDestinations
  });
  const destinations = destinationsData || EMPTY_ARRAY;
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);

  // Refs for click outside detection
  const destinationRef = useRef<HTMLDivElement>(null);

  // Typing animation effect
  useEffect(() => {
    const currentWord = heroDestinations[destinationIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (currentDestination.length < currentWord.length) {
          setCurrentDestination(currentWord.slice(0, currentDestination.length + 1));
          setTypingSpeed(150);
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentDestination.length > 0) {
          setCurrentDestination(currentWord.slice(0, currentDestination.length - 1));
          setTypingSpeed(75);
        } else {
          setIsDeleting(false);
          setDestinationIndex((prev) => (prev + 1) % heroDestinations.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentDestination, destinationIndex, isDeleting, typingSpeed]);

  // Update filtered destinations when destinations data changes
  useEffect(() => {
    if (Array.isArray(destinations)) {
      setFilteredDestinations(destinations as Destination[]);
    } else {
      setFilteredDestinations([]);
    }
  }, [destinations]);

  // Filter destinations based on input
  useEffect(() => {
    if (destinationInput.trim() === "") {
      setFilteredDestinations(destinations as Destination[]);
    } else {
      const query = destinationInput.toLowerCase();
      const safeDestinations = Array.isArray(destinations) ? (destinations as Destination[]) : [];
      const filtered = safeDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(query) ||
          dest.country.toLowerCase().includes(query) ||
          (dest.region && dest.region.toLowerCase().includes(query))
      );
      setFilteredDestinations(filtered);
    }
  }, [destinationInput, destinations]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle destination selection
  const handleDestinationSelect = (dest: Destination) => {
    setDestinationInput(`${dest.name}`);
    setSelectedDestination(dest);
    setShowDestinationDropdown(false);
  };

  // Handle search
  const handleSearch = () => {
    if (tourMode === "customized") {
      // Redirect to trip planner
      const params = new URLSearchParams();
      if (selectedDestination) {
        // If a destination is selected from dropdown, use destinationId
        params.set("destinationId", selectedDestination.id.toString());
      } else if (destinationInput.trim()) {
        // If just typed text, use country
        params.set("country", destinationInput.trim());
      }
      const queryString = params.toString();
      router.push(`/trip-planner${queryString ? `?${queryString}` : ""}`);
    } else {
      // Regular tour search
      const params = new URLSearchParams();
      if (selectedDestination) {
        // If a destination is selected from dropdown, use destinationId
        params.set("destinationId", selectedDestination.id.toString());
      } else if (destinationInput.trim()) {
        // If just typed text, use country
        params.set("country", destinationInput.trim());
      }
      const queryString = params.toString();
      router.push(`/tours${queryString ? `?${queryString}` : ""}`);
    }
  };

  // Use dynamic hero background image from settings, fallback to default
  const imageUrl = homepageSettings?.heroBackgroundImage || defaultImageUrl;

  return (
    // Outer container with background image and overlay
    <div
      className="relative pt-16 md:pt-20 pb-44 md:pb-40 flex justify-center items-center text-white px-4"
    >
      {/* Optimized background image using Next.js Image */}
      <Image
        src={imageUrl}
        alt="Travel destination background"
        fill
        priority
        fetchPriority="high"
        quality={75}
        sizes="100vw"
        className="object-cover object-center -z-10"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30 -z-10" />
      <div className="max-w-7xl relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-0">
        {/* Title and Subtitle */}
        {tourMode === "all" ? (
          <>
            <h1 className={`${arimo.className} text-3xl md:text-4xl lg:text-6xl font-heading font-bold mb-5`}>
              <span className="block md:inline">Book Your Trip to{" "}</span>
              <span className="text-primary">{currentDestination}</span>
              <span className="animate-pulse text-primary">|</span>
            </h1>
          </>
        ) : (
          <>
            <h1 className={`${arimo.className} text-2xl md:text-4xl lg:text-6xl font-bold mb-2`}>
              Create Your{" "}
              <span className="text-primary">Dream Trip</span>
            </h1>
            <p className={`${roboto.className} text-sm md:text-lg lg:text-xl mb-6 md:mb-8`}>
              Plan a fully customized trip with a local travel expert. Tell us where you want to go!
            </p>
          </>
        )}

        {/* --- Search Bar / Input Row --- */}
        <div className="flex flex-col md:flex-row bg-white rounded-md shadow-xl md:h-16 w-full relative z-20">
          {/* Destination Input Group */}
          <div ref={destinationRef} className="relative flex items-center p-3 md:p-4 grow border-b md:border-b-0 md:border-r border-gray-200">
            <MapPin className="text-gray-700 text-lg md:text-xl mr-2 md:mr-3 shrink-0" />
            <div className="flex flex-col text-left grow">
              <label className="text-[10px] font-heading md:text-xs text-gray-500 font-semibold uppercase">
                Destination or Activity
              </label>
              <input
                type="text"
                placeholder="Where would you like to go?"
                className="text-sm md:text-base text-gray-800 placeholder-gray-400 focus:outline-none w-full"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onFocus={() => {
                  setShowDestinationDropdown(true);
                  setShouldFetchDestinations(true);
                }}
              />
            </div>
            <ChevronDown
              className={`text-gray-400 w-5 h-5 transition-transform cursor-pointer ${showDestinationDropdown ? 'rotate-180' : ''}`}
              onClick={() => {
                setShowDestinationDropdown(!showDestinationDropdown);
                setShouldFetchDestinations(true);
              }}
            />

            {/* Destination Dropdown */}
            {showDestinationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl border border-gray-100 max-h-72 overflow-y-auto z-50">
                {isLoadingDestinations ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading destinations...
                  </div>
                ) : filteredDestinations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No destinations found
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredDestinations.map((dest) => (
                      <button
                        key={dest.id}
                        className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors flex items-center gap-3 group"
                        onClick={() => handleDestinationSelect(dest)}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {dest.image ? (
                            <img
                              src={dest.image}
                              alt={dest.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-800 font-medium group-hover:text-primary transition-colors">
                            {dest.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dest.country} {dest.tours ? `• ${dest.tours} tours` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            className="bg-primary m-2 hover:bg-primary/80 text-white font-heading font-medium text-base md:text-lg px-4 md:px-8 py-3 md:py-0 rounded-md transition duration-200 flex items-center justify-center"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            {tourMode === "all" ? "Search" : "Plan My Trip"}
          </button>
        </div>

        {/* Tour Type Buttons */}
        <div className="flex justify-start border border-white font-heading rounded-full max-w-fit w-full mt-4">
          <button
            className={`font-semibold py-1.5 md:py-2 px-3 md:px-5 text-xs md:text-base rounded-full transition duration-200 ${tourMode === "all"
              ? "bg-white text-gray-800 shadow-md"
              : "bg-transparent text-white hover:bg-white/20"
              }`}
            onClick={() => setTourMode("all")}
          >
            All Tours
          </button>
          <button
            className={`font-semibold py-1.5 md:py-2 px-3 md:px-5 text-xs md:text-base rounded-full transition duration-200 ${tourMode === "customized"
              ? "bg-white text-gray-800 shadow-md"
              : "bg-transparent text-white hover:bg-white/20"
              }`}
            onClick={() => setTourMode("customized")}
          >
            Customized Tours
          </button>
        </div>
      </div>
      {/* Stats Bar */}
      <div className="absolute bottom-0 w-full py-4 md:py-5 bg-primary/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center flex-wrap gap-6 md:gap-4">
          {/* Reviews */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-8 md:h-8">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="white" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" />
              </svg>
            </div>
            <div className="text-white">
              <span className="text-xl md:text-2xl font-bold font-heading">4.9</span>
              <p className="text-xs md:text-sm text-gray-300">Ratings</p>
            </div>
          </div>

          {/* Destinations */}
          <div className="flex items-center space-x-3 mr-4 md:mr-0">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div className="text-white">
              <span className="text-xl md:text-2xl font-bold">50+</span>
              <p className="text-xs md:text-sm text-gray-300">Destinations</p>
            </div>
          </div>

          {/* Satisfied Travelers */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div className="text-white">
              <span className="text-xl md:text-2xl font-bold">10000+</span>
              <p className="text-xs md:text-sm text-gray-300">Satisfied Travelers</p>
            </div>
          </div>

          {/* Years Experience */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="text-white">
              <span className="text-xl md:text-2xl font-bold">5 Years+</span>
              <p className="text-xs md:text-sm text-gray-300">Experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
