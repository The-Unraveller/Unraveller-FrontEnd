import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';
import { getShopItems, buyItem } from '../../services/api';
import type { ShopItemDto } from '../../services/api';

const Market = () => {
  const { user, updateUser } = useGameStore();
  const [items, setItems] = useState<ShopItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    const loadShop = async () => {
      try {
        const shopItems = await getShopItems();
        setItems(shopItems);
      } catch (err) {
        console.error('Failed to load shop items:', err);
      } finally {
        setLoading(false);
      }
    };
    loadShop();
  }, []);

  const handleBuy = async (itemId: number, priceXp: number, itemName: string) => {
    if (!user) return;
    if (user.xpBalance < priceXp) {
      toast.error(`Không đủ XP. Bạn cần thêm ${priceXp - user.xpBalance} XP để mua ${itemName}.`);
      return;
    }

    setBuyingId(itemId);

    try {
      const response = await buyItem({ itemId, quantity: 1 });
      if (response.success) {
        // Update Zustand store immediately so header stats and profile stats sync up!
        updateUser({ xpBalance: response.newXpBalance });
        toast.success(`Giao dịch thành công: Đã thêm ${itemName} vào kho đặc vụ. Số dư: ${response.newXpBalance} XP.`);
      } else {
        toast.error(response.message || 'Không thể mua vật phẩm. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      console.error('Error purchasing item:', err);
      toast.error(err.response?.data?.message || 'Lỗi mạng khi giao dịch. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setBuyingId(null);
    }
  };

  const getTranslatedType = (type: string) => {
    switch (type) {
      case 'InGameHint': return 'GỢI Ý AI';
      case 'BribeNpc': return 'HỐI LỘ NPC';
      case 'Cosmetic': return 'TRANG TRÍ';
      default: return type.toUpperCase();
    }
  };

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
    <Seo title="Cho Den Hacker" description="Mua sam vat pham trong cho den hacker The Unraveller bang XP. Hack NPC, su dung goi y va do trang tri." keywords="cho den hacker, shop, mua vat pham, XP, game store" canonical="/market" noIndex />
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
              <span className="text-cyan-brand">🛒</span> CHỢ ĐEN HACKER
            </h1>
            <p className="text-white/45 text-xs font-mono uppercase tracking-wider mt-1">
              Đổi điểm kinh nghiệm đặc vụ (XP) để lấy các công cụ hỗ trợ giải mã và vượt qua bảo mật.
            </p>
          </div>

          {/* XP Balance Badge */}
          <div className="flex items-center gap-3 px-5 py-3 bg-cyan-brand/10 border border-cyan-brand/35 rounded-2xl shadow-glow-cyan">
            <div className="w-8 h-8 rounded-xl bg-cyan-brand/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-cyan-brand fill-cyan-brand/20" />
            </div>
            <div>
              <span className="text-white/40 text-[9px] font-mono uppercase block tracking-wider leading-none">Số dư hiện tại</span>
              <span className="text-cyan-brand font-black text-xl leading-none font-mono">{user?.xpBalance ?? 0} <span className="text-xs font-bold">XP</span></span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 text-cyan-brand animate-spin mb-4" />
            <p className="text-white/45 text-sm font-mono uppercase tracking-widest animate-pulse">Đang giải mã danh mục chợ đen...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="ur-card p-12 text-center rounded-2xl border border-white/5 bg-navy-2">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-base font-semibold">Chợ đen hiện không hoạt động giao dịch.</p>
            <p className="text-white/30 text-xs mt-1">Vui lòng quay lại sau để cập nhật danh mục vật phẩm mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const actualPrice = user?.isPremium ? item.discountPriceXp : item.priceXp;
              const canAfford = (user?.xpBalance ?? 0) >= actualPrice;
              const isBuying = buyingId === item.id;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.015 }}
                  className="ur-card p-5 rounded-2xl border border-white/5 bg-navy-2 flex flex-col justify-between group transition-all hover:border-cyan-brand/30"
                >
                  <div>
                    {/* Item Emoji & Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-brand/5 border border-cyan-brand/15 group-hover:border-cyan-brand/35 flex items-center justify-center text-2xl transition-all shadow-glow-cyan/5">
                        {item.emoji}
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-bold">
                        {getTranslatedType(item.type)}
                      </span>
                    </div>

                    {/* Item Content */}
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-cyan-brand transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed mt-2 line-clamp-3 font-sans">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions & Cost */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-white/30 text-[9px] font-mono uppercase block leading-none">Chi phí</span>
                      {user?.isPremium ? (
                        <div className="flex flex-col gap-0.5 mt-1">
                          <span className="text-white/35 text-[10px] font-mono line-through leading-none block">
                            {item.priceXp} XP
                          </span>
                          <span className="text-cyan-brand font-black text-sm font-mono flex items-center gap-1 leading-none mt-0.5">
                            {item.discountPriceXp} <span className="text-[9px] font-bold">XP</span>
                            <span className="text-[8px] text-green-400 font-bold ml-1 bg-green-500/10 px-1 py-0.5 rounded border border-green-500/10">VIP -20%</span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-cyan-brand font-black text-base font-mono flex items-center gap-1 mt-1 leading-none">
                          {item.priceXp} <span className="text-[10px] font-bold">XP</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleBuy(item.id, actualPrice, item.name)}
                      disabled={isBuying}
                      className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                        isBuying
                          ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                          : 'bg-cyan-brand hover:bg-cyan-brand/85 text-black border border-transparent shadow-glow-cyan/20'
                      }`}
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang mua...
                        </>
                      ) : !canAfford ? (
                        'Không đủ XP'
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Mua ngay
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Market;
