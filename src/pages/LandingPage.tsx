import { Link } from 'react-router-dom';
import { Terminal, Shield, Cpu, MessageSquare, Play } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-spy-black text-white font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-10 h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="text-spy-green text-[10px] break-all p-1">
              {Math.random() > 0.5 ? '01' : '10'}
            </div>
          ))}
        </div>
      </div>

      <main className="z-10 max-w-4xl text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter glitch-text">
          UNRAVELLER
        </h1>
        <p className="text-spy-green text-xl mb-12 uppercase tracking-[0.2em]">
          Phá giải vụ án, giải mã thông điệp. Viết chuẩn để chiến thắng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Tra hỏi bằng AI"
            desc="Trò chuyện với các nhân vật độc đáo. Lời nói của bạn quyết định mức độ tin cậy."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Thanh đo Nghi ngờ"
            desc="Chú ý cách diễn đạt. Lỗi chính tả & ngữ pháp sẽ làm tăng sự nghi ngờ."
          />
          <FeatureCard
            icon={<Cpu className="w-8 h-8" />}
            title="Huấn luyện Đặc vụ"
            desc="Cải thiện tiếng Anh thông qua các nhiệm vụ đầy thử thách kịch tính."
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link to="/auth" className="group relative px-8 py-4 bg-spy-green text-black font-bold uppercase transition-all hover:bg-white hover:scale-105 flex items-center gap-2">
            <Play className="fill-black" /> Bắt đầu Nhiệm vụ
          </Link>
          <Link to="/about" className="px-8 py-4 border border-spy-green text-spy-green uppercase hover:bg-spy-green hover:text-black transition-all">
            Về dự án
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-4 text-[10px] text-gray-500 uppercase tracking-widest">
        DỰ ÁN: THE UNRAVELLER // v0.1 ALPHA // {new Date().getFullYear()}
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-6 border border-spy-green/30 bg-spy-black/50 backdrop-blur-sm hover:border-spy-green transition-all">
    <div className="text-spy-green mb-4 flex justify-center">{icon}</div>
    <h3 className="text-spy-green font-bold mb-2 uppercase">{title}</h3>
    <p className="text-xs text-gray-400">{desc}</p>
  </div>
);

export default LandingPage;
