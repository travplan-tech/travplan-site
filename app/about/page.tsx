"use client";

import { CornerDownRight } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#8B5CF6] px-4 py-8 sm:p-8 md:p-12 lg:p-16 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto relative">

                {/* Row 1: "ABOUT US" heading + Gaurav Singhal Card */}
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start mb-6 sm:mb-8 lg:mb-12">
                    {/* Left Content - About Us */}
                    <div className="z-10 relative text-center lg:text-left lg:w-1/2 lg:shrink-0 pt-4 lg:pt-8">
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-white drop-shadow-sm">
                            ABOUT<br />US
                        </h1>
                    </div>

                    {/* Right Content - Gaurav Singhal Card */}
                    <div className="flex justify-center lg:justify-end lg:w-1/2">
                        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:py-8 lg:px-8 relative shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-none hover:scale-[1.02] transition-transform duration-300">
                            {/* Mobile: Stacked layout */}
                            <div className="flex flex-col items-center gap-4 md:hidden">
                                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-orange-50 rounded-2xl overflow-hidden relative shadow-inner">
                                    <Image
                                        src="/gaurav.png"
                                        alt="Gaurav Singhal"
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Gaurav Singhal, <span className="text-gray-500 font-semibold">Founder &amp; CEO</span></h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed max-w-xs mx-auto">
                                        An architect by profession and a strategist by instinct, Mr. Singhal brings over 12 years of experience and a sharp, dynamic mindset to Travplan. Known for his strong and adaptive leadership, he&apos;s the driving force behind our bold ideas and seamless journeys.
                                    </p>
                                </div>
                                {/* Decorative lines */}
                                <div className="flex flex-col gap-2 items-center mt-2">
                                    <div className="w-32 h-1 bg-cyan-400 rounded-full" />
                                    <div className="w-24 h-1 bg-cyan-400 rounded-full" />
                                </div>
                            </div>

                            {/* Desktop: Horizontal layout - text left, image right */}
                            <div className="hidden md:flex flex-row items-center gap-6 lg:gap-8">
                                {/* Left - Name & Description */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-900 text-base lg:text-lg">Gaurav Singhal, <span className="text-gray-500 font-semibold">Founder &amp; CEO</span></h3>
                                    <p className="text-xs lg:text-sm text-gray-600 mt-3 leading-relaxed">
                                        An architect by profession and a strategist by instinct, Mr. Singhal brings over 12 years of experience and a sharp, dynamic mindset to Travplan. Known for his strong and adaptive leadership, he&apos;s the driving force behind our bold ideas and seamless journeys.
                                    </p>
                                    {/* Decorative lines */}
                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="w-40 h-1 bg-cyan-400 rounded-full" />
                                        <div className="w-28 h-1 bg-cyan-400 rounded-full" />
                                    </div>
                                </div>

                                {/* Right - Photo */}
                                <div className="w-36 h-44 lg:w-44 lg:h-52 bg-orange-50 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                                    <Image
                                        src="/gaurav.png"
                                        alt="Gaurav Singhal"
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Rohit Kumar Card + Arrow */}
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center">
                    {/* Left Content - Rohit Kumar Card */}
                    <div className="flex justify-center lg:justify-start lg:w-2/3">
                        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:py-8 lg:px-8 relative shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-none hover:scale-[1.02] transition-transform duration-300">
                            {/* Mobile: Stacked layout */}
                            <div className="flex flex-col items-center gap-4 md:hidden">
                                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-yellow-50 rounded-2xl overflow-hidden relative shadow-inner">
                                    <Image
                                        src="/rohit.png"
                                        alt="Rohit Kumar"
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Rohit Kumar, <span className="text-gray-500 font-semibold">Expedition Specialist</span></h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed max-w-xs mx-auto">
                                        Driven by peaks and purpose, Mr. Kumar is more than just a mountaineer—he is the embodiment of mental grit, physical endurance, and an unshakable mindset. He brings raw experience from the mountains to the heart of Travplan.
                                    </p>
                                </div>
                                {/* Decorative lines */}
                                <div className="flex flex-col gap-2 items-center mt-2">
                                    <div className="w-32 h-1 bg-cyan-400 rounded-full" />
                                    <div className="w-24 h-1 bg-cyan-400 rounded-full" />
                                </div>
                            </div>

                            {/* Desktop: Horizontal layout - image left, text right */}
                            <div className="hidden md:flex flex-row items-center gap-6 lg:gap-8">
                                {/* Left - Photo */}
                                <div className="w-36 h-44 lg:w-44 lg:h-52 bg-yellow-50 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                                    <Image
                                        src="/rohit.png"
                                        alt="Rohit Kumar"
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Right - Name & Description */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-900 text-base lg:text-lg">Rohit Kumar, <span className="text-gray-500 font-semibold">Expedition Specialist</span></h3>
                                    <p className="text-xs lg:text-sm text-gray-600 mt-3 leading-relaxed">
                                        Driven by peaks and purpose, Mr. Kumar is more than just a mountaineer—he is the embodiment of mental grit, physical endurance, and an unshakable mindset. He brings raw experience from the mountains to the heart of Travplan.
                                    </p>
                                    {/* Decorative lines */}
                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="w-40 h-1 bg-cyan-400 rounded-full" />
                                        <div className="w-28 h-1 bg-cyan-400 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Decorative Arrow */}
                    <div className="hidden lg:flex flex-col justify-end items-end lg:w-1/3">
                        <CornerDownRight className="w-24 h-24 lg:w-32 lg:h-32 text-black stroke-[3]" />
                    </div>
                </div>

                {/* Bottom Section - Company Info */}
                <div className="mt-8 sm:mt-12 lg:mt-16 text-center lg:text-right">
                    <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl font-medium max-w-3xl ml-auto leading-relaxed">
                        At Travplan, we don&apos;t just plan trips—we craft unforgettable experiences. From the peaks of the Himalayas to the serene backwaters of Kerala, our team brings passion, expertise, and a personal touch to every journey we design.
                    </p>
                </div>

            </div>
        </main>
    );
}
