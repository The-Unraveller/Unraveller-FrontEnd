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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2d0a6e] to-[#12003a] border border-purple-700/40 flex items-center justify-center shadow-lg hover:border-purple-500/60 transition-colors">
              <div className="text-center">
                <div className="w-9 h-7 rounded-md bg-gradient-to-br from-[#f5c842] to-[#e0a800] flex items-center justify-center mb-1">
                  <span className="text-[#12003a] font-black text-xs">UR</span>
                </div>
                <div className="w-7 h-1 bg-purple-600 rounded-full mx-auto" />
              </div>
            </div>
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
              Dainaothiencung@gmail.com
            </div>
          </div>
        </div>

        <div className="border-t border-purple-900/30 my-5" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-xs font-medium tracking-wider text-center">
            BẢN QUYỀN 2026, ĐẠI NÁO THIÊN CUNG COMPANY
          </p>
          <div className="flex items-center gap-5">
            {[
              { Icon: Facebook, id: 'footer-facebook' },
              { Icon: Instagram, id: 'footer-instagram' },
              { Icon: Twitter, id: 'footer-twitter' },
              { Icon: Youtube, id: 'footer-youtube' },
            ].map(({ Icon, id }) => (
              <a key={id} href="#" id={id} className="text-white/40 hover:text-white transition-colors">
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
