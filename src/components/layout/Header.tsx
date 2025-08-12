'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X,
  Globe,
  ChevronDown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { User as UserType } from '@/types/global'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<UserType | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserProfile()
      fetchCartCount()
    }
  }, [])

  useEffect(() => {
    // Autofocus the header search so caret blinks
    searchInputRef.current?.focus()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.cart?.itemCount || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    // Also clear server cookie
    fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setCartCount(0)
    setIsUserMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-orange-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>Free shipping on orders over $50</span>
              <span>•</span>
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>English</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <span>•</span>
              <span>USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-orange-600">AliExpress</div>
            <span className="text-gray-600">Clone</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <label htmlFor="header-search" className="sr-only">Search products</label>
              <input
                id="header-search"
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchInputRef}
                autoFocus
                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Heart className="w-6 h-6" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <User className="w-6 h-6" />
                {user ? (
                  <span className="hidden sm:block">{user.name}</span>
                ) : (
                  <span className="hidden sm:block">Sign In</span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {user ? (
                    <>
                      <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        My Profile
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Sign In
                      </Link>
                      <Link href="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 mt-4">
          <Link href="/category/electronics" className="text-gray-600 hover:text-orange-600 transition-colors">
            Electronics
          </Link>
          <Link href="/category/fashion" className="text-gray-600 hover:text-orange-600 transition-colors">
            Fashion
          </Link>
          <Link href="/category/home" className="text-gray-600 hover:text-orange-600 transition-colors">
            Home & Garden
          </Link>
          <Link href="/category/sports" className="text-gray-600 hover:text-orange-600 transition-colors">
            Sports & Outdoor
          </Link>
          <Link href="/category/beauty" className="text-gray-600 hover:text-orange-600 transition-colors">
            Beauty & Health
          </Link>
          <Link href="/category/automotive" className="text-gray-600 hover:text-orange-600 transition-colors">
            Automotive
          </Link>
          <Link href="/flash-sales" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
            Flash Sales
          </Link>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link href="/category/electronics" className="text-gray-600 hover:text-orange-600 transition-colors py-2">
                Electronics
              </Link>
              <Link href="/category/fashion" className="text-gray-600 hover:text-orange-600 transition-colors py-2">
                Fashion
              </Link>
              <Link href="/category/home" className="text-gray-600 hover:text-orange-600 transition-colors py-2">
                Home & Garden
              </Link>
              <Link href="/category/sports" className="text-gray-600 hover:text-orange-600 transition-colors py-2">
                Sports & Outdoor
              </Link>
              <Link href="/category/beauty" className="text-gray-600 hover:text-orange-600 transition-colors py-2">
                Beauty & Health
              </Link>
              <Link href="/category/automotive" className="text-gray-600 hover:text-orange-600 transition-colors py-2">
                Automotive
              </Link>
              <Link href="/flash-sales" className="text-red-600 font-semibold hover:text-red-700 transition-colors py-2">
                Flash Sales
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 