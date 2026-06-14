import { useState } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAIL = 'yoshi.wind.dev@gmail.com';

const DRINKS_SEED = [
  { shopName: '五十嵐', drinks: ['四季春拿鐵', '四季春紅茶', '波霸奶茶', '仙草奶茶', '多多綠'] },
  { shopName: '麻古茶坊', drinks: ['黑糖珍珠鮮奶', '芒果芭樂多多', '烏龍拿鐵', '草莓奶茶'] },
  { shopName: '得正', drinks: ['珍珠奶茶', '烏龍奶茶', '冬瓜茶', '阿薩姆紅茶'] },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  async function handleSeedDrinks() {
    setLoading(true);
    setStatus('讀取店家資料...');
    try {
      const shopsSnap = await getDocs(collection(db, 'shops'));
      const shops = shopsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      let added = 0;
      for (const seed of DRINKS_SEED) {
        const shop = shops.find(s => s.name === seed.shopName);
        if (!shop) {
          setStatus(prev => prev + `\n找不到店家：${seed.shopName}`);
          continue;
        }

        for (const drinkName of seed.drinks) {
          const existing = await getDocs(
            query(collection(db, 'drinks'), where('shopId', '==', shop.id), where('name', '==', drinkName))
          );
          if (!existing.empty) continue;

          await addDoc(collection(db, 'drinks'), {
            shopId: shop.id,
            name: drinkName,
            isSeasonal: false,
          });
          added++;
        }
      }

      setStatus(`完成！新增了 ${added} 筆飲料資料。`);
    } catch (err) {
      setStatus(`錯誤：${err.message}`);
    }
    setLoading(false);
  }

  if (!isAdmin) {
    return <div className="p-8 text-gray-400">沒有權限</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-6">管理後台</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-gray-700 mb-2">Seed 飲料資料</h2>
        <p className="text-sm text-gray-500 mb-4">
          第一次執行才需要按，重複按不會新增重複資料。
        </p>
        <button
          onClick={handleSeedDrinks}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '新增中...' : '新增飲料資料'}
        </button>
        {status && (
          <pre className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
            {status}
          </pre>
        )}
      </div>
    </div>
  );
}
