"use client";
import Link from "next/link";
import { Menu, X, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useGetDestinationsByRegionQuery, useGetDestinationsByCountryQuery } from "@/lib/api/destinationsApi";

// Define regions and their display order
const REGIONS = [
  "Europe",
  "Asia",
  "South America",
  "Africa",
  "North America",
  "Oceania",
];

interface Destination {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  region: string | null;
}

interface HeaderProps {
  initialActiveSale?: { name: string; slug: string } | null;
}

export default function Header({ initialActiveSale }: HeaderProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isGroupToursOpen, setIsGroupToursOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const groupToursRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  // Mobile: Track expanded regions to show full list
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);

  // Optimize: Only fetch when user interacts
  const [shouldFetchDestinations, setShouldFetchDestinations] = useState(false);

  // RTK Query hooks
  const { data: destinationsData, isLoading } = useGetDestinationsByRegionQuery(undefined, {
    skip: !shouldFetchDestinations
  });

  // Fetch Indian destinations (cities) - filter out the country entry itself
  const { data: indiaDestinationsRaw, isLoading: isLoadingIndia } = useGetDestinationsByCountryQuery("India", {
    skip: !shouldFetchDestinations
  });

  // Filter out "India" country entry, only keep cities/states
  const indiaDestinations = useMemo(() => {
    return (indiaDestinationsRaw || []).filter(
      (dest) => dest.name.toLowerCase() !== "india"
    );
  }, [indiaDestinationsRaw]);

  // Safe type casting and deduplication
  const destinations = useMemo(() => {
    const data = (destinationsData || {}) as Record<string, Destination[]>;
    const result: Record<string, Destination[]> = {};

    Object.keys(data).forEach((region) => {
      const uniqueMap = new Map();
      (data[region] || []).forEach((dest) => {
        // Only include country-level destinations (not cities)
        // A destination is a country if it has no city field or if the name matches the country
        const isCountry = !dest.city || dest.name === dest.country;

        if (dest.name && isCountry) {
          const key = dest.name.trim().toLowerCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, dest);
          }
        }
      });
      result[region] = Array.from(uniqueMap.values());
    });

    return result;
  }, [destinationsData]);

  // Use SSR-provided sale data (no delay needed)
  const activeSale = initialActiveSale ?? null;

  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle on desktop (md and above = 768px+)
      if (window.innerWidth < 768) return;

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDestinationsOpen(false);
        setSelectedRegion(null);
      }
      if (groupToursRef.current && !groupToursRef.current.contains(event.target as Node)) {
        setIsGroupToursOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
    setIsDestinationsOpen(false);
    setIsGroupToursOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2"
          >
            <Image
              src="/logo-purple.webp"
              alt="Travplan Logo"
              width={40}
              height={40}
              className="object-cover h-auto w-8 md:w-12"
            />
            <span className="font-bold text-gray-900 md:text-lg"><span className="text-primary">TRAV</span>PLAN</span>
          </Link>


          <nav className="hidden md:flex text-black font-medium items-center space-x-8">
            {/* Destinations Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setShouldFetchDestinations(true)}
            >
              <button
                onClick={() => {
                  setShouldFetchDestinations(true);
                  setIsDestinationsOpen(!isDestinationsOpen);
                }}
                className="flex items-center gap-1 hover:text-primary transition"
              >
                Destinations
                <ChevronDown size={16} className={`transition-transform ${isDestinationsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {isDestinationsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-[1050px] bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
                  {!selectedRegion ? (
                    /* Level 1: All Regions Overview */
                    <div className="grid grid-cols-7 gap-6">
                      {/* India Column */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-1">
                          <Image src="https://flagcdn.com/w40/in.png" alt="India flag" width={20} height={15} className="inline-block mr-1" /> India
                        </h3>
                        <ul className="space-y-2">
                          {isLoadingIndia ? (
                            <li className="text-gray-400 text-sm">Loading...</li>
                          ) : (
                            <>
                              {(indiaDestinations || []).slice(0, 5).map((dest) => (
                                <li key={dest.id}>
                                  <Link
                                    href={`/destinations/trip?destination=${dest.id}`}
                                    className="text-gray-600 hover:text-primary text-sm transition"
                                    onClick={() => setIsDestinationsOpen(false)}
                                  >
                                    {dest.city || dest.name}
                                  </Link>
                                </li>
                              ))}
                              {(indiaDestinations?.length || 0) > 5 && (
                                <li>
                                  <button
                                    onClick={() => setSelectedRegion("India")}
                                    className="text-primary hover:text-primary/80 text-sm font-medium transition flex items-center gap-1"
                                  >
                                    See All
                                  </button>
                                </li>
                              )}
                            </>
                          )}
                        </ul>
                      </div>
                      {REGIONS.map((region) => (
                        <div key={region}>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">{region}</h3>
                          <ul className="space-y-2">
                            {isLoading ? (
                              <li className="text-gray-400 text-sm">Loading...</li>
                            ) : (
                              <>
                                {(destinations[region] || []).slice(0, 5).map((dest) => (
                                  <li key={dest.id}>
                                    <Link
                                      href={`/destinations?country=${encodeURIComponent(dest.country || dest.name)}`}
                                      className="text-gray-600 hover:text-primary text-sm transition"
                                      onClick={() => setIsDestinationsOpen(false)}
                                    >
                                      {dest.name}
                                    </Link>
                                  </li>
                                ))}
                                {(destinations[region]?.length || 0) > 5 && (
                                  <li>
                                    <button
                                      onClick={() => setSelectedRegion(region)}
                                      className="text-primary hover:text-primary/80 text-sm font-medium transition flex items-center gap-1"
                                    >
                                      See All
                                    </button>
                                  </li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : selectedRegion === "India" ? (
                    /* Level 2: India Cities Detail View */
                    <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                      {/* Back Button & Header */}
                      <div className="flex items-center gap-2 mb-6">
                        <button
                          onClick={() => setSelectedRegion(null)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <ChevronDown size={20} className="rotate-90 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Image src="https://flagcdn.com/w40/in.png" alt="India flag" width={24} height={18} className="inline-block" /> India
                        </h2>
                      </div>

                      {/* Full List of Indian Cities Grid */}
                      <div className="grid grid-cols-5 gap-y-3 gap-x-8 mb-8">
                        {(indiaDestinations || []).map((dest) => (
                          <Link
                            key={dest.id}
                            href={`/destinations/trip?destination=${dest.id}`}
                            className="text-gray-700 hover:text-primary text-sm transition block"
                            onClick={() => {
                              setIsDestinationsOpen(false);
                              setSelectedRegion(null);
                            }}
                          >
                            {dest.city || dest.name}
                          </Link>
                        ))}
                      </div>

                      {/* Footer Link */}
                      <div>
                        <Link
                          href="/destinations?country=India"
                          className="text-primary font-bold hover:underline"
                          onClick={() => {
                            setIsDestinationsOpen(false);
                            setSelectedRegion(null);
                          }}
                        >
                          See All India Tours
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Level 2: Specific Region Detail View */
                    <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                      {/* Back Button & Header */}
                      <div className="flex items-center gap-2 mb-6">
                        <button
                          onClick={() => setSelectedRegion(null)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <ChevronDown size={20} className="rotate-90 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">{selectedRegion}</h2>
                      </div>

                      {/* Full List of Countries Grid */}
                      <div className="grid grid-cols-5 gap-y-3 gap-x-8 mb-8">
                        {(destinations[selectedRegion] || []).map((dest) => (
                          <Link
                            key={dest.id}
                            href={`/destinations?country=${encodeURIComponent(dest.country || dest.name)}`}
                            className="text-gray-700 hover:text-primary text-sm transition block"
                            onClick={() => {
                              setIsDestinationsOpen(false);
                              setSelectedRegion(null);
                            }}
                          >
                            {dest.name}
                          </Link>
                        ))}
                      </div>

                      {/* Footer Link */}
                      <div>
                        <Link
                          href={`/destinations?region=${encodeURIComponent(selectedRegion)}`}
                          className="text-primary font-bold hover:underline"
                          onClick={() => {
                            setIsDestinationsOpen(false);
                            setSelectedRegion(null);
                          }}
                        >
                          See All {selectedRegion} Tours
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Group Tours Dropdown */}
            <div
              className="relative"
              ref={groupToursRef}
            >
              <button
                onClick={() => setIsGroupToursOpen(!isGroupToursOpen)}
                className="flex items-center gap-1 hover:text-primary transition"
              >
                Group Tours
                <ChevronDown size={16} className={`transition-transform ${isGroupToursOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Group Tours Dropdown Menu */}
              {isGroupToursOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    href="/destinations?tourCategory=GROUP&country=India"
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-primary/10 hover:text-primary transition"
                    onClick={() => setIsGroupToursOpen(false)}
                  >
                    <Image src="https://flagcdn.com/w40/in.png" alt="India flag" width={20} height={15} className="inline-block" />
                    Domestic
                  </Link>
                  <Link
                    href="/destinations?tourCategory=GROUP&excludeCountry=India"
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-primary/10 hover:text-primary transition"
                    onClick={() => setIsGroupToursOpen(false)}
                  >
                    <span className="text-lg">🌍</span>
                    International
                  </Link>
                </div>
              )}
            </div>

            <Link href="/about" className="hover:text-primary transition">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-primary transition">
              Contact Us
            </Link>

            {/* Dynamic Sale Button */}
            {activeSale && (
              <Link
                href={`/deals/${activeSale.slug}`}
                className="relative inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-600 transition-all animate-pulse hover:animate-none shadow-lg"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-300"></span>
                </span>
                {activeSale.name}
              </Link>
            )}

            {isAuthenticated ? (
              /* Logged in - Show Account Dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition"
                >
                  <User size={18} />
                  <span>{session.user?.name || "Account"}</span>
                  <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Show user email */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>

                    {/* Admin Panel Button - Only for admins */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Admin Panel
                      </Link>
                    )}

                    <hr className="my-2" />

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in - Show Login Button only */
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition"
              >
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
          </nav>

          <button
            onClick={() => {
              if (isOpen) {
                // Closing menu - reset both states
                setIsOpen(false);
                setIsDestinationsOpen(false);
              } else {
                // Opening menu
                setIsOpen(true);
              }
            }}
            className="md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 mt-2 space-y-2">
            {/* Mobile Destinations Accordion */}
            <div>
              <button
                onClick={() => {
                  setIsDestinationsOpen(!isDestinationsOpen);
                  setShouldFetchDestinations(true);
                }}
                className="flex items-center justify-between w-full py-2 hover:text-primary"
              >
                Destinations
                <ChevronDown size={20} className={`transition-transform ${isDestinationsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDestinationsOpen && (
                <div className="pl-4 space-y-2 pb-2">
                  {/* India Section */}
                  <div className="py-1">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Image src="https://flagcdn.com/w40/in.png" alt="India flag" width={16} height={12} className="inline-block mr-1" /> India
                    </p>
                    <div className="pl-2 space-y-1">
                      {(() => {
                        const indiaDests = indiaDestinations || [];
                        const isExpanded = expandedRegions.includes("India");
                        const visibleDestinations = isExpanded ? indiaDests : indiaDests.slice(0, 4);

                        return (
                          <>
                            {visibleDestinations.map((dest) => (
                              <Link
                                key={dest.id}
                                href={`/destinations/trip?destination=${dest.id}`}
                                className="block text-sm text-gray-600 hover:text-primary py-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOpen(false);
                                  setIsDestinationsOpen(false);
                                }}
                              >
                                {dest.city || dest.name}
                              </Link>
                            ))}

                            {/* "See All" logic */}
                            {indiaDests.length > 4 && (
                              <>
                                {!isExpanded ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedRegions([...expandedRegions, "India"]);
                                    }}
                                    className="block text-sm font-medium text-primary hover:text-primary/80 py-0.5 text-left"
                                  >
                                    See All
                                  </button>
                                ) : (
                                  <Link
                                    href="/destinations?country=India"
                                    className="block text-sm font-bold text-primary hover:underline py-1 mt-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsOpen(false);
                                      setIsDestinationsOpen(false);
                                    }}
                                  >
                                    See All India Tours →
                                  </Link>
                                )}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {REGIONS.map((region) => (
                    <div key={region} className="py-1">
                      <p className="text-sm font-semibold text-gray-700">{region}</p>
                      <div className="pl-2 space-y-1">
                        {(() => {
                          const regionDestinations = destinations[region] || [];
                          const isExpanded = expandedRegions.includes(region);
                          const visibleDestinations = isExpanded ? regionDestinations : regionDestinations.slice(0, 4);

                          return (
                            <>
                              {visibleDestinations.map((dest) => (
                                <Link
                                  key={dest.id}
                                  href={`/destinations?country=${encodeURIComponent(dest.country || dest.name)}`}
                                  className="block text-sm text-gray-600 hover:text-primary py-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    setIsDestinationsOpen(false);
                                  }}
                                >
                                  {dest.country || dest.name}
                                </Link>
                              ))}

                              {/* "See All" logic */}
                              {regionDestinations.length > 4 && (
                                <>
                                  {!isExpanded ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedRegions([...expandedRegions, region]);
                                      }}
                                      className="block text-sm font-medium text-primary hover:text-primary/80 py-0.5 text-left"
                                    >
                                      See All
                                    </button>
                                  ) : (
                                    <Link
                                      href={`/destinations?region=${encodeURIComponent(region)}`}
                                      className="block text-sm font-bold text-primary hover:underline py-1 mt-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        setIsDestinationsOpen(false);
                                      }}
                                    >
                                      See All {region} Tours →
                                    </Link>
                                  )}
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Group Tours Accordion */}
            <div>
              <button
                onClick={() => setIsGroupToursOpen(!isGroupToursOpen)}
                className="flex items-center justify-between w-full py-2 hover:text-primary"
              >
                Group Tours
                <ChevronDown size={20} className={`transition-transform ${isGroupToursOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGroupToursOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  <Link
                    href="/destinations?tourCategory=GROUP&country=India"
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary"
                    onClick={() => {
                      setIsOpen(false);
                      setIsGroupToursOpen(false);
                    }}
                  >
                    <Image src="https://flagcdn.com/w40/in.png" alt="India flag" width={18} height={14} className="inline-block mr-1" />
                    Domestic
                  </Link>
                  <Link
                    href="/destinations?tourCategory=GROUP&excludeCountry=India"
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary"
                    onClick={() => {
                      setIsOpen(false);
                      setIsGroupToursOpen(false);
                    }}
                  >
                    <span>🌍</span>
                    International
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="block hover:text-primary py-2"
              onClick={() => {
                setIsOpen(false);
                setIsDestinationsOpen(false);
              }}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block hover:text-primary py-2"
              onClick={() => {
                setIsOpen(false);
                setIsDestinationsOpen(false);
              }}
            >
              Contact Us
            </Link>

            {/* Mobile Sale Button */}
            {activeSale && (
              <Link
                href={`/deals/${activeSale.slug}`}
                className="block py-2"
                onClick={() => {
                  setIsOpen(false);
                  setIsDestinationsOpen(false);
                }}
              >
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse shadow-md">
                  🔥 {activeSale.name}
                </span>
              </Link>
            )}

            <hr className="my-2" />

            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user?.email}
                  </p>
                </div>

                {/* Admin Panel - Only for admins */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 py-2 text-primary hover:text-primary/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsDestinationsOpen(false);
                    }}
                  >
                    <Settings size={16} />
                    Admin Panel
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </>
            ) : (
              /* Not logged in - Show Login button */
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 py-2 text-primary font-medium"
                onClick={() => {
                  setIsOpen(false);
                  setIsDestinationsOpen(false);
                }}
              >
                <User size={16} />
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
