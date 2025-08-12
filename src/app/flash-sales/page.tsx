'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/products/ProductCard'
import { Product } from '@/types/global'

export default function FlashSalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlashProducts()
  }, [])

  const fetchFlashProducts = async () => {
    try {
      const response = await fetch('/api/products?flashSale=true&limit=20')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching flash products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flash Sales
          </h1>
          <p className="text-gray-600">
            Limited time offers on amazing products. Don't miss out on these incredible deals!
          </p>
        </div>

        {/* Flash Sale Banner */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">⚡ Flash Sale Alert!</h2>
              <p className="text-red-100">
                These deals won't last long. Shop now before they're gone!
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">UP TO</div>
              <div className="text-4xl font-bold">70% OFF</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No flash sales available
            </h3>
            <p className="text-gray-600">
              Check back later for amazing deals and discounts!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
} 