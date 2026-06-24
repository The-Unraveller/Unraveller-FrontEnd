import * as React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-purple-900/40 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/logo.webp" 
              alt="The Unraveller" 
              className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]" 
              width={64}
              height={64}
            />
          </Link>

          {/* Links */}
          <div className="flex gap-8 text-white/50 text-sm font-medium">
            {['Học tập', 'Giáo dục', 'Nhập vai kể chuyện'].map(link => (
              <span key={link} className="hover:text-white cursor-pointer transition-colors">
                {link}
              </span>
            ))}
          </div>

          {/* Email */}
          <div className="md:ml-auto">
            <div
              className="border border-purple-700/30 rounded-xl px-4 py-2 text-white/60 text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              theunravellerteam@gmail.com
            </div>
          </div>
        </div>

        <div className="border-t border-purple-900/30 my-5" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-xs font-medium tracking-wider text-center">
            BẢN QUYỀN 2026, THE UNRAVELLER TEAM
          </p>
          <div className="flex items-center gap-5">
            {[
              { Icon: Facebook, id: 'footer-facebook', href: 'https://www.facebook.com/profile.php?id=61590870502658' },
              { Icon: Instagram, id: 'footer-instagram', href: 'https://www.instagram.com/theunravellerteam/' },
              { Icon: Twitter, id: 'footer-twitter', href: '#' },
              { Icon: Youtube, id: 'footer-youtube', href: '#' },
            ].map(({ Icon, id, href }) => (
              <a
                key={id}
                href={href}
                id={id}
                target={href !== '#' ? '_blank' : undefined}
                rel={href !== '#' ? 'noopener noreferrer' : undefined}
                className="text-white/40 hover:text-white transition-colors"
              >
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
