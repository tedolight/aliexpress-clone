'use client'

import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Thank you for subscribing to our newsletter!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-orange-500 mr-3" />
          <h2 className="text-3xl font-bold text-white">Stay Updated</h2>
        </div>
        
        <p className="text-xl text-gray-300 mb-8">
          Subscribe to our newsletter and get the latest deals, product updates, and exclusive offers delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">%</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Exclusive Discounts</h3>
            <p className="text-gray-300 text-sm">
              Get access to subscriber-only deals and promotions
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Flash Sale Alerts</h3>
            <p className="text-gray-300 text-sm">
              Be the first to know about limited-time offers
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">🎁</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Free Gifts</h3>
            <p className="text-gray-300 text-sm">
              Receive special birthday offers and free samples
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 