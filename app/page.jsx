import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-[#0f172a]">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          ✨ AI Powered Job Board for Developers
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6">
          Find Your Dream{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Dev Job
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          DevHire connects talented developers with top companies. AI powered resume analysis, real time notifications and smart job matching — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/jobs" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-all no-underline">
            Browse Jobs →
          </Link>
          <Link href="/register?role=company" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-base transition-all no-underline">
            Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-16 mt-20">
          {[
            { number: '500+', label: 'Active Jobs' },
            { number: '200+', label: 'Companies' },
            { number: '10k+', label: 'Developers' },
            { number: '95%', label: 'Hire Rate' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-black text-white">{stat.number}</p>
              <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-3">
          Why developers choose DevHire
        </h2>
        <p className="text-slate-500 text-center mb-14">
          Everything you need to land your next role
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🤖', title: 'AI Resume Analyzer', desc: 'Upload your resume and get instant AI feedback. Know exactly what to improve before applying.', color: 'border-blue-500/20 hover:border-blue-500/40' },
            { icon: '⚡', title: 'Real Time Notifications', desc: 'Get notified instantly when a company views your profile or updates your application status.', color: 'border-violet-500/20 hover:border-violet-500/40' },
            { icon: '🎯', title: 'Smart Job Matching', desc: 'AI matches your skills with relevant jobs. Stop scrolling through irrelevant listings.', color: 'border-green-500/20 hover:border-green-500/40' },
            { icon: '💼', title: 'AI Job Description', desc: 'Companies can generate professional job descriptions with AI in seconds.', color: 'border-orange-500/20 hover:border-orange-500/40' },
            { icon: '🔒', title: 'Verified Companies', desc: 'Every company is verified by our team. No fake listings, no spam.', color: 'border-red-500/20 hover:border-red-500/40' },
            { icon: '📊', title: 'Application Tracking', desc: 'Track all your applications in one dashboard. Know your status at every stage.', color: 'border-cyan-500/20 hover:border-cyan-500/40' },
          ].map((f) => (
            <div key={f.title} className={`bg-white/[0.02] border ${f.color} rounded-2xl p-7 transition-all`}>
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-white font-bold text-lg mt-4 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-3">
          How it works
        </h2>
        <p className="text-slate-500 text-center mb-14">Get hired in 3 simple steps</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Profile', desc: 'Sign up and build your developer profile. Upload your resume and list your skills.' },
            { step: '02', title: 'Apply to Jobs', desc: 'Browse AI matched job listings and apply with one click. Track all applications in real time.' },
            { step: '03', title: 'Get Hired', desc: 'Get notified when companies respond. Chat with recruiters and land your dream job.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-400 font-black text-lg mx-auto mb-5">
                {s.step}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-16 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Ready to find your next role?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of developers who found their dream job on DevHire
          </p>
          <Link href="/register" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all no-underline">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        © 2026 DevHire. Built for developers, by developers.
      </footer>
    </div>
  )
}