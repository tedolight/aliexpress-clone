'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Product } from '@/types/global'
import toast from 'react-hot-toast'

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load product')
        setProduct(data.product)
      } catch (err: any) {
        setError(err.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please sign in to add items to cart')
      return
    }
    setAdding(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to add to cart')
      toast.success('Added to cart successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-red-600">
          {error || 'Product not found.'}
        </div>
        <Footer />
      </div>
    )
  }

  const primaryImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative w-full aspect-square bg-gray-100 rounded">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.slice(0, 8).map((img, idx) => (
                  <div key={idx} className="relative w-full aspect-square bg-gray-100 rounded overflow-hidden">
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="25vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
