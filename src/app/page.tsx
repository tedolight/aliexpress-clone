'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FlashSales from '@/components/home/FlashSales'
import Newsletter from '@/components/home/Newsletter'
import { Product, Category } from '@/types/global'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const productsResponse = await fetch('/api/products?limit=8&sortBy=rating&sortOrder=desc')
        const productsData = await productsResponse.json()
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories?level=0')
        const categoriesData = await categoriesResponse.json()

        setFeaturedProducts(productsData.products || [])
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Categories */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Shop by Category
            </h2>
            <CategoryGrid categories={categories} />
          </div>
        </section>

        {/* Flash Sales */}
        <section className="py-12 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <FlashSales />
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Featured Products
            </h2>
            <FeaturedProducts products={featuredProducts} />
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 bg-gray-900">
          <div className="container mx-auto px-4">
            <Newsletter />
        </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
