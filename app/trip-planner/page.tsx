"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import Image from "next/image"
import { User, Users, Home, UsersRound, Calendar, CalendarCheck, CalendarClock, Check, ChevronRight, ChevronLeft, MapPin, X, Plus, Minus, LogIn, Globe, UserCheck, MessageCircle, PartyPopper } from "lucide-react"
import { useGetExpertsQuery, useSubmitTripPlanMutation } from "@/lib/api/publicApi"

// Types
interface TripPlan {
    country: string
    groupType: "single" | "couple" | "family" | "group" | ""
    adultsCount: number
    childrenCount: number
    dateType: "exact" | "approximate" | "decide-later" | ""
    startDate: string
    endDate: string
    preferredMonth: string
    tripDuration: string
    ageGroup: string
    tourType: string
    accommodation: string
    budgetPerPerson: string
    budgetFlexible: string
    planningStage: string
    tripTitle: string
    tripDescription: string
    knowsDestinations: boolean
}

interface TripExpert {
    id: number
    name: string
    email: string | null
    avatar: string | null
    bio: string | null
    expertise: string[]
    whatsappNumber: string | null
    type: string
    isActive: boolean
}

const steps = [
    { id: 1, label: "GROUP TYPE" },
    { id: 2, label: "TRAVEL DATES" },
    { id: 3, label: "TRAVELLER INFO" },
    { id: 4, label: "TRIP DETAILS" },
    { id: 5, label: "SELECT EXPERT" },
]

const groupTypes = [
    { id: "single", label: "Single", icon: User },
    { id: "couple", label: "Couple", icon: Users },
    { id: "family", label: "Family", icon: Home },
    { id: "group", label: "Group", icon: UsersRound },
]

const dateTypes = [
    { id: "exact", label: "I have my exact dates", icon: CalendarCheck },
    { id: "approximate", label: "I have my approx. dates", icon: Calendar },
    { id: "decide-later", label: "I will decide later", icon: CalendarClock },
]

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const tripDurations = [
    "1-3 days", "4-7 days", "8-14 days", "15-21 days", "22-30 days", "More than 30 days"
]

const ageGroups = ["18-35 yrs", "36-50 yrs", "51-64 yrs", "65+ yrs"]

const tourTypes = [
    { id: "custom-with-guide", label: "Custom-made trip with guide and/or driver", description: "You'll be on your own schedule and have a guide and/or driver accompany you. Some activities or day tours may be shared." },
    { id: "custom-without-guide", label: "Custom-made trip without guide and driver", description: "You don't need a driver or guide but would like help with itinerary and booking of accommodations etc." },
    { id: "group-tour", label: "Group Tour", description: "Join a multiday, guided group tour with fixed departures." },
    { id: "private-with-guide", label: "Private Trip with Guide and/or Driver", description: "You'll be on your own schedule and have a guide accompany you. Some activities or day tours may be shared." },
    { id: "private-without-guide", label: "Private Trip without Guide and Driver", description: "You don't need a guide but would like help with itinerary and booking of accommodations etc." },
    { id: "something-else", label: "Something else", description: "I'll let you know what I'm looking for" },
]

const accommodations = [
    { id: "basic", label: "Basic", description: "Equivalent of 2* hotels." },
    { id: "comfortable", label: "Comfortable", description: "Equivalent of 3* hotels. We'll seek to provide comfortable but not luxury accommodations." },
    { id: "luxury", label: "Luxury", description: "Equivalent of 4* hotels and above. We'll provide the best luxury accommodations available through-out your tour." },
    { id: "quirky", label: "Quirky", description: "Something completely different." },
]
const budgetFlexibility = ["No, this is my maximum budget", "Yes, I can stretch if needed", "Very flexible"]
const planningStages = [
    "I need more information before I can start trip planning",
    "I'm ready to start trip planning",
    "I've done my homework and almost ready to book"
]

function TripPlannerContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { data: session, status } = useSession()
    const initialCountry = searchParams.get("country") || ""

    const [currentStep, setCurrentStep] = useState(1)
    const [tripPlan, setTripPlan] = useState<TripPlan>({
        country: initialCountry,
        groupType: "",
        adultsCount: 2,
        childrenCount: 0,
        dateType: "",
        startDate: "",
        endDate: "",
        preferredMonth: "",
        tripDuration: "",
        ageGroup: "18-35 yrs",
        tourType: "custom-with-guide",
        accommodation: "comfortable",
        budgetPerPerson: "",
        budgetFlexible: "No, this is my maximum budget",
        planningStage: "I need more information before I can start trip planning",
        tripTitle: "",
        tripDescription: "",
        knowsDestinations: false,
    })

    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)
    const [selectedExpert, setSelectedExpert] = useState<TripExpert | null>(null)

    // List of domestic (Indian) destinations
    const domesticCountries = ["India", "Jammu & Kashmir", "Kerala", "Rajasthan", "Goa", "Himachal Pradesh", "Uttarakhand", "Ladakh", "Andaman"]

    const isDomesticDestination = useMemo(() => {
        return domesticCountries.some(country =>
            tripPlan.country.toLowerCase().includes(country.toLowerCase())
        )
    }, [tripPlan.country])

    // RTK Query hooks
    const expertType = isDomesticDestination ? "DOMESTIC" : "INTERNATIONAL"
    const { data: experts = [], isLoading: loadingExperts } = useGetExpertsQuery(expertType, { skip: currentStep !== 5 })
    const [submitTripPlan, { isLoading: isSubmitting }] = useSubmitTripPlanMutation()

    const updatePlan = (field: keyof TripPlan, value: string | boolean | number) => {
        setTripPlan(prev => ({ ...prev, [field]: value }))
    }

    // Helper to get total people count
    const getTotalPeopleCount = () => {
        switch (tripPlan.groupType) {
            case "single":
                return 1
            case "couple":
                return 2
            case "family":
            case "group":
                return tripPlan.adultsCount + tripPlan.childrenCount
            default:
                return 0
        }
    }

    // Helper to get people display text
    const getPeopleDisplayText = () => {
        const total = getTotalPeopleCount()
        if (tripPlan.groupType === "single") return "1 Adult"
        if (tripPlan.groupType === "couple") return "2 Adults"
        if (tripPlan.groupType === "family" || tripPlan.groupType === "group") {
            const parts = []
            if (tripPlan.adultsCount > 0) {
                parts.push(`${tripPlan.adultsCount} Adult${tripPlan.adultsCount > 1 ? 's' : ''}`)
            }
            if (tripPlan.childrenCount > 0) {
                parts.push(`${tripPlan.childrenCount} Child${tripPlan.childrenCount > 1 ? 'ren' : ''}`)
            }
            return parts.join(', ') || 'Select travelers'
        }
        return ''
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return tripPlan.groupType !== ""
            case 2:
                if (tripPlan.dateType === "exact") {
                    return tripPlan.startDate !== "" && tripPlan.endDate !== ""
                }
                if (tripPlan.dateType === "approximate") {
                    return tripPlan.preferredMonth !== "" && tripPlan.tripDuration !== ""
                }
                if (tripPlan.dateType === "decide-later") {
                    return tripPlan.tripDuration !== ""
                }
                return false
            case 3:
                return tripPlan.country !== "" && tripPlan.ageGroup !== "" && tripPlan.tourType !== "" && tripPlan.accommodation !== ""
            case 4:
                return tripPlan.budgetPerPerson !== ""
            case 5:
                return selectedExpert !== null
            default:
                return false
        }
    }

    const handleNext = () => {
        if (currentStep < 5 && canProceed()) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!selectedExpert) {
            alert("Please select an expert to continue.")
            return
        }

        try {
            await submitTripPlan({
                tripPlan: {
                    ...tripPlan,
                    tourType: tourTypes.find(t => t.id === tripPlan.tourType)?.label || tripPlan.tourType,
                    accommodation: accommodations.find(a => a.id === tripPlan.accommodation)?.label || tripPlan.accommodation,
                },
                expertId: selectedExpert.id,
            }).unwrap()

            setCurrentStep(6)
        } catch (error) {
            console.error("Error submitting trip plan:", error)
            alert("Failed to submit trip plan. Please try again.")
        }
    }

    // Country image based on selection
    const getCountryImage = () => {
        const images: Record<string, string> = {
            "India": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400",
            "Thailand": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400",
            "Japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
            "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400",
            "default": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
        }
        return images[tripPlan.country] || images["default"]
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center shrink-0">
                                <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${currentStep >= step.id
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-500"
                                        }`}>
                                        {currentStep > step.id ? <Check size={12} className="sm:w-4 sm:h-4" /> : step.id}
                                    </div>
                                    <span className={`text-[8px] sm:text-xs mt-1 font-medium hidden sm:block max-w-[60px] sm:max-w-none text-center leading-tight ${currentStep >= step.id ? "text-primary" : "text-gray-400"
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-6 sm:w-12 md:w-24 lg:w-32 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded ${currentStep > step.id ? "bg-primary" : "bg-gray-200"
                                        }`} />
                                )}
                            </div>
                        ))}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                <Check size={12} className="sm:w-4 sm:h-4" />
                            </div>
                            <span className="text-[8px] sm:text-xs mt-1 font-medium text-primary hidden sm:block max-w-[80px] text-center leading-tight">CONNECT EXPERT</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            {/* Step 1: Group Type */}
                            {currentStep === 1 && (
                                <div>
                                    {/* Login Check */}
                                    {status !== "authenticated" && (
                                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <LogIn className="w-5 h-5 text-amber-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-amber-900">Login Required</h3>
                                                    <p className="text-sm text-amber-700 mt-1">
                                                        Please login to continue with your trip planning. This helps us connect you with the right travel expert.
                                                    </p>
                                                    <button
                                                        onClick={() => signIn()}
                                                        className="mt-3 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
                                                    >
                                                        <LogIn size={16} />
                                                        Login to Continue
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            b
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                            How many people are traveling?
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {groupTypes.map((type) => {
                                            const Icon = type.icon
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updatePlan("groupType", type.id)}
                                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${tripPlan.groupType === type.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <Icon size={40} className={tripPlan.groupType === type.id ? "text-primary" : "text-gray-500"} />
                                                    <span className={`font-medium ${tripPlan.groupType === type.id ? "text-primary" : "text-gray-700"}`}>
                                                        {type.label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Adults & Children Count - Only for Family or Group */}
                                    {(tripPlan.groupType === "family" || tripPlan.groupType === "group") && (
                                        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                                How many travelers?
                                            </h3>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {/* Adults Counter */}
                                                <div className="flex-1 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Adults</p>
                                                        <p className="text-xs text-gray-500">Age 18+</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updatePlan("adultsCount", Math.max(1, tripPlan.adultsCount - 1))}
                                                            disabled={tripPlan.adultsCount <= 1}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Minus size={16} className="text-gray-600" />
                                                        </button>
                                                        <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                                                            {tripPlan.adultsCount}
                                                        </span>
                                                        <button
                                                            onClick={() => updatePlan("adultsCount", Math.min(20, tripPlan.adultsCount + 1))}
                                                            disabled={tripPlan.adultsCount >= 20}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Plus size={16} className="text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Children Counter */}
                                                <div className="flex-1 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Children</p>
                                                        <p className="text-xs text-gray-500">Age 0-17</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updatePlan("childrenCount", Math.max(0, tripPlan.childrenCount - 1))}
                                                            disabled={tripPlan.childrenCount <= 0}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Minus size={16} className="text-gray-600" />
                                                        </button>
                                                        <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                                                            {tripPlan.childrenCount}
                                                        </span>
                                                        <button
                                                            onClick={() => updatePlan("childrenCount", Math.min(10, tripPlan.childrenCount + 1))}
                                                            disabled={tripPlan.childrenCount >= 10}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Plus size={16} className="text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-3">
                                                Total travelers: {tripPlan.adultsCount + tripPlan.childrenCount} people
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Travel Dates */}
                            {currentStep === 2 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            b
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                            When will you be traveling?
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {dateTypes.map((type) => {
                                            const Icon = type.icon
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updatePlan("dateType", type.id)}
                                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${tripPlan.dateType === type.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <Icon size={36} className={tripPlan.dateType === type.id ? "text-primary" : "text-gray-500"} />
                                                    <span className={`font-medium text-center ${tripPlan.dateType === type.id ? "text-primary" : "text-gray-700"}`}>
                                                        {type.label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Exact Dates - Show date pickers */}
                                    {tripPlan.dateType === "exact" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={tripPlan.startDate}
                                                    onChange={(e) => updatePlan("startDate", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    value={tripPlan.endDate}
                                                    onChange={(e) => updatePlan("endDate", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Approximate Dates - Show month + duration dropdowns */}
                                    {tripPlan.dateType === "approximate" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Preferred Month <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={tripPlan.preferredMonth}
                                                    onChange={(e) => updatePlan("preferredMonth", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                                >
                                                    <option value="">Select month</option>
                                                    {months.map((month) => (
                                                        <option key={month} value={month}>{month}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Trip Duration <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={tripPlan.tripDuration}
                                                    onChange={(e) => updatePlan("tripDuration", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                                >
                                                    <option value="">Select duration</option>
                                                    {tripDurations.map((duration) => (
                                                        <option key={duration} value={duration}>{duration}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Decide Later - Show only duration dropdown */}
                                    {tripPlan.dateType === "decide-later" && (
                                        <div className="max-w-md mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                How long do you want to travel? <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={tripPlan.tripDuration}
                                                onChange={(e) => updatePlan("tripDuration", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                            >
                                                <option value="">Select duration</option>
                                                {tripDurations.map((duration) => (
                                                    <option key={duration} value={duration}>{duration}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-500 mb-6">
                                        {tripPlan.dateType === "exact"
                                            ? "Trip Start and End dates can be changed later if you wish to."
                                            : tripPlan.dateType === "approximate"
                                                ? "We'll help you find the best dates based on your preferences."
                                                : tripPlan.dateType === "decide-later"
                                                    ? "No worries! We'll help you figure out the best dates."
                                                    : "Select how you'd like to plan your travel dates."
                                        }
                                    </p>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={handleBack}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Traveller Info */}
                            {currentStep === 3 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            A
                                        </div>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-1/2 rounded-full"></div>
                                        </div>
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            B
                                        </div>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 mt-6">
                                        Great! Now to the most important part, your upcoming trip.
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Please give us all your trip ideas and thoughts. Based on your input we&apos;ll connect you with a travel expert, suiting your needs.
                                    </p>

                                    {/* Geographical Area */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Geographical Area <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {tripPlan.country && (
                                                <span className="px-3 py-1.5 bg-primary text-white rounded-md text-sm flex items-center gap-2">
                                                    {tripPlan.country}
                                                    <button onClick={() => updatePlan("country", "")} className="hover:bg-white/20 rounded">
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            )}
                                            {!tripPlan.country && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter country name"
                                                    value={tripPlan.country}
                                                    onChange={(e) => updatePlan("country", e.target.value)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            )}
                                            <span className="text-sm text-gray-500">Max three countries</span>
                                        </div>
                                        <button className="text-primary text-sm font-medium mt-2 hover:underline">
                                            Add new country
                                        </button>
                                    </div>

                                    {/* Know Destinations */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Do you know which destinations and activities in {tripPlan.country || "your destination"}, that you&apos;d like to explore? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={tripPlan.knowsDestinations}
                                                    onChange={() => updatePlan("knowsDestinations", true)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span>Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={!tripPlan.knowsDestinations}
                                                    onChange={() => updatePlan("knowsDestinations", false)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span>No</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Age Group */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Primary age group of adults? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            {ageGroups.map(age => (
                                                <label key={age} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={tripPlan.ageGroup === age}
                                                        onChange={() => updatePlan("ageGroup", age)}
                                                        className="w-4 h-4 text-primary"
                                                    />
                                                    <span>{age}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tour Type */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            What type of tour are you looking for? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            {tourTypes.map(type => (
                                                <label key={type.id} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                                                    <input
                                                        type="radio"
                                                        checked={tripPlan.tourType === type.id}
                                                        onChange={() => updatePlan("tourType", type.id)}
                                                        className="w-4 h-4 text-primary mt-0.5"
                                                    />
                                                    <div>
                                                        <span className="font-medium text-primary">{type.label}</span>
                                                        <p className="text-sm text-gray-500">{type.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Accommodation */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            What accommodation options are you looking for? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            {accommodations.map(acc => (
                                                <label key={acc.id} className="flex items-start gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={tripPlan.accommodation === acc.id}
                                                        onChange={() => updatePlan("accommodation", acc.id)}
                                                        className="w-4 h-4 text-primary mt-0.5"
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-900">{acc.label}</span>
                                                        <p className="text-sm text-gray-500">{acc.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={handleBack}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Trip Details */}
                            {currentStep === 4 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            A
                                        </div>
                                        <div className="flex-1 h-2 bg-primary rounded-full"></div>
                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                                            B
                                        </div>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 mt-6">
                                        Last few details...
                                    </h2>

                                    {/* Budget */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Enter your approx. budget per person <span className="text-red-500">*</span>
                                            </label>
                                            <p className="text-xs text-gray-500 mb-2">per person for the entire trip</p>
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                <span className="px-3 py-3 bg-gray-50 text-gray-600 border-r">INR</span>
                                                <input
                                                    type="number"
                                                    placeholder="600"
                                                    value={tripPlan.budgetPerPerson}
                                                    onChange={(e) => updatePlan("budgetPerPerson", e.target.value)}
                                                    className="flex-1 px-4 py-3 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Is your budget flexible? <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={tripPlan.budgetFlexible}
                                                onChange={(e) => updatePlan("budgetFlexible", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary mt-5"
                                            >
                                                {budgetFlexibility.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Planning Stage */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            What trip planning stage are you at? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-2">
                                            {planningStages.map(stage => (
                                                <label key={stage} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={tripPlan.planningStage === stage}
                                                        onChange={() => updatePlan("planningStage", stage)}
                                                        className="w-4 h-4 text-primary"
                                                    />
                                                    <span className="text-primary">{stage}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trip Title */}
                                    <div className="mb-6">
                                        <input
                                            type="text"
                                            placeholder="Give your trip a name (optional)"
                                            value={tripPlan.tripTitle}
                                            onChange={(e) => updatePlan("tripTitle", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>

                                    {/* Trip Description with Helper Box */}
                                    <div className="mb-6">
                                        <div className="relative">
                                            {/* Textarea */}
                                            <div>
                                                <textarea
                                                    placeholder="Please describe your trip."
                                                    value={tripPlan.tripDescription}
                                                    onChange={(e) => updatePlan("tripDescription", e.target.value)}
                                                    onFocus={() => setIsDescriptionFocused(true)}
                                                    onBlur={() => setIsDescriptionFocused(false)}
                                                    rows={6}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                                />
                                            </div>

                                            {/* Helper Box - Absolute positioned, shows on focus */}
                                            {isDescriptionFocused && (
                                                <div className="absolute left-full top-0 ml-4 w-72 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-10 hidden lg:block animate-in fade-in slide-in-from-left-2 duration-200">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Describe your trip</h4>
                                                    <ul className="space-y-2 text-sm text-gray-600">
                                                        <li className="flex gap-2">
                                                            <span className="text-gray-400">›</span>
                                                            <span>Where would you like your trip to start and end?</span>
                                                        </li>
                                                        <li className="flex gap-2">
                                                            <span className="text-gray-400">›</span>
                                                            <span>Any attractions/destinations that you wish to include?</span>
                                                        </li>
                                                        <li className="flex gap-2">
                                                            <span className="text-gray-400">›</span>
                                                            <span>Any specific requirements, e.g. special interests, dietary or medical requirements?</span>
                                                        </li>
                                                    </ul>
                                                    <p className="text-xs text-gray-500 mt-3">
                                                        Detailed input will help us to connect you with the right travel expert.
                                                    </p>
                                                    {/* Arrow pointing to textarea */}
                                                    <div className="absolute right-full top-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-200"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={handleBack}
                                            className="px-6 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Select Expert */}
                            {currentStep === 5 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            b
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                                Select Your Travel Expert
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {isDomesticDestination ? (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} className="text-green-600" />
                                                        Showing domestic experts for {tripPlan.country}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Globe size={14} className="text-blue-600" />
                                                        Showing international experts for {tripPlan.country}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {loadingExperts ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : experts.length === 0 ? (
                                        <div className="text-center py-12">
                                            <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500">No experts available at the moment.</p>
                                            <p className="text-sm text-gray-400 mt-1">Please try again later or contact support.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {experts.map((expert) => (
                                                <button
                                                    key={expert.id}
                                                    onClick={() => setSelectedExpert(expert)}
                                                    className={`p-4 border-2 rounded-xl text-left transition-all ${selectedExpert?.id === expert.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {expert.avatar ? (
                                                            <img
                                                                src={expert.avatar}
                                                                alt={expert.name}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <span className="text-primary font-semibold text-lg">
                                                                    {expert.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-semibold ${selectedExpert?.id === expert.id ? "text-primary" : "text-gray-900"
                                                                }`}>
                                                                {expert.name}
                                                            </h3>
                                                            {expert.bio && (
                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{expert.bio}</p>
                                                            )}
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {expert.expertise.slice(0, 3).map((exp) => (
                                                                    <span key={exp} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                                        {exp}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {selectedExpert?.id === expert.id && (
                                                            <Check size={20} className="text-primary shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between mt-8">
                                        <button
                                            onClick={handleBack}
                                            className="px-6 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!canProceed() || isSubmitting}
                                            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit to Expert"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Success & Preview */}
                            {currentStep === 6 && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="text-center mb-10">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <PartyPopper size={40} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Trip Request Submitted!</h2>
                                        <p className="text-gray-600 max-w-lg mx-auto">
                                            Your customized trip plan has been sent to our expert. They will review it and get back to you shortly.
                                        </p>
                                    </div>

                                    {/* Expert Action Card */}
                                    {selectedExpert && (
                                        <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
                                            <div className="flex flex-col md:flex-row items-center gap-6">
                                                <div className="shrink-0 relative">
                                                    {selectedExpert.avatar ? (
                                                        <img
                                                            src={selectedExpert.avatar}
                                                            alt={selectedExpert.name}
                                                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
                                                            {selectedExpert.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <h3 className="text-xl font-bold text-gray-900">{selectedExpert.name}</h3>
                                                    <p className="text-primary font-medium mb-2">Your dedicated travel expert</p>
                                                    <p className="text-gray-600 text-sm mb-4 max-w-md">
                                                        "I've received your request and I'm excited to help you plan your trip to {tripPlan.country}. Feel free to start a chat!"
                                                    </p>
                                                    {selectedExpert.whatsappNumber && (
                                                        <a
                                                            href={`https://wa.me/${selectedExpert.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selectedExpert.name}, I just submitted a trip request for ${tripPlan.country} on Travplan. I would like to discuss the details.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-200"
                                                        >
                                                            <MessageCircle size={20} />
                                                            Chat Now on WhatsApp
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Trip Summary Preview */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                                            Trip Summary
                                        </h3>
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Destination</p>
                                                    <p className="font-medium text-gray-900">{tripPlan.country}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Travelers</p>
                                                    <p className="font-medium text-gray-900">{getPeopleDisplayText()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Dates</p>
                                                    <p className="font-medium text-gray-900">
                                                        {tripPlan.dateType === "exact"
                                                            ? `${tripPlan.startDate} to ${tripPlan.endDate}`
                                                            : tripPlan.dateType === "approximate"
                                                                ? `${tripPlan.preferredMonth} (${tripPlan.tripDuration})`
                                                                : `Duration: ${tripPlan.tripDuration}`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Budget</p>
                                                    <p className="font-medium text-gray-900">INR {tripPlan.budgetPerPerson}/person</p>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Accommodation</p>
                                                    <p className="font-medium text-gray-900">
                                                        {accommodations.find(a => a.id === tripPlan.accommodation)?.label}
                                                    </p>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Trip Description</p>
                                                    <p className="font-medium text-gray-900 mt-1 whitespace-pre-wrap text-sm leading-relaxed p-3 bg-white rounded-lg border border-gray-100">
                                                        {tripPlan.tripDescription}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-10">
                                        <button
                                            onClick={() => router.push("/")}
                                            className="text-gray-500 font-medium hover:text-gray-900 transition-colors"
                                        >
                                            Return to Home
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Trip Summary */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Your Customized Trip Plan</h3>

                            {/* Country Image */}
                            <div className="relative h-40 rounded-lg overflow-hidden mb-4">
                                <Image
                                    src={getCountryImage()}
                                    alt={tripPlan.country || "Destination"}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Trip Title */}
                            {tripPlan.tripTitle && (
                                <h4 className="font-semibold text-gray-900 mb-3">{tripPlan.tripTitle}</h4>
                            )}

                            {/* Summary Details */}
                            <div className="space-y-2 text-sm">
                                {tripPlan.country && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Country:</span>
                                        <span className="text-primary font-medium flex items-center gap-1">
                                            {tripPlan.country}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {tripPlan.groupType && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">No. of People:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {getPeopleDisplayText()}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {/* Travel Dates - Show based on date type */}
                                {tripPlan.dateType === "exact" && tripPlan.startDate && tripPlan.endDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Travel Dates:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {tripPlan.startDate} to {tripPlan.endDate}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {tripPlan.dateType === "approximate" && tripPlan.preferredMonth && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Preferred Month:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {tripPlan.preferredMonth}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {(tripPlan.dateType === "approximate" || tripPlan.dateType === "decide-later") && tripPlan.tripDuration && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {tripPlan.tripDuration}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 3 && tripPlan.ageGroup && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Age Group:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {tripPlan.ageGroup}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 3 && tripPlan.tourType && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tour Type:</span>
                                        <span className="text-gray-900 flex items-center gap-1 text-right max-w-[150px] truncate">
                                            {tourTypes.find(t => t.id === tripPlan.tourType)?.label.substring(0, 20)}...
                                            <Check size={14} className="text-primary shrink-0" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 3 && tripPlan.accommodation && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Accommodation:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {accommodations.find(a => a.id === tripPlan.accommodation)?.label}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 4 && tripPlan.budgetPerPerson && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Budget Per Person:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            INR {tripPlan.budgetPerPerson}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 4 && tripPlan.planningStage && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Planning Stage:</span>
                                        <span className="text-gray-900 flex items-center gap-1 text-right max-w-[150px] truncate">
                                            {tripPlan.planningStage.substring(0, 20)}...
                                            <Check size={14} className="text-primary shrink-0" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 4 && tripPlan.tripDescription && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Trip Details:</span>
                                        <span className="text-gray-900 flex items-center gap-1 text-right max-w-[150px] truncate">
                                            {tripPlan.tripDescription.substring(0, 20)}...
                                            <Check size={14} className="text-primary shrink-0" />
                                        </span>
                                    </div>
                                )}
                                {currentStep >= 5 && selectedExpert && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Expert:</span>
                                        <span className="text-gray-900 flex items-center gap-1">
                                            {selectedExpert.name}
                                            <Check size={14} className="text-primary" />
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default function TripPlannerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <TripPlannerContent />
        </Suspense>
    )
}
