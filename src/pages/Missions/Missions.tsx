import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Star, BookOpen, Flame, ShoppingBag, HelpCircle, Users, Lock, Play,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';

const sidebarItems = [
  { icon: FileText, label: 'Report', to: '#' },
  { icon: Star, label: 'Score', to: '#' },
  { icon: BookOpen, label: 'Scenario', to: '/courses' },
  { icon: Flame, label: 'Streak', to: '#' },
  { icon: ShoppingBag, label: 'Market', to: '#' },
  { icon: HelpCircle, label: 'Guide', to: '#' },
  { icon: Users, label: 'Friends', to: '#' },
];

const courses = [
  {
    id: 1,
    stage: 'Stage 1',
    title: 'Coffee Shop Conversations',
    desc: 'Practice ordering, small talk, and social English in a café setting.',
    img: '/scenario_coffee.png',
    locked: false,
    stars: 3,
  },
  {
    id: 2,
    stage: 'Stage 2',
    title: 'Following Instructions',
    desc: 'Listen carefully, understand tasks, and execute with precision.',
    img: '/scenario_classroom.png',
    locked: false,
    stars: 2,
  },
  {
    id: 3,
    stage: 'Stage 3',
    title: 'Debate & Negotiation',
    desc: 'Practice arguing your point and reaching agreements in English.',
    img: '',
    locked: true,
    stars: 0,
  },
  {
    id: 4,
    stage: 'Stage 4',
    title: 'Storytelling',
    desc: 'Tell compelling stories in English with rich vocabulary.',
    img: '',
    locked: true,
    stars: 0,
  },
  {
    id: 5,
    stage: 'Stage 5',
    title: 'Detective Writing',
    desc: 'Describe scenes and solve mysteries in written English.',
    img: '/scenario_detective.png',
    locked: false,
    stars: 0,
  },
  {
    id: 6,
    stage: 'Stage 6',
    title: 'Advanced Roleplay',
    desc: 'Complex multi-character scenarios with layered objectives.',
    img: '',
    locked: true,
    stars: 0,
  },
];

const CourseCard = ({
  course,
  featured,
  onClick,
}: {
  course: typeof courses[0];
  featured?: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    id={`course-card-${course.id}`}
    className={`ur-card rounded-2xl overflow-hidden flex flex-col transition-all ${
      course.locked
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer ur-card-hover'
    } ${featured ? 'shadow-[0_8px_32px_rgba(124,58,237,0.3)]' : ''}`}
  >
    {/* Image */}
    <div className={`relative overflow-hidden flex-shrink-0 ${featured ? 'h-44' : 'h-32'}`}>
      {course.img && !course.locked ? (
        <>
          <img
            src={course.img}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {!course.locked && (
            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={14} className="text-white ml-0.5" fill="white" />
            </div>
          )}
        </>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'rgba(45,10,110,0.6)' }}
        >
          {course.locked ? (
            <Lock size={22} className="text-white/20" />
          ) : (
            <BookOpen size={22} className="text-white/20" />
          )}
        </div>
      )}
      {/* Stage label */}
      <span className="absolute top-2 left-2 text-xs font-black text-[#f5c842] bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
        {course.stage}
      </span>
    </div>

    {/* Content */}
    <div className="p-3 flex-1 flex flex-col gap-1">
      <h3 className="text-white text-xs font-bold leading-snug line-clamp-2">{course.title}</h3>
      {featured && <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{course.desc}</p>}
      {course.stars > 0 && (
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < course.stars ? 'text-[#f5c842]' : 'text-white/15'}`}>★</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const Missions = () => {
  const navigate = useNavigate();

  return (
    <Layout isLoggedIn username="USERNAME">
      <div className="max-w-screen-xl mx-auto px-4 py-5">
        <div className="flex gap-5">
          {/* ── Sidebar ── */}
          <aside className="hidden md:flex flex-col w-20 flex-shrink-0 gap-4">
            <div className="ur-card rounded-2xl p-2.5 flex flex-col items-center gap-0.5">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mb-2">
                <Users size={16} className="text-white/50" />
              </div>
              <div className="w-full h-px bg-white/10 mb-1" />
              {sidebarItems.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  id={`sidebar-${label.toLowerCase()}`}
                  className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl hover:bg-white/8 transition-colors w-full text-center group"
                >
                  <Icon size={15} className="text-white/45 group-hover:text-white/80 transition-colors" />
                  <span className="text-white/40 text-[10px] group-hover:text-white/70 transition-colors leading-none">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
            {/* Mini logo */}
            <div className="flex justify-center">
              <img src="/logo.png" alt="UR" className="h-12 object-contain opacity-70" />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-start gap-5 mb-5">
              <div className="flex-shrink-0 pt-2">
                <h1 className="text-white text-3xl font-black leading-tight">
                  Many<br />levels<br />have<br />appeared.
                </h1>
                <p className="text-white/40 text-xs mt-2 leading-relaxed max-w-[130px]">
                  Choose a stage to begin your journey.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                {courses.slice(0, 2).map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    featured
                    onClick={() => !c.locked && navigate(`/game/${c.id}`)}
                  />
                ))}
              </div>
            </div>

            {/* Wide locked card */}
            <div className="ur-card rounded-xl p-4 mb-4 opacity-50 flex items-center gap-4">
              <Lock size={18} className="text-white/30 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-xs font-bold">{courses[2].stage} — {courses[2].title}</p>
                <p className="text-white/35 text-xs truncate">{courses[2].desc}</p>
              </div>
              <span className="text-white/20 text-xs font-semibold flex-shrink-0">Locked</span>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-3 gap-3 items-start">
              <CourseCard
                course={courses[3]}
                onClick={() => {}}
              />
              <div className="flex items-center justify-center py-4 px-2 text-center">
                <h2 className="text-white text-xl font-black leading-tight">
                  Join the<br />course<br />now!
                </h2>
              </div>
              <CourseCard
                course={courses[4]}
                onClick={() => !courses[4].locked && navigate(`/game/${courses[4].id}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Missions;
