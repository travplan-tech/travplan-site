"use client"
import Image from "next/image"
import { useGetPhotoReviewsQuery } from "@/lib/api/reviewsApi"

interface TravelerPhoto {
  id: string | number
  image: string
  title: string
  name: string
}

export default function TravelersPhotos() {
  // RTK Query hook
  const { data: photos = [], isLoading: loading } = useGetPhotoReviewsQuery(8)

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (photos.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Photos from our Travelers</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(photos as TravelerPhoto[]).map((photo) => (
            <div key={photo.id} className="relative h-40 rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src={photo.image}
                alt={photo.title || `Photo by ${photo.name}`}
                fill
                className="object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs truncate max-w-full">{photo.title}</p>
                <p className="text-gray-300 text-[10px] truncate">by {photo.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
