'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load orders')
        setOrders(data.orders || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
        {loading ? (
          <div>Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-600">No orders found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      <a href={`/orders/${order._id}`} className="text-orange-600 hover:underline">
                        {(order.orderNumber || order._id.slice(-6)).toUpperCase()}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">${Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{order.status || 'pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}


