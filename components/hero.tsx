"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi";
import { useGetHomepageSettingsQuery } from "@/lib/api/homepageApi";

interface Destination {
  id: number;
  name: string;
  country: string;
  region?: string;
  image?: string;
  tours?: number;
}

const EMPTY_ARRAY: Destination[] = [];

const TRUST_POINTS = ["Best price guarantee", "Verified local operators", "Fully customisable"];

const QUICK_LINKS = [
  { label: "Kashmir", href: "/tours?country=India" },
  { label: "Ladakh", href: "/tours?country=India" },
  { label: "Meghalaya", href: "/tours?country=India" },
  { label: "Kerala", href: "/tours?country=India" },
  { label: "Vietnam", href: "/destinations?country=Vietnam" },
];

const Hero: React.FC = () => {
  const router = useRouter();

  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [tourMode, setTourMode] = useState<"all" | "customized">("all");

  const { data: homepageSettings } = useGetHomepageSettingsQuery();
  const defaultImageUrl =
    "https://images.unsplash.com/photo-1764276266750-4d6316e972e0?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const [shouldFetchDestinations, setShouldFetchDestinations] = useState(false);
  const { data: destinationsData } = useGetDestinationsQuery(undefined, {
    skip: !shouldFetchDestinations,
  });
  const destinations = destinationsData || EMPTY_ARRAY;
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);

  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Array.isArray(destinations)) {
      setFilteredDestinations(destinations as Destination[]);
    } else {
      setFilteredDestinations([]);
    }
  }, [destinations]);

  useEffect(() => {
    if (destinationInput.trim() === "") {
      setFilteredDestinations(destinations as Destination[]);
    } else {
      const query = destinationInput.toLowerCase();
      const safeDestinations = Array.isArray(destinations) ? (destinations as Destination[]) : [];
      setFilteredDestinations(
        safeDestinations.filter(
          (dest) =>
            dest.name.toLowerCase().includes(query) ||
            dest.country.toLowerCase().includes(query) ||
            (dest.region && dest.region.toLowerCase().includes(query))
        )
      );
    }
  }, [destinationInput, destinations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDestinationSelect = (dest: Destination) => {
    setDestinationInput(dest.name);
    setSelectedDestination(dest);
    setShowDestinationDropdown(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedDestination) {
      params.set("destinationId", selectedDestination.id.toString());
    } else if (destinationInput.trim()) {
      params.set("country", destinationInput.trim());
    }
    const queryString = params.toString();
    const base = tourMode === "customized" ? "/trip-planner" : "/tours";
    router.push(`${base}${queryString ? `?${queryString}` : ""}`);
  };

  const imageUrl = homepageSettings?.heroBackgroundImage || defaultImageUrl;

  return (
    <section className="relative w-full min-h-[560px] md:min-h-[640px] lg:min-h-[700px] flex items-center">
      <Image
        src={imageUrl}
        alt="Travplan — curated trips across India and beyond"
        fill
        priority
        sizes="100vw"
        className="object-cover -z-20"
      />
      {/* Two overlays: one darkens the bottom, one darkens the left column where
          the headline and search sit, so white text stays readable over a bright
          sky without flattening the whole photo. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/35 to-transparent"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full mb-5">
            <MapPin size={12} aria-hidden="true" />
            India &amp; beyond
          </p>

          {/* A fixed, descriptive headline: the old one typed a destination
              name one letter at a time, so it was often incomplete. */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.03] drop-shadow-lg">
            Trips worth taking,
            <span className="block text-white/80">planned properly.</span>
          </h1>

          <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-xl mt-5 drop-shadow">
            Curated group departures and private holidays, run with local operators we
            work with every season.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-3xl mt-9 md:mt-11">
          <div className="inline-flex rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 p-1 mb-3">
            {([
              { id: "all", label: "Browse trips" },
              { id: "customized", label: "Plan a custom trip" },
            ] as const).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTourMode(mode.id)}
                aria-pressed={tourMode === mode.id}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tourMode === mode.id
                  ? "bg-white text-gray-900"
                  : "text-white/80 hover:text-white"
                  }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 shadow-2xl">
            <div className="relative flex-1 min-w-0" ref={destinationRef}>
              <MapPin
                size={18}
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={destinationInput}
                onFocus={() => {
                  setShouldFetchDestinations(true);
                  setShowDestinationDropdown(true);
                }}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  setSelectedDestination(null);
                  setShowDestinationDropdown(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Where do you want to go?"
                aria-label="Destination"
                className="w-full h-12 md:h-14 pl-11 pr-4 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              {showDestinationDropdown && filteredDestinations.length > 0 && (
                <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-72 overflow-y-auto">
                  {filteredDestinations.slice(0, 8).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleDestinationSelect(dest)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <MapPin size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">
                          {dest.name}
                        </span>
                        {dest.region && (
                          <span className="block text-xs text-gray-500">{dest.region}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="h-12 md:h-14 px-7 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors shrink-0"
            >
              <Search size={18} aria-hidden="true" />
              {tourMode === "customized" ? "Plan my trip" : "Search"}
            </button>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-white/60 mr-1">Popular:</span>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition-colors"
              >
                {link.label}
                <ArrowRight size={11} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        {/* Trust row replaces the old stats bar, whose figures were unverified */}
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 md:mt-12">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2 text-sm font-medium text-white/85">
              <span className="bg-primary rounded-full p-1 text-white">
                <Check size={11} strokeWidth={3.5} aria-hidden="true" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero;
