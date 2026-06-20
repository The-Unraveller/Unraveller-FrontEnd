import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, Play, ChevronRight, User } from 'lucide-react';

const missions = [
  { id: 1, title: 'Gọi đồ uống tại Cafe', desc: 'Tương tác với nhân viên pha chế để gọi thức uống phù hợp.', status: 'available', level: 1 },
  { id: 2, title: 'Báo cáo công việc', desc: 'Báo cáo kết quả dự án với quản lý trực tiếp.', status: 'locked', level: 2 },
  { id: 3, title: 'Đàm phán nhà cung cấp', desc: 'Thuyết phục nhà cung cấp giảm giá chi phí nguyên vật liệu.', status: 'locked', level: 3 },
  { id: 4, title: 'Phỏng vấn xin việc', desc: 'Trả lời các câu hỏi tình huống từ hội đồng tuyển dụng.', status: 'locked', level: 4 },
];

const MissionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-spy-black text-spy-green font-mono p-4 md:p-8">
      <header className="flex justify-between items-center mb-12 border-b border-spy-green/30 pb-4">
        <div className="text-2xl font-bold tracking-tighter">UNRAVELLER // DASHBOARD</div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <p className="text-gray-500">USER_NAME: <span className="text-spy-green">KHOA_PRO</span></p>
            <p className="text-gray-500">LEVEL: <span className="text-spy-blue">NOVICE_LEARNER</span></p>
          </div>
          <div className="w-10 h-10 border border-spy-green rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold uppercase mb-8 flex items-center gap-2">
          <ChevronRight /> CHỌN TÌNH HUỐNG LUYỆN TẬP
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {missions.map((mission) => (
            <div 
              key={mission.id}
              onClick={() => mission.status === 'available' && navigate(`/game/${mission.id}`)}
              className={`group relative p-6 border ${mission.status === 'locked' ? 'border-gray-800' : 'border-spy-green/40 hover:border-spy-green'} transition-all cursor-pointer`}
            >
              <div className="mb-4 flex justify-between">
                <span className="text-[10px] uppercase text-gray-500 tracking-widest">CHAPTER 0{mission.id}</span>
                {mission.status === 'locked' ? <Lock className="w-4 h-4 text-gray-800" /> : <Unlock className="w-4 h-4 text-spy-green animate-pulse" />}
              </div>
              
              <h3 className={`text-lg font-bold mb-2 uppercase ${mission.status === 'locked' ? 'text-gray-600' : 'text-spy-green'}`}>
                {mission.title}
              </h3>
              
              <p className={`text-xs mb-8 h-12 overflow-hidden ${mission.status === 'locked' ? 'text-gray-800' : 'text-gray-400'}`}>
                {mission.desc}
              </p>

              {mission.status === 'available' && (
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] px-2 py-1 bg-spy-green/10 border border-spy-green/20">LEVEL: {mission.level}</span>
                  <Play className="w-4 h-4 fill-spy-green group-hover:scale-125 transition-transform" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;
