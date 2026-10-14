"use client"
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Leaf, Award, Star, Info, IndianRupee, Globe, Shield, Heart, Zap, Users, MapPin, Clock, CheckCircle, Play } from 'lucide-react';
import { useGetFeatureBoxesQuery } from '@/lib/api/publicApi';
import { useGetHomepageSettingsQuery } from '@/lib/api/homepageApi';

interface FeatureBox {
  id: number
  title: string
  description: string | null
  icon: string
  order: number
  isActive: boolean
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Award,
  IndianRupee,
  Leaf,
  Star,
  Globe,
  Shield,
  Heart,
  Zap,
  Users,
  MapPin,
  Clock,
  CheckCircle,
}

// Default feature boxes (fallback)
const defaultFeatureBoxes: FeatureBox[] = [
  {
    id: 1,
    title: "Best Tours",
    description: "A strict screening process means we only offer vetted tours and trip packages, run with operators we work with directly and review after every departure.",
    icon: "Award",
    order: 0,
    isActive: true,
  },
  {
    id: 2,
    title: "Best Prices",
    description: "In most cases, we offer THE best prices. And, you get a Best Price Guarantee for all tours, as long as you redeem it within 24 hours of purchase.",
    icon: "IndianRupee",
    order: 1,
    isActive: true,
  },
  {
    id: 3,
    title: "Responsible Travel",
    description: "We plan trips with local operators, keep group sizes manageable and favour stays and transport that keep more of the spend within the places we visit.",
    icon: "Leaf",
    order: 2,
    isActive: true,
  },
  {
    id: 4,
    title: "Customers Love Us",
    description: "We've earned 800+ reviews across two trusted review platforms, with an average rating of 4.6 out of 5 stars.",
    icon: "Star",
    order: 3,
    isActive: true,
  },
]

interface TravelInfoProps {
  /** Server-rendered feature boxes and hero settings. */
  initialFeatureBoxes?: FeatureBox[]
  initialSettings?: Record<string, string>
}

const TravelInfoSection: React.FC<TravelInfoProps> = ({
  initialFeatureBoxes,
  initialSettings,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  // IntersectionObserver to detect when section enters viewport
  useEffect(() => {
    let observer: IntersectionObserver | null = null
    let mounted = true

    // Wait multiple frames for layout to fully settle
    const setupObserver = () => {
      if (!mounted) return

      const element = sectionRef.current
      if (!element) return

      // Get element position after layout has settled
      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Check if element top is significantly below the viewport
      // Use a threshold of 200px to be safe
      const isBelowViewport = rect.top > viewportHeight + 200

      if (!isBelowViewport) {
        // Element is visible or close to viewport, fetch immediately
        setIsInView(true)
        return
      }

      // Set up observer for when user scrolls to it
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && mounted) {
            setIsInView(true)
            observer?.disconnect()
          }
        },
        { rootMargin: '100px' }
      )

      observer.observe(element)
    }

    // Use double RAF to ensure layout is complete
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(setupObserver)
    })

    return () => {
      mounted = false
      cancelAnimationFrame(rafId)
      observer?.disconnect()
    }
  }, [])

  // RTK Query hook - only fetch when in view
  const { data: fetchedBoxes, isLoading: fetchingBoxes } = useGetFeatureBoxesQuery(undefined, {
    skip: !isInView || !!initialFeatureBoxes
  })

  // Homepage settings for banner image
  const { data: fetchedSettings } = useGetHomepageSettingsQuery(undefined, {
    skip: !isInView || !!initialSettings
  })

  // Prefer the server-rendered data, then the client query, then the built-in
  // defaults so the section is never empty.
  const apiFeatureBoxes = initialFeatureBoxes ?? fetchedBoxes
  const homepageSettings = initialSettings ?? fetchedSettings
  const loading = initialFeatureBoxes ? false : fetchingBoxes

  const featureBoxes = (apiFeatureBoxes && apiFeatureBoxes.length > 0)
    ? apiFeatureBoxes
    : defaultFeatureBoxes

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Award
  }

  const defaultBannerImage = "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_2070,c_limit/v1791880459/TravPlan/stock/unsplash-1542314831-068cd1dbfeeb.jpg"
  const bannerImage = homepageSettings?.bannerImage || defaultBannerImage

  return (
    <div ref={sectionRef} className="py-8 md:py-12 lg:py-16">
      <Image src={bannerImage} width={1000} height={500} alt="Banner Offer" className='w-full aspect-4/1 object-cover' />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
        {[...(loading ? defaultFeatureBoxes : featureBoxes)]
          .sort((a, b) => a.order - b.order)
          .map((box) => {
            const IconComponent = getIconComponent(box.icon)
            return (
              <div key={box.id} className={`p-6 rounded-lg bg-primary/10 flex flex-col space-y-3`}>
                <h3 className="flex items-center text-xl font-semibold">
                  <IconComponent className={`w-6 h-6 mr-2 text-primary`} />
                  {box.title}
                </h3>
                {box.description && (
                  <p className="text-sm">
                    {box.description}
                  </p>
                )}
              </div>
            )
          })}
      </div>
    </div>
  );
};

export default TravelInfoSection;