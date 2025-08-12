'use client'

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let initialStripePromise: Promise<Stripe | null> | null = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

async function fetchStripePromise(): Promise<Stripe | null> {
  if (initialStripePromise) return initialStripePromise;
  try {
    const res = await fetch('/api/stripe-pk');
    const data = await res.json();
    if (!res.ok || !data.publishableKey) throw new Error(data.error || 'Missing publishable key');
    initialStripePromise = loadStripe(data.publishableKey);
    return initialStripePromise;
  } catch {
    return null;
  }
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
}

const initialAddress: ShippingAddress = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zip: '',
  phone: '',
};

function PaymentSection({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    const fetchClientSecret = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
        const data = await res.json();
        if (!res.ok || !data.clientSecret) throw new Error(data.error || 'Failed to get client secret');
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || 'Error getting payment intent');
      } finally {
        setLoading(false);
      }
    };
    if (amount > 0) fetchClientSecret();
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setError(null);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });
      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div className="text-green-600 font-bold">Payment successful! Thank you for your order.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <CardElement
        className="border p-2 rounded bg-white"
        onChange={(e: any) => setCardComplete(!!e.complete)}
      />
      {error && <div className="text-red-600">{error}</div>}
      {!clientSecret && !error && (
        <div className="text-sm text-gray-500">Preparing payment…</div>
      )}
      <button
        type="submit"
        className="bg-orange-600 text-white px-4 py-2 rounded"
        disabled={loading || !stripe || !elements || !clientSecret || !cardComplete}
        title={!stripe ? 'Stripe not ready' : !clientSecret ? 'Payment not ready' : !cardComplete ? 'Enter card details' : ''}
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSaved, setAddressSaved] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState<Promise<Stripe | null> | null>(initialStripePromise);
  const [stripeKeyError, setStripeKeyError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>(initialStripePromise ? 'stripe' : 'cod');

  useEffect(() => {
    // If no publishable key at build-time, default to COD immediately
    if (!STRIPE_PK) {
      setPaymentMethod('cod')
    }
    fetchCart();
  }, []);

  useEffect(() => {
    if (!stripeReady) {
      fetchStripePromise().then((sp) => {
        if (!sp) setStripeKeyError('Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and restart the server.');
        setStripeReady(initialStripePromise);
      });
    }
  }, [stripeReady]);

  useEffect(() => {
    if (stripeKeyError) {
      setPaymentMethod('cod');
    }
  }, [stripeKeyError]);

  useEffect(() => {
    // Clear any stale order errors when switching method
    setOrderError(null);
  }, [paymentMethod]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      setCart(data.cart);
    } catch (err: any) {
      setError(err.message || 'Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    for (const key in address) {
      if (!address[key as keyof ShippingAddress]) {
        setAddressError('Please fill in all fields.');
        return;
      }
    }
    setAddressError(null);
    setAddressSaved(true);
  };

  async function placeOrder(method: 'stripe' | 'cod') {
    setOrderError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const shippingAddress = {
        name: address.name,
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zip,
        phone: address.phone,
      };
      const orderPayload = {
        items: cart.items.map((item: any) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: method,
        notes: '',
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      setOrderSuccess(true);
      setCart(null);
      setAddress(initialAddress);
      setAddressSaved(false);
    } catch (err: any) {
      setOrderError(err.message || 'Order placement error');
    }
  }

  const cartTotal = cart?.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600 mb-8">Complete your purchase by providing shipping details and payment.</p>
        {orderSuccess ? (
          <div className="text-green-600 font-bold text-2xl text-center py-12">Order placed successfully! Thank you for your purchase.</div>
        ) : (
          <>
            {loading ? (
              <div>Loading cart...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
                  <p className="text-sm text-gray-600 mb-4">We’ll use this address for delivery and billing.</p>
                  {addressSaved ? (
                    <div className="mb-4 text-green-600">Shipping address saved!</div>
                  ) : (
                    <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 gap-4">
                      <label className="text-sm text-gray-700">
                        <span className="block mb-1">Full Name</span>
                        <input name="name" value={address.name} onChange={handleAddressChange} placeholder="John Doe" className="border p-2 rounded w-full" required />
                      </label>
                      <label className="text-sm text-gray-700">
                        <span className="block mb-1">Address</span>
                        <input name="address" value={address.address} onChange={handleAddressChange} placeholder="123 Market St, Apt 5B" className="border p-2 rounded w-full" required />
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="text-sm text-gray-700">
                          <span className="block mb-1">City</span>
                          <input name="city" value={address.city} onChange={handleAddressChange} placeholder="San Francisco" className="border p-2 rounded w-full" required />
                        </label>
                        <label className="text-sm text-gray-700">
                          <span className="block mb-1">State/Province</span>
                          <input name="state" value={address.state} onChange={handleAddressChange} placeholder="CA" className="border p-2 rounded w-full" required />
                        </label>
                        <label className="text-sm text-gray-700">
                          <span className="block mb-1">ZIP/Postal Code</span>
                          <input name="zip" value={address.zip} onChange={handleAddressChange} placeholder="94103" className="border p-2 rounded w-full" required />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="text-sm text-gray-700">
                          <span className="block mb-1">Country</span>
                          <input name="country" value={address.country} onChange={handleAddressChange} placeholder="United States" className="border p-2 rounded w-full" required />
                        </label>
                        <label className="text-sm text-gray-700">
                          <span className="block mb-1">Phone Number</span>
                          <input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="+1 555 123 4567" className="border p-2 rounded w-full" required />
                        </label>
                      </div>
                      {addressError && <div className="text-red-600">{addressError}</div>}
                      <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">Save Address</button>
                    </form>
                  )}
                </section>
                <section className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                  <ul className="mb-4 divide-y divide-gray-200">
                    {cart?.items?.map((item: any) => (
                      <li key={item.product._id} className="flex justify-between items-center py-2">
                        <span className="font-semibold text-gray-900">
                          {item.product.name}
                          <span className="ml-2 font-normal text-gray-600">× {item.quantity}</span>
                        </span>
                        <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
          <div className="flex justify-between font-semibold text-lg mb-4">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
          {addressSaved && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input type="radio" name="payment-method" checked={paymentMethod==='stripe'} onChange={() => setPaymentMethod('stripe')} disabled={!!stripeKeyError || !STRIPE_PK} />
                    <span>Card (Stripe)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input type="radio" name="payment-method" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>
              {paymentMethod === 'stripe' ? (
                stripeReady ? (
                  <Elements stripe={stripeReady}>
                    <PaymentSection amount={cartTotal} onSuccess={() => placeOrder('stripe')} />
                  </Elements>
                ) : (
                  <div className="text-red-600">{stripeKeyError || 'Loading payment…'}</div>
                )
              ) : (
                <button onClick={() => placeOrder('cod')} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
                  Place Order (COD)
                </button>
              )}
            </div>
          )}
                </section>
              </div>
            )}
            {orderError && <div className="text-red-600 font-bold text-center py-4">{orderError}</div>}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
