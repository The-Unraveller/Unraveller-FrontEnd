import React from 'react';
import Layout from '../../components/layout/Layout';
import { Users } from 'lucide-react';

const teamMembers = [
  { name: 'Anh Khoa', role: 'Introduction / Lead' },
  { name: 'Dinh Quang Huy', role: 'Strategy / Design' },
  { name: 'Pham Viet Dung', role: 'Customer Insight' },
  { name: 'Nguyen Khanh Le', role: 'Solution Architect' },
  { name: 'Tuan Khoa', role: 'Execution / Dev' },
];

const coreValues = [
  {
    title: 'Simulation-Based Learning',
    desc: 'Learners experience English through real-life simulations: social interactions, job interviews, travel, and everyday problem-solving.',
  },
  {
    title: 'Story-driven + Gamification',
    desc: 'Unlock new storylines, characters, and challenges as you progress — building long-term motivation instead of mindless drilling.',
  },
  {
    title: 'Micro-learning',
    desc: 'Designed for Gen Z habits: short, flexible sessions you can complete on the go — during a commute or a break.',
  },
];

const About = () => {
  return (
    <Layout isLoggedIn={false}>
      <div className="max-w-screen-lg mx-auto px-6 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Unraveller" className="h-36 md:h-44 object-contain drop-shadow-2xl" />
        </div>

        <div className="ur-divider mb-8" />

        {/* What is The Unraveller */}
        <section className="mb-10 text-center">
          <h2 className="text-white text-2xl font-bold mb-5">What is The Unraveller?</h2>
          <div className="ur-card p-6 rounded-2xl max-w-2xl mx-auto">
            <p className="text-white/70 text-sm leading-relaxed">
              The Unraveller is an English learning app built on <strong className="text-white">simulation-based learning</strong> —
              designed exclusively for Gen Z in Vietnam. Instead of approaching language through
              grammar exercises and isolated vocabulary, The Unraveller places users inside vivid,
              real-world scenarios that make language learning feel natural and exciting.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-10">
          <h2 className="text-white text-2xl font-bold text-center mb-6">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coreValues.map((v, i) => (
              <div
                key={i}
                id={`value-card-${i}`}
                className="ur-card p-5 rounded-2xl border-purple-600/40 hover:border-purple-400/60 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-700/50 flex items-center justify-center mb-3">
                  <span className="text-[#f5c842] text-sm font-black">{i + 1}</span>
                </div>
                <h3 className="text-[#f5c842] font-bold text-sm mb-2">{v.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to use */}
        <section className="mb-10">
          <h2 className="text-white text-2xl font-bold text-center mb-5">How It Works</h2>
          <div className="ur-card p-6 rounded-2xl max-w-2xl mx-auto">
            <p className="text-white/68 text-sm leading-relaxed">
              The platform is designed like a simulation world where you take on the role of a
              character navigating life in English. After signing in, a virtual mentor guides
              you through daily missions. Each lesson is a challenge — listening, speaking, or
              writing — that earns you XP, unlocks new levels, and builds your skills over time.
            </p>
          </div>
        </section>

        {/* The Team */}
        <section className="pb-4">
          <h2 className="text-white text-2xl font-bold text-center mb-1">The Team</h2>
          <p className="text-[#f5c842] text-sm italic text-center mb-1 font-medium">Dai Nao Thien Cung Team</p>
          <p className="text-white/50 text-sm text-center mb-7">
            We are a group of 5 students from FPT University
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                id={`team-member-${i}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-purple-900/60 to-purple-800/30 rounded-2xl border border-purple-700/30 group-hover:border-purple-500/60 transition-all flex items-center justify-center">
                  <Users size={26} className="text-white/25" />
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-semibold">{member.name}</p>
                  <p className="text-white/45 text-xs">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
