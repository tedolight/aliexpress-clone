'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    if (!id) return
    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load order')
        setOrder(data.order)
      } catch (err: any) {
        setError(err.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, router])

  const handleCancel = async () => {
    const token = localStorage.getItem('token')
    if (!token || !order) return
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${order._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason: 'User requested cancellation' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order')
      setOrder(data.order)
    } catch (e) {
      alert((e as any).message || 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Details</h1>
        {loading ? (
          <div>Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : order ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Order #</div>
                <div className="font-semibold text-gray-900">{order.orderNumber || order._id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Placed</div>
                <div className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-3">Items</h2>
            <ul className="divide-y divide-gray-200 mb-6">
              {order.items.map((it: any) => (
                <li key={it._id} className="py-3 flex justify-between">
                  <span>{it.product?.name || 'Product'} × {it.quantity}</span>
                  <span className="font-semibold">${Number(it.total).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(order.shippingAddress, null, 2)}</pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Totals</h3>
                <div className="space-y-1 text-gray-800">
                  <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>${Number(order.shippingCost).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
                </div>
              </div>
            </div>
            {['pending','confirmed','processing'].includes(order.status) && (
              <div className="mt-6">
                <button onClick={handleCancel} disabled={cancelling} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50">
                  {cancelling ? 'Cancelling…' : 'Cancel Order'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}


