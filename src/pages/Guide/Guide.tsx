import { HelpCircle, BookOpen, AlertTriangle, Zap, Star, Shield } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';

const Guide = () => {
  const { user } = useGameStore();

  const rules = [
    {
      title: '🕵️‍♂️ LUẬT CHƠI HỘI THOẠI',
      icon: BookOpen,
      desc: 'Nhập câu trả lời viết tay của riêng bạn gửi cho NPC. Bạn sẽ nhận được phản hồi được AI đánh giá qua ba phần: Sửa lỗi (Typo correction), Diễn đạt tự nhiên hơn (More natural expression) và Giải thích ngắn gọn (Short explanation).',
    },
    {
      title: '⚠️ HỆ THỐNG MỨC NGHI NGỜ',
      icon: AlertTriangle,
      desc: 'Mỗi lượt, câu thoại của bạn sẽ được đánh giá. Nếu bạn dùng ngữ pháp yếu, viết sai chính tả hoặc diễn đạt không phù hợp, mức độ nghi ngờ sẽ tăng lên. Nếu mức độ nghi ngờ đạt 100%, bạn sẽ bị phát hiện và thất bại nhiệm vụ!',
    },
    {
      title: '⚡ ĐỒ DÙNG HACKER & VẬT PHẨM',
      icon: Zap,
      desc: 'Mua các công cụ từ cửa hàng bằng điểm XP tích lũy: Gợi ý AI (InGameHint) giúp bạn soạn câu trả lời tự nhiên, và Hối lộ NPC (BribeNpc) giúp giảm mức độ nghi ngờ. Sử dụng chúng thật cẩn thận khi chơi!',
    },
    {
      title: '🏆 MỤC TIÊU TRÌNH ĐỘ TIẾNG ANH CEFR',
      icon: Shield,
      desc: 'Chọn mục tiêu trình độ tiếng Anh của bạn (từ A1 đến C2) tại phần Hồ sơ Đặc vụ. Trợ lý AI sẽ tự động điều chỉnh độ nghiêm ngặt của từ vựng và cú pháp dựa trên cấp độ đã chọn. Trình độ cao đòi hỏi cách viết tự nhiên và phức tạp hơn.',
    },
  ];

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <HelpCircle className="text-purple-brand" /> SỔ TAY HƯỚNG DẪN & NGUYÊN TẮC ĐẶC VỤ
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Tài liệu hướng dẫn về hệ thống hội thoại, kiểm soát mức độ nghi ngờ, logic sử dụng vật phẩm và xếp hạng trình độ CEFR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="ur-card p-6 bg-navy-2 border border-white/5 relative overflow-hidden flex gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-cyan-brand flex-shrink-0 h-fit">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase mb-2 tracking-wider">{rule.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Progression FAQ */}
        <div className="ur-card p-6 bg-navy-2 border border-white/5">
          <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
            🛡️ HỆ THỐNG TIẾN TRÌNH CẤP BẬC & XP
          </h2>
          <div className="space-y-4 text-xs text-white/70">
            <div>
              <h4 className="font-bold text-white uppercase mb-1">Hỏi: Làm cách nào để tích lũy XP?</h4>
              <p className="text-white/45">Đáp: Hãy gửi các câu hội thoại chất lượng cao, đúng mục tiêu ngữ pháp và cấp độ CEFR. Mức độ nghi ngờ càng thấp, hệ số nhân thưởng XP khi hoàn thành màn chơi càng cao.</p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <h4 className="font-bold text-white uppercase mb-1">Hỏi: Điều gì xảy ra nếu tôi thất bại nhiệm vụ?</h4>
              <p className="text-white/45">Đáp: Bạn luôn có thể sử dụng nút "Chơi lại (Reset)" để đặt lại tiến trình hội thoại và bắt đầu lại từ đầu bất cứ lúc nào mà không gặp bất kỳ hình phạt nào.</p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <h4 className="font-bold text-white uppercase mb-1">Hỏi: Năng lượng ảnh hưởng như thế nào đến lượt chơi?</h4>
              <p className="text-white/45">Đáp: Mỗi lượt bắt đầu kịch bản hội thoại mới tiêu tốn 20 năng lượng. Năng lượng sẽ tự động hồi phục theo thời gian để cân bằng chu kỳ luyện tập hàng ngày của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Guide;
