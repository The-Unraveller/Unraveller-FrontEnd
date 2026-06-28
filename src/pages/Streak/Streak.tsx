import * as React from 'react';
import { Flame, Calendar, Trophy, Star } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';

const Streak = () => {
	const { user } = useGameStore();

	const streakCount = user?.streakCount || 0;
	const today = new Date();
	const todayDayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
	const todayDate = today.getDate();

	// Generate calendar grid for current month view (28 days from 1st)
	const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
	const calendarDays = Array.from({ length: 28 }).map((_, idx) => {
		const dayNum = idx + 1;
		// Only mark as active if streak covers this day (no hardcoded data)
		const isActive = dayNum <= streakCount;
		return {
			dayNumber: dayNum,
			active: isActive,
			isToday: dayNum === todayDate && todayDate <= 28,
		};
	});

	return (
		<Layout isLoggedIn username={user?.username || 'User'} showBottomNav>
			<Seo
				title="Chuoi Ngay Hoc Tap"
				description="Theo doi chuoi ngay hoc tap cua ban trong The Unraveller. Xem lich su hoat dong va muc tieu thanh tuu."
				keywords="chuoi ngay, streak, hoat dong, thoi gian hoc, tinh than bat nhao"
				canonical="/streak"
				noIndex
			/>
			<div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
				<div className="mb-8">
					<h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
						<Flame className="text-orange-500 animate-pulse" /> THEO DÕI CHUỖI NGÀY
					</h1>
					<p className="text-white/45 text-xs uppercase tracking-wider mt-1">
						Theo dõi tần suất học tập và duy trì trạng thái hoạt động tích cực.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
					{/* Calendar Grid */}
					<div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
						<h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
							<Calendar className="w-4 h-4 text-cyan-brand" /> LỊCH SỬ HOẠT ĐỘNG
						</h2>
						<div className="grid grid-cols-7 gap-2.5 text-center mb-4">
							{daysOfWeek.map((day) => (
								<div key={day} className="text-white/30 text-[9px] font-bold tracking-wider">{day}</div>
							))}
						</div>
						<div className="grid grid-cols-7 gap-2.5 text-center">
							{calendarDays.map((d) => (
								<div
									key={d.dayNumber}
									className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
										d.active
											? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.1)]'
											: 'bg-white/5 border-white/5 text-white/20'
									} ${d.isToday ? 'border-cyan-brand focus:scale-105' : ''}`}
								>
									<div className="flex flex-col items-center">
										<span className="leading-none">{d.dayNumber}</span>
										{d.active && <span className="text-[7px] mt-0.5 leading-none">🔥</span>}
									</div>
								</div>
							))}
						</div>
						<p className="text-white/30 text-[9px] mt-4 uppercase text-right">
							Các ngày có 🔥 là ngày bạn đã hoạt động. Duy trì mỗi ngày để giữ chuỗi!
						</p>
					</div>

					{/* Side Info Panel */}
					<div className="lg:col-span-1 space-y-6">
						{/* Current status */}
						<div className="ur-card p-6 bg-navy-3 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)] relative overflow-hidden text-center">
							<div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none rounded-bl-full" />
							<Flame size={45} className="text-orange-500 mx-auto mb-3 animate-bounce" />
							<p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Chuỗi hoạt động hiện tại</p>
							<h2 className="text-white font-black text-4xl leading-none">{streakCount} NGÀY</h2>
							<p className="text-white/30 text-[9px] mt-2 uppercase tracking-wide">
								Duy trì luyện tập mỗi ngày để nhận hệ số nhân XP chuỗi ngày!
							</p>
						</div>

						{/* Milestones progress */}
						<div className="ur-card p-6 bg-navy-2 border border-white/5">
							<h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
								🏆 CỘT MỐC CHUỖI NGÀY
							</h3>
							<p className="text-white/30 text-[10px] mb-4">Hoàn thành kịch bản mỗi ngày để đạt mục tiêu chuỗi.</p>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Streak;
