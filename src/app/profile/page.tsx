'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { User } from '@/types/global'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', avatar: '' })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load profile')
        setUser(data.user)
        setForm({ name: data.user.name || '', avatar: data.user.avatar || '' })
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, avatar: form.avatar })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      setUser(data.user)
      toast.success('Profile updated')
      setEditing(false)
    } catch (e: any) {
      toast.error(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
        {loading ? (
          <div>Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : user ? (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                {editing ? (
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="border rounded p-2 w-full"
                  />
                ) : (
                  <div className="font-semibold text-gray-900">{user.name}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-semibold text-gray-900">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Role</div>
                <div className="font-semibold text-gray-900 capitalize">{user.role}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-semibold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600">Avatar URL</div>
                {editing ? (
                  <input
                    value={form.avatar}
                    onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
                    placeholder="https://..."
                    className="border rounded p-2 w-full"
                  />
                ) : (
                  <div className="font-semibold text-gray-900 break-all">{user.avatar || '—'}</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/orders" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">View Orders</a>
              <a href="/checkout" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded">Go to Checkout</a>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Edit Profile</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded">{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => { setEditing(false); setForm({ name: user.name, avatar: user.avatar || '' }) }} className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded">Cancel</button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}


