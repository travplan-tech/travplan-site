"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface DepartureDate {
    date: string;
    seatsRemaining?: number | null;
    price?: number | null;
}

interface TourAvailabilitySectionProps {
    departureDates?: DepartureDate[];
    departurePoints?: string[];
    price?: number;
    originalPrice?: number;
    discountPercent?: number;
    duration?: string;
    title?: string;
    destination?: string;
    packageId?: number;
    priceChartImage?: string | null;
    cancellationPolicy?: string;
}

// --- Sub-Components ---
const CollapseSection: React.FC<{ title: string; content?: string }> = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200">
            <button
                className="flex justify-between items-center w-full py-4 text-left hover:bg-gray-50 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold text-gray-800">{title}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600 text-sm">
                    <p>{content || `Details about ${title} policy will appear here.`}</p>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
export default function TourAvailabilitySection({
    departureDates = [],
    departurePoints = [],
    price = 0,
    originalPrice = 0,
    discountPercent = 0,
    duration = "",
    title = "",
    destination = "",
    packageId,
    priceChartImage,
    cancellationPolicy
}: TourAvailabilitySectionProps) {
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    // Generate current month + next 10 months (11 total) for selection
    const getNext11Months = () => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 11; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push({
                label: date.toLocaleDateString('en-US', { month: 'short' }),
                year: date.getFullYear().toString(),
                month: date.getMonth(),
                yearNum: date.getFullYear(),
                full: `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`
            });
        }
        return months;
    };

    const availableMonths = getNext11Months();

    // Helper function to parse date strings in various formats
    const parseDate = (dateStr: string): Date | null => {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const fullMonthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const now = new Date();

        const lowerDateStr = dateStr.toLowerCase().trim();

        // Match patterns like "Jan 05, 2025" or "Jan 05 2025" or "January 5, 2025"
        const regexWithYear = /^([a-z]+)\s*(\d{1,2}),?\s*(\d{4})$/i;
        const matchWithYear = lowerDateStr.match(regexWithYear);

        if (matchWithYear) {
            const monthStr = matchWithYear[1].toLowerCase();
            const day = parseInt(matchWithYear[2], 10);
            const year = parseInt(matchWithYear[3], 10);

            let monthIndex = monthNames.indexOf(monthStr.substring(0, 3));
            if (monthIndex === -1) {
                monthIndex = fullMonthNames.indexOf(monthStr);
            }

            if (monthIndex !== -1 && day >= 1 && day <= 31 && year > 2000) {
                return new Date(year, monthIndex, day);
            }
        }

        // Match patterns like "Jan 05" or "January 5" (WITHOUT year)
        const regexNoYear = /^([a-z]+)\s*(\d{1,2})$/i;
        const matchNoYear = lowerDateStr.match(regexNoYear);

        if (matchNoYear) {
            const monthStr = matchNoYear[1].toLowerCase();
            const day = parseInt(matchNoYear[2], 10);

            let monthIndex = monthNames.indexOf(monthStr.substring(0, 3));
            if (monthIndex === -1) {
                monthIndex = fullMonthNames.indexOf(monthStr);
            }

            if (monthIndex !== -1 && day >= 1 && day <= 31) {
                // Determine the year: use current year if month is current or future, 
                // otherwise use next year
                let year = now.getFullYear();
                if (monthIndex < now.getMonth() ||
                    (monthIndex === now.getMonth() && day < now.getDate())) {
                    year = now.getFullYear() + 1;
                }
                return new Date(year, monthIndex, day);
            }
        }

        // Try ISO date format parsing last (for dates like 2025-01-05)
        // Only accept if it looks like a valid ISO format to avoid misinterpretation
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        return null;
    };

    // Filter departure dates based on selected month
    const filteredDepartureDates = selectedMonth
        ? departureDates.filter((departure) => {
            const depDate = parseDate(departure.date);
            if (!depDate) return false;

            const selectedMonthData = availableMonths.find(m => m.full === selectedMonth);
            if (!selectedMonthData) return false;

            return depDate.getMonth() === selectedMonthData.month &&
                depDate.getFullYear() === selectedMonthData.yearNum;
        })
        : departureDates;

    return (
        <div id='availability' className="pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tour Availability</h2>

            {/* --- Month Selection Grid --- */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                <button
                    onClick={() => setSelectedMonth(null)}
                    className={`col-span-1 text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-md transition ${selectedMonth === null
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    All
                </button>
                {availableMonths.map((month) => (
                    <button
                        key={month.full}
                        onClick={() => setSelectedMonth(month.full)}
                        className={`col-span-1 text-xs sm:text-sm font-semibold py-1.5 sm:py-2 rounded-md transition border border-gray-300 ${selectedMonth === month.full ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {month.label}
                        <span className="block text-[10px] sm:text-xs font-normal opacity-80">{month.year}</span>
                    </button>
                ))}
            </div>

            {/* --- Departure Dates List --- */}
            {filteredDepartureDates.length > 0 ? (
                <div className="space-y-3 mb-8">
                    {filteredDepartureDates.map((depDate, index) => {
                        const isExpanded = expandedCard === index;
                        const departurePrice = depDate.price || price;
                        const departureOriginalPrice = depDate.price
                            ? Math.round(depDate.price * (1 + (discountPercent / 100)))
                            : originalPrice;
                        const displayDiscount = discountPercent > 0 ? discountPercent :
                            (departureOriginalPrice > departurePrice
                                ? Math.round(((departureOriginalPrice - departurePrice) / departureOriginalPrice) * 100)
                                : 0);

                        // Parse the date for display
                        const parsedDate = parseDate(depDate.date);
                        const startDateFormatted = parsedDate
                            ? `${parsedDate.getDate().toString().padStart(2, '0')} ${parsedDate.toLocaleDateString('en-US', { month: 'short' })} ${parsedDate.getFullYear()}`
                            : depDate.date;

                        // Calculate end date based on duration
                        let endDateFormatted = startDateFormatted;
                        if (parsedDate && duration) {
                            const daysMatch = duration.match(/(\d+)\s*(?:days?|D)/i);
                            const nightsMatch = duration.match(/(\d+)\s*(?:nights?|N)/i);
                            let totalDays = 0;
                            if (daysMatch) totalDays = parseInt(daysMatch[1]);
                            else if (nightsMatch) totalDays = parseInt(nightsMatch[1]) + 1;

                            if (totalDays > 0) {
                                const endDate = new Date(parsedDate);
                                endDate.setDate(endDate.getDate() + totalDays - 1);
                                endDateFormatted = `${endDate.getDate().toString().padStart(2, '0')} ${endDate.toLocaleDateString('en-US', { month: 'short' })} ${endDate.getFullYear()}`;
                            }
                        }

                        return (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Collapsed Header */}
                                <button
                                    onClick={() => setExpandedCard(isExpanded ? null : index)}
                                    className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 text-left hover:bg-gray-50 transition gap-2 sm:gap-0"
                                >
                                    <div className="flex justify-between sm:items-center gap-1 sm:gap-6">
                                        <div>
                                            <span className="text-[10px] sm:text-xs text-primary font-medium">From {departurePoints[0]}</span>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800">{startDateFormatted}</p>
                                        </div>
                                        {duration && (
                                            <div className="">
                                                <span className="text-xs text-primary font-medium">To {departurePoints[1]}</span>
                                                <p className="text-xs sm:text-sm font-bold text-gray-800">{endDateFormatted}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                                        <div className="flex items-center gap-2">
                                            {displayDiscount > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                                    {displayDiscount}% OFF
                                                </span>
                                            )}
                                            {depDate.seatsRemaining !== null && depDate.seatsRemaining !== undefined && (
                                                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${depDate.seatsRemaining === 0
                                                    ? 'bg-red-100 text-red-600'
                                                    : depDate.seatsRemaining < 5
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {depDate.seatsRemaining === 0 ? 'Sold Out' : `${depDate.seatsRemaining} seats`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                {departureOriginalPrice > departurePrice && (
                                                    <span className="text-[10px] sm:text-xs text-gray-400 line-through mr-1 sm:mr-2">
                                                        ₹{departureOriginalPrice.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                                <span className="text-sm sm:text-lg font-bold text-gray-900">
                                                    ₹{departurePrice.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 aspect-square text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 aspect-square text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className='border-t border-gray-200 p-4 md:p-6'>
                                        <h4 className="text-lg font-bold text-gray-900 mb-4">{title || "Tour Package"}</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Left Column - Tour Details */}
                                            <div>
                                                {/* Timeline */}
                                                <div className="space-y-4">
                                                    {/* Start Point */}
                                                    <div className="flex items-start gap-3">
                                                        <div className="shrink-0 mt-1">
                                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-bold text-gray-800">
                                                                {parsedDate?.getDate() || ""}
                                                                <span className="text-primary ml-1">
                                                                    {parsedDate?.toLocaleDateString('en-US', { month: 'short' })}
                                                                </span>
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-700">Tour start</p>
                                                            <p className="text-sm text-gray-500">{departurePoints[0] || "Departure Point"}</p>
                                                        </div>
                                                    </div>
                                                    {/* Vertical Line */}
                                                    <div className="ml-4 pl-[0.1rem] border-l-2 border-dashed border-gray-300 h-6"></div>
                                                    {/* End Point */}
                                                    <div className="flex items-start gap-3">
                                                        <div className="shrink-0 mt-1">
                                                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-bold text-gray-800">
                                                                {(() => {
                                                                    if (!parsedDate || !duration) return "";
                                                                    const daysMatch = duration.match(/(\d+)\s*(?:days?|D)/i);
                                                                    const nightsMatch = duration.match(/(\d+)\s*(?:nights?|N)/i);
                                                                    let totalDays = 0;
                                                                    if (daysMatch) totalDays = parseInt(daysMatch[1]);
                                                                    else if (nightsMatch) totalDays = parseInt(nightsMatch[1]) + 1;
                                                                    if (totalDays > 0) {
                                                                        const endDate = new Date(parsedDate);
                                                                        endDate.setDate(endDate.getDate() + totalDays - 1);
                                                                        return endDate.getDate();
                                                                    }
                                                                    return "";
                                                                })()}
                                                                <span className="text-primary ml-1">
                                                                    {(() => {
                                                                        if (!parsedDate || !duration) return "";
                                                                        const daysMatch = duration.match(/(\d+)\s*(?:days?|D)/i);
                                                                        const nightsMatch = duration.match(/(\d+)\s*(?:nights?|N)/i);
                                                                        let totalDays = 0;
                                                                        if (daysMatch) totalDays = parseInt(daysMatch[1]);
                                                                        else if (nightsMatch) totalDays = parseInt(nightsMatch[1]) + 1;
                                                                        if (totalDays > 0) {
                                                                            const endDate = new Date(parsedDate);
                                                                            endDate.setDate(endDate.getDate() + totalDays - 1);
                                                                            return endDate.toLocaleDateString('en-US', { month: 'short' });
                                                                        }
                                                                        return "";
                                                                    })()}
                                                                </span>
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-700">Tour end</p>
                                                            <p className="text-sm text-gray-500">{departurePoints[1]}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Right Column - Pricing & CTA */}
                                            <div className="flex flex-col justify-center items-center md:items-end text-center md:text-right">
                                                {displayDiscount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded mb-2">
                                                        {displayDiscount}% OFF TODAY
                                                    </span>
                                                )}
                                                <div className="mb-4">
                                                    <span className="text-sm text-gray-500">Price </span>
                                                    {departureOriginalPrice > departurePrice && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            ₹{departureOriginalPrice.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                                                        ₹{departurePrice.toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">per person</p>
                                                </div>
                                                <Link
                                                    href={packageId ? `/checkout?packageId=${packageId}&date=${encodeURIComponent(depDate.date)}` : '#'}
                                                    className={`w-full md:w-auto px-8 py-3 rounded-md font-semibold text-white transition ${depDate.seatsRemaining === 0
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-primary/90'
                                                        }`}
                                                    onClick={(e) => depDate.seatsRemaining === 0 && e.preventDefault()}
                                                >
                                                    {depDate.seatsRemaining === 0 ? 'Sold Out' : 'Book Now'}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 mb-8 border border-dashed border-gray-300 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No fixed departure dates available.</p>
                    <p className="text-sm text-gray-400">Contact us for customized departure dates.</p>
                </div>
            )}

            {/* --- Monthly Price Comparison Graph --- */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Price Comparison</h3>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
                    {priceChartImage ? (
                        <div className="relative w-full aspect-video">
                            <Image
                                src={priceChartImage}
                                alt="Monthly Price Comparison"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-video flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <p className="text-sm">Price comparison chart not available</p>
                                <p className="text-xs mt-1">Contact us for seasonal pricing details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Good to Know Section --- */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Good to Know</h3>
                <div className="space-y-0">
                    <CollapseSection title="Cancellation" content={cancellationPolicy} />
                    <CollapseSection title="Payment" content="We accept all major credit cards, bank transfers, and EMI options. A 30% deposit is required at the time of booking." />
                    <CollapseSection title="Travel Insurance" content="We strongly recommend purchasing comprehensive travel insurance before your trip. This should cover trip cancellation, medical expenses, and emergency evacuation." />
                </div>
            </div>

            {/* --- Help/Contact Section --- */}
            <div className="flex flex-col md:flex-row items-center p-6 bg-gray-50 rounded-lg border border-gray-200 gap-4">
                <div className="grow text-center md:text-left">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Do you need help from our trip consultants?</h4>
                    <p className="text-sm text-gray-600">
                        If you have any question about this tour or need help with planning a trip,
                        please do not hesitate to get in touch with us.
                    </p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-md text-sm transition shrink-0">
                    <Link href="/#customize-trip">Get Help</Link>
                </button>
            </div>

        </div>
    );
}