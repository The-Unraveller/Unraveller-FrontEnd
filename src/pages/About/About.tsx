import * as React from 'react';
import Layout from '../../components/layout/Layout';
import { Users } from 'lucide-react';

const teamMembers = [
  { name: 'Anh Khoa', role: 'Trưởng nhóm / Giới thiệu' },
  { name: 'Đinh Quang Huy', role: 'Chiến lược / Thiết kế' },
  { name: 'Phạm Việt Dũng', role: 'Nghiên cứu khách hàng' },
  { name: 'Nguyễn Khánh Lê', role: 'Kiến trúc sư giải pháp' },
  { name: 'Tuấn Khoa', role: 'Lập trình viên / Triển khai' },
];

const coreValues = [
  {
    title: 'Học qua các tình huống mô phỏng',
    desc: 'Người học trải nghiệm tiếng Anh thông qua các mô phỏng thực tế: giao tiếp xã hội, phỏng vấn xin việc, du lịch và giải quyết các tình huống hàng ngày.',
  },
  {
    title: 'Hành trình cốt truyện + Game hóa',
    desc: 'Mở khóa các cốt truyện, nhân vật và thử thách mới khi bạn tiến bộ — xây dựng động lực học lâu dài thay vì chỉ luyện tập một cách máy móc.',
  },
  {
    title: 'Học tập tinh gọn (Micro-learning)',
    desc: 'Thiết kế phù hợp với thói quen của Gen Z: các bài học ngắn gọn, linh hoạt mà bạn có thể hoàn thành ở bất cứ đâu — khi đi lại hay trong giờ giải lao.',
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
          <h2 className="text-white text-2xl font-bold mb-5">The Unraveller là gì?</h2>
          <div className="ur-card p-6 rounded-2xl max-w-2xl mx-auto">
            <p className="text-white/70 text-sm leading-relaxed">
              The Unraveller là ứng dụng học tiếng Anh được xây dựng trên phương pháp <strong className="text-white">học qua các tình huống mô phỏng</strong> —
              thiết kế dành riêng cho thế hệ Gen Z tại Việt Nam. Thay vì tiếp cận ngôn ngữ thông qua
              các bài tập ngữ pháp và từ vựng rời rạc, The Unraveller đưa người dùng vào các tình huống thực tế sống động
              để việc tiếp thu ngôn ngữ diễn ra tự nhiên và thú vị nhất.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-10">
          <h2 className="text-white text-2xl font-bold text-center mb-6">Giá Trị Cốt Lõi</h2>
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
          <h2 className="text-white text-2xl font-bold text-center mb-5">Cách Thức Hoạt Động</h2>
          <div className="ur-card p-6 rounded-2xl max-w-2xl mx-auto">
            <p className="text-white/68 text-sm leading-relaxed">
              Nền tảng được thiết kế như một thế giới giả lập, nơi bạn nhập vai vào một nhân vật để khám phá cuộc sống bằng tiếng Anh.
              Sau khi đăng nhập, một người cố vấn ảo sẽ hướng dẫn bạn thực hiện các nhiệm vụ hàng ngày.
              Mỗi bài học là một thử thách — nghe, nói hoặc viết — giúp bạn kiếm điểm XP, mở khóa các cấp độ mới và nâng cao kỹ năng của mình theo thời gian.
            </p>
          </div>
        </section>

        {/* The Team */}
        <section className="pb-4">
          <h2 className="text-white text-2xl font-bold text-center mb-1">Đội Ngũ Phát Triển</h2>
          <p className="text-[#f5c842] text-sm italic text-center mb-1 font-medium">Dai Nao Thien Cung Team</p>
          <p className="text-white/50 text-sm text-center mb-7">
            Chúng tôi là nhóm gồm 5 sinh viên đến từ Trường Đại học FPT
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
