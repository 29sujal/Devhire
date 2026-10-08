'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import API from '@/lib/axios'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'

export default function PremiumPage() {
  const { user } = useSelector((state) => state.auth)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  

// inside component:
const dispatch = useDispatch()

  // ✅ All hooks are called above — early return is safe now
  if (user?.isPremium) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(234,179,8,0.1)', border: '2px solid rgba(234,179,8,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 20px' }}>⭐</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '12px' }}>You're Premium! 🎉</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px' }}>
            You already have an active Premium membership. Enjoy all your benefits!
          </p>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
            {[
              '⭐ Featured profile badge active',
              '🔝 Priority in search results',
              '🤖 AI Resume Analyzer',
              '📊 Profile view analytics',
              '📧 Direct company messages',
              '🎯 Job match recommendations',
            ].map((b) => (
              <div key={b} style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>{b}</div>
            ))}
          </div>
          <button
            onClick={() => router.push('/dashboard/seeker')}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleUpgrade = async () => {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    try {
      const { data: order } = await API.post('/payment/create-order', { amount: 29900 })

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: 'INR',
          name: 'DevHire Premium',
          description: 'Premium Plan - 3 Months',
          order_id: order.id,
          handler: async (response) => {
            try {
              await API.post('/payment/activate-premium', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              dispatch(setUser({ ...user, isPremium: true }))
              toast.success('Welcome to Premium! 🎉')
              router.push('/dashboard/seeker')
            } catch {
              toast.error('Payment verified but activation failed')
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#2563eb' },
          modal: { ondismiss: () => setLoading(false) },
        }
        new window.Razorpay(options).open()
        setLoading(false)
      }
    } catch {
      toast.error('Failed to initiate payment')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '60px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '999px', color: '#eab308', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
            ⭐ DevHire Premium
          </span>
          <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#f1f5f9', marginBottom: '16px' }}>
            Get Hired Faster
          </h1>
          <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
            Stand out to companies and get priority visibility with DevHire Premium
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '60px' }}>

          {/* Free */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>Free</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>For getting started</p>
            <p style={{ fontSize: '36px', fontWeight: '900', color: '#f1f5f9', marginBottom: '24px' }}>₹0</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {['Browse all jobs', 'Apply to jobs', 'Basic profile', 'Track applications'].map((f) => (
                <div key={f} style={{ display: 'flex', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                  <span style={{ color: '#334155' }}>✓</span>{f}
                </div>
              ))}
            </div>
            <div style={{ padding: '13px', background: '#334155', borderRadius: '10px', color: '#64748b', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
              Current Plan
            </div>
          </div>

          {/* Premium */}
          <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))', border: '2px solid #2563eb', borderRadius: '20px', padding: '32px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '999px', color: 'white', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              MOST POPULAR
            </div>
            <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>Premium</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>For serious job seekers</p>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '36px', fontWeight: '900', color: '#f1f5f9' }}>₹299</span>
              <span style={{ color: '#64748b', fontSize: '14px' }}> / 3 months</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {[
                '⭐ Featured profile badge',
                '🔝 Priority in search results',
                '🤖 AI resume analyzer',
                '📊 Profile view analytics',
                '📧 Direct company messages',
                '🎯 Job match recommendations',
                '✅ Everything in Free',
              ].map((f) => (
                <div key={f} style={{ color: '#94a3b8', fontSize: '14px' }}>{f}</div>
              ))}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : 'Upgrade to Premium →'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px' }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px', marginBottom: '24px' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { q: 'How does featured profile work?', a: 'Your profile appears at the top of company searches with a ⭐ badge, making you more visible to recruiters.' },
              { q: 'Can I cancel anytime?', a: 'Premium is billed for 3 months. After the period ends, you automatically return to the free plan.' },
              { q: 'Is payment secure?', a: 'Yes, all payments are processed securely through Razorpay with bank-grade encryption.' },
            ].map((item) => (
              <div key={item.q} style={{ borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
                <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>{item.q}</p>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}