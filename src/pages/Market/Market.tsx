import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
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
      toast.error(`Insufficient XP. You need ${priceXp - user.xpBalance} more XP to buy ${itemName}.`);
      return;
    }

    setBuyingId(itemId);

    try {
      const response = await buyItem({ itemId, quantity: 1 });
      if (response.success) {
        // Update Zustand store immediately so header stats and profile stats sync up!
        updateUser({ xpBalance: response.newXpBalance });
        toast.success(`Asset acquired: ${itemName} added to inventory. Balance: ${response.newXpBalance} XP.`);
      } else {
        toast.error(response.message || 'Failed to acquire asset. Try again later.');
      }
    } catch (err: any) {
      console.error('Error purchasing item:', err);
      toast.error(err.response?.data?.message || 'Network error during transaction. Please verify connection.');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
              <span className="text-cyan-brand">🛒</span> THE BLACK MARKET
            </h1>
            <p className="text-white/45 text-xs font-mono uppercase tracking-wider mt-1">
              Exchange intelligence XP for elite gameplay tools and bypass mechanisms.
            </p>
          </div>

          {/* XP Balance Badge */}
          <div className="flex items-center gap-3 px-5 py-3 bg-cyan-brand/10 border border-cyan-brand/35 rounded-2xl shadow-glow-cyan">
            <div className="w-8 h-8 rounded-xl bg-cyan-brand/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-cyan-brand fill-cyan-brand/20" />
            </div>
            <div>
              <span className="text-white/40 text-[9px] font-mono uppercase block tracking-wider leading-none">Your Balance</span>
              <span className="text-cyan-brand font-black text-xl leading-none font-mono">{user?.xpBalance ?? 0} <span className="text-xs font-bold">XP</span></span>
            </div>
          </div>
        </div>



        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 text-cyan-brand animate-spin mb-4" />
            <p className="text-white/45 text-sm font-mono uppercase tracking-widest animate-pulse">Decrypting Shop Catalog...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="ur-card p-12 text-center rounded-2xl border border-white/5 bg-navy-2">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-base font-semibold">The black market has no active listings.</p>
            <p className="text-white/30 text-xs mt-1">Check back later for newly unlocked assets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const canAfford = (user?.xpBalance ?? 0) >= item.priceXp;
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
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                        {item.type}
                      </span>
                    </div>

                    {/* Item Content */}
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-cyan-brand transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed mt-2 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions & Cost */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-white/30 text-[9px] font-mono uppercase block leading-none">Cost</span>
                      <span className="text-cyan-brand font-black text-base font-mono flex items-center gap-1 mt-1 leading-none">
                        {item.priceXp} <span className="text-[10px] font-bold">XP</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuy(item.id, item.priceXp, item.name)}
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
                          Buying...
                        </>
                      ) : !canAfford ? (
                        'Locked'
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Acquire
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
