'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface ProductForm {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string;
  category: string;
  brand: string;
  stock: number;
  sku: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  tags: string;
  isActive: boolean;
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  images: '',
  category: '',
  brand: '',
  stock: 0,
  sku: '',
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  tags: '',
  isActive: true,
}

export default function AdminDashboard() {
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const isValidHttpUrl = (value: string) => {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message || 'Error fetching products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target
    const name = (target as any).name as keyof ProductForm
    const type = (target as HTMLInputElement).type
    const isCheckbox = target instanceof HTMLInputElement && type === 'checkbox'
    const nextValue = isCheckbox ? (target as HTMLInputElement).checked : target.value
    setForm((prev) => ({
      ...prev,
      [name]: nextValue as any,
    }))
  }

  const handleEdit = (product: any) => {
    setEditId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      images: (product.images || []).join(', '),
      category: product.category?._id || product.category || '',
      brand: product.brand || '',
      stock: product.stock || 0,
      sku: product.sku || '',
      weight: product.weight || 0,
      length: product.dimensions?.length || 0,
      width: product.dimensions?.width || 0,
      height: product.dimensions?.height || 0,
      tags: (product.tags || []).join(', '),
      isActive: product.isActive ?? true,
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const imageUrls = form.images
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0)

      if (imageUrls.length === 0) {
        throw new Error('Please provide at least one image URL')
      }

      const invalid = imageUrls.find((u) => !isValidHttpUrl(u))
      if (invalid) {
        throw new Error(`Invalid image URL: ${invalid}. Use full http(s) URLs.`)
      }

      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        images: imageUrls,
        category: form.category,
        brand: form.brand,
        stock: Number(form.stock),
        sku: form.sku,
        weight: Number(form.weight),
        dimensions: {
          length: Number(form.length),
          width: Number(form.width),
          height: Number(form.height),
        },
        tags,
        isActive: form.isActive,
      }

      const res = await fetch(editId ? `/api/products/${editId}` : '/api/products', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || (editId ? 'Failed to update product' : 'Failed to add product'))
      }
      setMessage(editId ? 'Product updated successfully!' : 'Product added successfully!')
      setForm(initialForm)
      setEditId(null)
      fetchProducts()
    } catch (err: any) {
      setError(err.message || (editId ? 'Error updating product' : 'Error adding product'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete product');
      }
      setMessage('Product deleted successfully!');
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryMessage(null);
    setCategoryError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name,
          slug: categoryForm.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      setCategoryMessage('Category created successfully!');
      setCategoryForm({ name: '', slug: '' });
      fetchCategories();
    } catch (err: any) {
      setCategoryError(err.message || 'Error creating category');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <section className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-3 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Category</h2>
            {categoryMessage && <div className="mb-2 text-green-600">{categoryMessage}</div>}
            {categoryError && <div className="mb-2 text-red-600">{categoryError}</div>}
            <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Category Name</span>
                <input name="name" value={categoryForm.name} onChange={handleCategoryChange} placeholder="e.g. Electronics" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Slug</span>
                <input name="slug" value={categoryForm.slug} onChange={handleCategoryChange} placeholder="electronics" className="border p-2 rounded w-full" required />
              </label>
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded col-span-1 md:col-span-2">Add Category</button>
            </form>
          </section>
          <section className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Product Management</h2>
            {message && <div className="mb-2 text-green-600">{message}</div>}
            {error && <div className="mb-2 text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Product Name</span>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Earbuds Pro" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Brand</span>
                <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. AudioTech" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Category</span>
                <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded w-full" required>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">SKU</span>
                <input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. AT-EB-200" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Price</span>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 29.99" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Original Price</span>
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="e.g. 79.99" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Stock</span>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="e.g. 150" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Weight (grams)</span>
                <input name="weight" type="number" value={form.weight} onChange={handleChange} placeholder="e.g. 250" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Length (cm)</span>
                <input name="length" type="number" value={form.length} onChange={handleChange} placeholder="e.g. 10" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Width (cm)</span>
                <input name="width" type="number" value={form.width} onChange={handleChange} placeholder="e.g. 5" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700">
                <span className="block mb-1">Height (cm)</span>
                <input name="height" type="number" value={form.height} onChange={handleChange} placeholder="e.g. 3" className="border p-2 rounded w-full" required />
              </label>
              <label className="text-sm text-gray-700 col-span-1 md:col-span-2">
                <span className="block mb-1">Image URLs</span>
                <input name="images" value={form.images} onChange={handleChange} placeholder="https://site.com/img1.jpg, https://site.com/img2.jpg" className="border p-2 rounded w-full" required />
                <div className="text-xs text-gray-500 mt-1">Use full http(s) URLs. Separate multiple with commas.</div>
              </label>
              <label className="text-sm text-gray-700 col-span-1 md:col-span-2">
                <span className="block mb-1">Tags</span>
                <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. wireless, earbuds, bluetooth" className="border p-2 rounded w-full" />
              </label>
              <label className="flex items-center space-x-2">
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                <span>Active</span>
              </label>
              <label className="text-sm text-gray-700 col-span-1 md:col-span-2">
                <span className="block mb-1">Description</span>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Write a clear, concise description and key features" className="border p-2 rounded w-full" required />
              </label>
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded col-span-1 md:col-span-2" disabled={loading}>{loading ? (editId ? 'Updating...' : 'Adding...') : (editId ? 'Update Product' : 'Add Product')}</button>
              {editId && (
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded col-span-1 md:col-span-2" onClick={handleCancelEdit} disabled={loading}>Cancel</button>
              )}
            </form>
            <div>
              <h3 className="text-lg font-semibold mb-2">Product List</h3>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <table className="min-w-full bg-white border rounded">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Brand</th>
                      <th className="border px-2 py-1">Category</th>
                      <th className="border px-2 py-1">Price</th>
                      <th className="border px-2 py-1">Stock</th>
                      <th className="border px-2 py-1">Active</th>
                      <th className="border px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4">No products found.</td></tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id}>
                          <td className="border px-2 py-1">{product.name}</td>
                          <td className="border px-2 py-1">{product.brand}</td>
                          <td className="border px-2 py-1">{product.category?.name || product.category}</td>
                          <td className="border px-2 py-1">{product.price}</td>
                          <td className="border px-2 py-1">{product.stock}</td>
                          <td className="border px-2 py-1">{product.isActive ? 'Yes' : 'No'}</td>
                          <td className="border px-2 py-1">
                            <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(product)}>Edit</button>
                            <button className="text-red-600 hover:underline" onClick={() => handleDelete(product._id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics overview and stats will appear here.</p>
          </section>
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">Manage users and permissions here.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
