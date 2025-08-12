'use client'

import Link from 'next/link'
import { Category } from '@/types/global'
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Dumbbell, 
  Heart, 
  Car, 
  Camera, 
  BookOpen 
} from 'lucide-react'

interface CategoryGridProps {
  categories: Category[]
}

const categoryIcons: Record<string, any> = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  sports: Dumbbell,
  beauty: Heart,
  automotive: Car,
  photography: Camera,
  books: BookOpen,
}

const categoryColors: Record<string, string> = {
  electronics: 'bg-blue-500',
  fashion: 'bg-pink-500',
  home: 'bg-green-500',
  sports: 'bg-purple-500',
  beauty: 'bg-red-500',
  automotive: 'bg-gray-500',
  photography: 'bg-indigo-500',
  books: 'bg-yellow-500',
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  // If no categories from API, show default ones
  const displayCategories = categories.length > 0 ? categories : [
    { _id: '1', name: 'Electronics', slug: 'electronics', image: '' },
    { _id: '2', name: 'Fashion', slug: 'fashion', image: '' },
    { _id: '3', name: 'Home & Garden', slug: 'home', image: '' },
    { _id: '4', name: 'Sports & Outdoor', slug: 'sports', image: '' },
    { _id: '5', name: 'Beauty & Health', slug: 'beauty', image: '' },
    { _id: '6', name: 'Automotive', slug: 'automotive', image: '' },
    { _id: '7', name: 'Photography', slug: 'photography', image: '' },
    { _id: '8', name: 'Books & Media', slug: 'books', image: '' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {displayCategories.slice(0, 8).map((category) => {
        const Icon = categoryIcons[category.slug] || Home
        const bgColor = categoryColors[category.slug] || 'bg-gray-500'
        
        return (
          <Link
            key={category._id}
            href={`/category/${category.slug}`}
            className="group block"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 text-center group-hover:scale-105">
              <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Shop Now
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
} 