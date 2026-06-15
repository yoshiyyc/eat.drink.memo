// scripts/seed-firestore.js
// 把 shops-data.json 寫入 Firestore（shops + drinks）
// 前置：需要 scripts/serviceAccountKey.json（從 Firebase Console 下載）
// 執行：node scripts/seed-firestore.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 載入 service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function seedShop(shopData) {
  const slugRef  = db.collection('shops').doc(shopData.id);
  const slugSnap = await slugRef.get();

  let shopRef;
  if (slugSnap.exists) {
    // Slug ID 的 doc 已存在 → 只更新選項
    shopRef = slugRef;
    await shopRef.update({
      sizeOptions:    shopData.sizeOptions    ?? [],
      sugarOptions:   shopData.sugarOptions,
      iceOptions:     shopData.iceOptions,
      toppingOptions: shopData.toppingOptions,
    });
    console.log(`  ✏️  更新：${shopData.name} (${shopData.id})`);
  } else {
    // 找是否有舊的自動 ID doc（同名）
    const oldSnap = await db.collection('shops').where('name', '==', shopData.name).get();
    if (!oldSnap.empty) {
      const oldId    = oldSnap.docs[0].id;
      const oldDrinks = await db.collection('drinks').where('shopId', '==', oldId).get();
      const batch    = db.batch();
      oldDrinks.docs.forEach(d => batch.delete(d.ref));
      batch.delete(oldSnap.docs[0].ref);
      await batch.commit();
      console.log(`  🗑️  刪除舊 doc（${oldId}）及 ${oldDrinks.size} 筆飲料`);
    }

    shopRef = slugRef;
    await shopRef.set({
      name:           shopData.name,
      logoUrl:        null,
      reviewCount:    0,
      sizeOptions:    shopData.sizeOptions    ?? [],
      sugarOptions:   shopData.sugarOptions,
      iceOptions:     shopData.iceOptions,
      toppingOptions: shopData.toppingOptions,
      createdAt:      FieldValue.serverTimestamp(),
    });
    console.log(`  ➕ 新增：${shopData.name} (${shopData.id})`);
  }

  // 新增或更新飲料
  const shopId = shopRef.id;
  let added = 0, updated = 0;

  for (const drink of shopData.drinks) {
    const drinkData = {
      shopId,
      name:       drink.name,
      isSeasonal: drink.isSeasonal ?? false,
    };
    if (drink.availableSizes) drinkData.availableSizes = drink.availableSizes;
    if (drink.fixedOptions)   drinkData.fixedOptions   = drink.fixedOptions;
    if (drink.sugarOptions)   drinkData.sugarOptions   = drink.sugarOptions;
    if (drink.iceOptions)     drinkData.iceOptions     = drink.iceOptions;

    const existing = await db.collection('drinks')
      .where('shopId', '==', shopId)
      .where('name', '==', drink.name)
      .get();

    if (existing.empty) {
      await db.collection('drinks').add({ ...drinkData, createdAt: FieldValue.serverTimestamp() });
      added++;
    } else {
      await existing.docs[0].ref.update(drinkData);
      updated++;
    }
  }

  console.log(`     → 新增 ${added} 筆、更新 ${updated} 筆（共 ${shopData.drinks.length} 筆）`);
}

async function main() {
  const dataPath = join(__dirname, 'shops-data.json');
  const allShops = JSON.parse(readFileSync(dataPath, 'utf8'));
  const validShops = allShops.filter(s => s.drinks?.length > 0);
  const skipped    = allShops.filter(s => !s.drinks?.length);

  console.log('🌱 Firestore Seed — eat.drink.memo');
  console.log('====================================');
  console.log(`📦 要寫入：${validShops.length} 家`);
  if (skipped.length) {
    console.log(`⏭️  跳過（無資料）：${skipped.map(s => s.name).join('、')}`);
  }

  for (const shop of validShops) {
    await seedShop(shop);
  }

  console.log('\n✅ 完成！');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ 錯誤：', err.message);
  process.exit(1);
});
