import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    desc: 'Perfect for individuals exploring AI document analysis.',
    color: '#4F9CFF',
    glow: 'rgba(79,156,255,0.2)',
    border: 'rgba(79,156,255,0.2)',
    cta: 'Get started free',
    popular: false,
    features: [
      '10 documents / month',
      'Basic AI summarization',
      'PDF & Word support',
      '5 MB file size limit',
      'Community support',
      '7-day history',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 29, annual: 19 },
    desc: 'For professionals and growing teams who need more power.',
    color: '#9A4DFF',
    glow: 'rgba(154,77,255,0.25)',
    border: 'rgba(154,77,255,0.4)',
    cta: 'Start free trial',
    popular: true,
    features: [
      '200 documents / month',
      'Advanced AI Q&A',
      'All file formats',
      '50 MB file size limit',
      'Priority email support',
      'Unlimited history',
      'API access (500 calls/mo)',
      'Team sharing (up to 5)',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: 99, annual: 79 },
    desc: 'Custom scale for large organizations with compliance needs.',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.2)',
    border: 'rgba(52,211,153,0.2)',
    cta: 'Contact sales',
    popular: false,
    features: [
      'Unlimited documents',
      'Custom AI fine-tuning',
      'All file formats',
      '500 MB file size limit',
      'Dedicated support & SLA',
      'Unlimited history',
      'Unlimited API access',
      'Unlimited team members',
      'SSO / SAML 2.0',
      'On-premise deployment',
    ],
  },
];

const faqs = [
  { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes! Pro comes with a 14-day free trial. No credit card required.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise.' },
  { q: 'Is my data secure?', a: 'All documents are encrypted in transit and at rest. We are SOC 2 Type II compliant and never train on your data.' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Ambient glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(154,77,255,0.08) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,156,255,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(154,77,255,0.12)', border: '1px solid rgba(154,77,255,0.25)', color: '#B566FF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A4DFF] inline-block" />
            Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui', letterSpacing: '-0.02em' }}>Plans for every team</h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#8B92B0' }}>Start free, scale as you grow. No hidden fees, cancel anytime.</p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => setAnnual(false)} className="px-5 py-2 rounded-full text-sm font-medium transition-all" style={!annual ? { background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', color: '#fff', boxShadow: '0 4px 16px rgba(154,77,255,0.4)' } : { color: '#8B92B0' }}>Monthly</button>
            <button onClick={() => setAnnual(true)} className="px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2" style={annual ? { background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', color: '#fff', boxShadow: '0 4px 16px rgba(154,77,255,0.4)' } : { color: '#8B92B0' }}>
              Annual
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.2)', color: '#34D399' }}>Save 35%</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-8 flex flex-col transition-all duration-300"
              style={{
                background: plan.popular ? 'linear-gradient(135deg, rgba(154,77,255,0.12) 0%, rgba(79,156,255,0.08) 100%)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${plan.border}`,
                boxShadow: plan.popular ? `0 0 40px ${plan.glow}` : 'none',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', color: '#fff' }}>Most Popular</div>
              )}
              <div className="mb-6">
                <div className="text-sm font-semibold mb-1" style={{ color: plan.color }}>{plan.name}</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>${annual ? plan.price.annual : plan.price.monthly}</span>
                  {plan.price.monthly > 0 && <span className="text-sm mb-3" style={{ color: '#8B92B0' }}>/mo</span>}
                </div>
                <p className="text-sm" style={{ color: '#8B92B0' }}>{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: '#D4D8E8' }}>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" style={{ color: plan.color }}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(plan.name === 'Enterprise' ? '/personal/contact' : '/register')}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                style={plan.popular
                  ? { background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', color: '#fff', boxShadow: '0 8px 24px rgba(154,77,255,0.4)' }
                  : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#D4D8E8' }
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-white text-sm">{faq.q}</span>
                  <svg className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: '#8B92B0', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }} viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm" style={{ color: '#8B92B0' }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
