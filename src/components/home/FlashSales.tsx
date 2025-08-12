'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
// Using native img for broader compatibility in grid cards
import { Product } from '@/types/global'
import { Clock, ArrowRight, Star } from 'lucide-react'

export default function FlashSales() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  const [flashProducts, setFlashProducts] = useState<Product[]>([])
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Fetch flash sale products
    const fetchFlashProducts = async () => {
      try {
        const response = await fetch('/api/products?flashSale=true&limit=4')
        const data = await response.json()
        let items = Array.isArray(data.products) ? data.products : []
        // If no active flash sales, fallback to top-rated products
        if (!items || items.length === 0) {
          const fallbackRes = await fetch('/api/products?limit=4&sortBy=rating&sortOrder=desc')
          const fallbackData = await fallbackRes.json()
          items = Array.isArray(fallbackData.products) ? fallbackData.products : []
        }
        setFlashProducts(items)
      } catch (error) {
        console.error('Error fetching flash products:', error)
      }
    }

    fetchFlashProducts()
  }, [])

  const handleBuyNow = async (productId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please sign in to buy')
      router.push('/login')
      return
    }

    setLoadingStates(prev => ({ ...prev, [productId]: true }))
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed to add to cart')
        return
      }
      router.push('/checkout')
    } catch (e) {
      toast.error('Failed to process request')
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }))
    }
  }

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  // Placeholder flash sale products
  const displayProducts = flashProducts.length > 0 ? flashProducts : [
    {
      _id: '1',
      name: 'Wireless Earbuds Pro',
      price: 29.99,
      originalPrice: 79.99,
      flashSalePrice: 29.99,
      images: ['/vercel.svg'],
      rating: 4.6,
      reviewCount: 342,
      vendor: { name: 'AudioTech' }
    },
    {
      _id: '2',
      name: 'Smart LED Strip Lights',
      price: 19.99,
      originalPrice: 49.99,
      flashSalePrice: 19.99,
      images: ['/vercel.svg'],
      rating: 4.3,
      reviewCount: 189,
      vendor: { name: 'HomeSmart' }
    },
    {
      _id: '3',
      name: 'Portable Power Bank 20000mAh',
      price: 24.99,
      originalPrice: 59.99,
      flashSalePrice: 24.99,
      images: ['/vercel.svg'],
      rating: 4.7,
      reviewCount: 567,
      vendor: { name: 'PowerTech' }
    },
    {
      _id: '4',
      name: 'Bluetooth Speaker Waterproof',
      price: 34.99,
      originalPrice: 89.99,
      flashSalePrice: 34.99,
      images: ['/vercel.svg'],
      rating: 4.4,
      reviewCount: 234,
      vendor: { name: 'SoundPro' }
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900">Flash Sales</h2>
          </div>
          <div className="flex items-center space-x-2 text-red-600 font-semibold">
            <span>Ends in:</span>
            <div className="flex space-x-1">
              <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-mono">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <span className="text-red-600">:</span>
              <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-mono">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <span className="text-red-600">:</span>
              <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-mono">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
        <Link 
          href="/flash-sales" 
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group">
          {/* Product Image */}
          <div className="relative overflow-hidden rounded-t-lg">
            <Link href={`/product/${product._id}`} className="block">
              <div className="relative w-full pt-[100%] bg-gray-200">
                {/* Use background-image to avoid any image layout issues */}
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{
                    backgroundImage: `url('${(!imageErrors[product._id] && Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : '/vercel.svg'}')`,
                  }}
                />
              </div>
            </Link>
              
              {/* Flash Sale Badge */}
              { (product as any).isFlashSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  FLASH SALE
                </div>
              )}

              {/* Discount Badge */}
              {(product.originalPrice > product.price) && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </div>
              )}
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
                <span className="text-xl font-bold text-red-600">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Sold: 75%</span>
                  <span>Left: 25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={() => handleBuyNow(product._id)}
                disabled={!!loadingStates[product._id]}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates[product._id] ? 'Processing…' : 'Buy Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 