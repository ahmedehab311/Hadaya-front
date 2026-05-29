import { db, collectionsTable, productsTable, settingsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Settings
  const existingSettings = await db.select().from(settingsTable).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settingsTable).values({
      storeName: "هدايا",
      storePhone: "+966 50 000 0000",
      storeEmail: "hello@hadaya.sa",
      deliveryFeeDefault: "25",
      deliveryFeeExpress: "50",
      deliveryNote: "التوصيل خلال 2-3 أيام عمل",
      bankAccountInfo: "بنك الراجحي — IBAN: SA00 0000 0000 0000 0000",
    });
    console.log("✓ Settings created");
  }

  // Collections
  const existingCols = await db.select().from(collectionsTable).limit(1);
  if (existingCols.length === 0) {
    const [weddings] = await db.insert(collectionsTable).values({
      nameAr: "هدايا الأعراس",
      nameEn: "Wedding Gifts",
      descriptionAr: "هدايا فاخرة تليق بأبهج المناسبات",
      descriptionEn: "Luxury gifts for the grandest occasions",
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    }).returning();

    const [birthday] = await db.insert(collectionsTable).values({
      nameAr: "هدايا أعياد الميلاد",
      nameEn: "Birthday Gifts",
      descriptionAr: "اجعل يومهم لا يُنسى بهدية مميزة",
      descriptionEn: "Make their day unforgettable with a special gift",
      imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    }).returning();

    const [babyShower] = await db.insert(collectionsTable).values({
      nameAr: "هدايا المواليد",
      nameEn: "Baby Gifts",
      descriptionAr: "هدايا رقيقة للمواليد الجدد وأمهاتهم",
      descriptionEn: "Gentle gifts for newborns and their mothers",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    }).returning();

    const [ramadan] = await db.insert(collectionsTable).values({
      nameAr: "هدايا رمضان",
      nameEn: "Ramadan Gifts",
      descriptionAr: "هدايا مميزة تعبر عن المحبة في شهر الخير",
      descriptionEn: "Special gifts that express love in the blessed month",
      imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
    }).returning();

    console.log("✓ Collections created");

    // Products
    const products = [
      // Wedding
      { nameAr: "طقم شاي فاخر", nameEn: "Luxury Tea Set", price: "349", collectionId: weddings.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80", descriptionAr: "طقم شاي فاخر من الخزف الإنجليزي", descriptionEn: "Premium English porcelain tea set" },
      { nameAr: "صندوق شوكولاتة فاخر", nameEn: "Premium Chocolate Box", price: "199", collectionId: weddings.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80", descriptionAr: "تشكيلة فاخرة من أجود أنواع الشوكولاتة", descriptionEn: "A luxurious selection of the finest chocolates" },
      { nameAr: "إطار صور معدني فاخر", nameEn: "Luxury Metal Photo Frame", price: "145", collectionId: weddings.id, imageUrl: "https://images.unsplash.com/photo-1584386426985-ec6e38b0d382?w=600&q=80", descriptionAr: "إطار صور أنيق من المعدن الذهبي", descriptionEn: "Elegant gold metal photo frame" },
      // Birthday
      { nameAr: "شمعة عطرية فاخرة", nameEn: "Luxury Scented Candle", price: "89", collectionId: birthday.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1602827114372-0c0b6a9db74a?w=600&q=80", descriptionAr: "شمعة عطرية بعطر الياسمين والورد", descriptionEn: "Aromatic candle with jasmine and rose scent" },
      { nameAr: "محفظة جلدية راقية", nameEn: "Premium Leather Wallet", price: "275", collectionId: birthday.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", descriptionAr: "محفظة من الجلد الطبيعي الإيطالي", descriptionEn: "Wallet made from genuine Italian leather" },
      { nameAr: "ساعة أنيقة كلاسيكية", nameEn: "Classic Elegant Watch", price: "599", collectionId: birthday.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", descriptionAr: "ساعة كلاسيكية بعقارب من الفولاذ", descriptionEn: "Classic watch with stainless steel hands" },
      // Baby
      { nameAr: "طقم ملابس مولود", nameEn: "Newborn Clothing Set", price: "149", collectionId: babyShower.id, imageUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80", descriptionAr: "طقم ملابس ناعمة للمواليد من القطن العضوي", descriptionEn: "Soft newborn clothing set made from organic cotton" },
      { nameAr: "لعبة حيوانات محشوة", nameEn: "Stuffed Animal Toy", price: "95", collectionId: babyShower.id, imageUrl: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&q=80", descriptionAr: "لعبة حيوانات محشوة ناعمة وآمنة للأطفال", descriptionEn: "Soft and safe stuffed animal toy for babies" },
      // Ramadan
      { nameAr: "تمور ملكية فاخرة", nameEn: "Royal Premium Dates", price: "129", collectionId: ramadan.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1612299065617-f7d5b51c03a1?w=600&q=80", descriptionAr: "أجود أنواع التمور المجمعة يدوياً", descriptionEn: "The finest hand-picked premium dates" },
      { nameAr: "فانوس رمضاني تقليدي", nameEn: "Traditional Ramadan Lantern", price: "189", collectionId: ramadan.id, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80", descriptionAr: "فانوس رمضاني مزخرف بنقوش إسلامية أصيلة", descriptionEn: "Decorative Ramadan lantern with authentic Islamic patterns" },
      { nameAr: "مسبحة كريستال فاخرة", nameEn: "Luxury Crystal Misbaha", price: "245", collectionId: ramadan.id, imageUrl: "https://images.unsplash.com/photo-1524193888344-6dc77b8ebb95?w=600&q=80", descriptionAr: "مسبحة من الكريستال الطبيعي بخيط حريري", descriptionEn: "Natural crystal misbaha with silk thread" },
      // Standalone
      { nameAr: "بخور عودي فاخر", nameEn: "Luxury Oud Incense", price: "320", collectionId: null, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=600&q=80", descriptionAr: "بخور عودي طبيعي بأرقى العطور الشرقية", descriptionEn: "Natural oud incense with the finest oriental scents" },
    ];

    for (const p of products) {
      await db.insert(productsTable).values({
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        price: p.price,
        imageUrl: p.imageUrl,
        descriptionAr: p.descriptionAr,
        descriptionEn: p.descriptionEn,
        collectionId: p.collectionId,
        isFeatured: p.isFeatured ?? false,
        inStock: true,
      });
    }
    console.log(`✓ ${products.length} products created`);
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
