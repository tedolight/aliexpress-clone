'use client'

import { useState } from 'react'
import Link from 'next/link'
// Using native img for broader compatibility in grid cards
import { Product } from '@/types/global'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please sign in to add items to cart')
      return
    }

    setLoadingStates(prev => ({ ...prev, [productId]: true }))

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      })

      if (response.ok) {
        toast.success('Added to cart successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handleAddToWishlist = async (productId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please sign in to add items to wishlist')
      return
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      })

      if (response.ok) {
        toast.success('Added to wishlist!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to wishlist')
      }
    } catch (error) {
      toast.error('Failed to add to wishlist')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  // If no products from API, show placeholder products
  const displayProducts = products.length > 0 ? products : [
    {
      _id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 49.99,
      originalPrice: 79.99,
      images: ['/vercel.svg'],
      rating: 4.5,
      reviewCount: 128,
      vendor: { name: 'TechStore' },
      isFlashSale: false
    },
    {
      _id: '2',
      name: 'Smart Fitness Watch',
      price: 89.99,
      originalPrice: 129.99,
      images: ['/vercel.svg'],
      rating: 4.2,
      reviewCount: 95,
      vendor: { name: 'FitnessGear' },
      isFlashSale: true
    },
    {
      _id: '3',
      name: 'Portable Bluetooth Speaker',
      price: 29.99,
      originalPrice: 49.99,
      images: ['/vercel.svg'],
      rating: 4.7,
      reviewCount: 203,
      vendor: { name: 'AudioPro' },
      isFlashSale: false
    },
    {
      _id: '4',
      name: 'Wireless Charging Pad',
      price: 19.99,
      originalPrice: 39.99,
      images: ['/vercel.svg'],
      rating: 4.0,
      reviewCount: 67,
      vendor: { name: 'TechStore' },
      isFlashSale: true
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayProducts.map((product) => {
        const primaryImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null
        const displayImage = !imageErrors[product._id] && primaryImage ? primaryImage : '/vercel.svg'
        return (
        <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group">
          {/* Product Image */}
          <div className="relative overflow-hidden rounded-t-lg">
            <Link href={`/product/${product._id}`} className="block">
              <div className="relative w-full pt-[100%] bg-gray-200 flex items-center justify-center">
              <img
                src={displayImage}
                alt={product.name}
                onError={() => setImageErrors(prev => ({ ...prev, [product._id]: true }))}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              </div>
            </Link>
            
            {/* Flash Sale Badge */}
            {product.isFlashSale && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Flash Sale
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleAddToWishlist(product._id)}
                className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
              <Link
                href={`/product/${product._id}`}
                className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <Link href={`/product/${product._id}`} className="block">
              <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-2">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500 ml-1">
                ({product.reviewCount})
              </span>
            </div>

            {/* Vendor */}
            <p className="text-sm text-gray-500 mb-2">
              by {product.vendor?.name || 'Unknown Vendor'}
            </p>

            {/* Price */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(product._id)}
              disabled={loadingStates[product._id]}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates[product._id] ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      )})}
    </div>
  )
} 