import { Router, type IRouter } from "express";

const router: IRouter = Router();

const now = new Date().toISOString();
const d = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();

const collections = [
  { id: 1, nameAr: "هدايا الأعراس", nameEn: "Wedding Gifts", descriptionAr: "هدايا فاخرة تليق بأبهج المناسبات", descriptionEn: "Luxury gifts for the grandest occasions", imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", createdAt: d(30) },
  { id: 2, nameAr: "هدايا أعياد الميلاد", nameEn: "Birthday Gifts", descriptionAr: "اجعل يوم ميلادهم لا يُنسى", descriptionEn: "Make their birthday unforgettable", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", createdAt: d(29) },
  { id: 3, nameAr: "هدايا المواليد", nameEn: "Baby Gifts", descriptionAr: "احتفل بقدوم المولود الجديد", descriptionEn: "Celebrate the new arrival", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80", createdAt: d(28) },
  { id: 4, nameAr: "هدايا رمضان", nameEn: "Ramadan Gifts", descriptionAr: "هدايا مميزة لشهر الخير والبركة", descriptionEn: "Special gifts for the blessed month", imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80", createdAt: d(27) },
];

const products = [
  { id: 1, nameAr: "صندوق شوكولاتة فاخر", nameEn: "Luxury Chocolate Box", descriptionAr: "صندوق شوكولاتة بلجيكية فاخرة", descriptionEn: "Premium Belgian chocolate selection", price: 199, stock: 25, imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80", featured: true, collectionId: 1, collectionNameAr: "هدايا الأعراس", collectionNameEn: "Wedding Gifts", createdAt: d(20) },
  { id: 2, nameAr: "إطار صور معدني فاخر", nameEn: "Luxury Metal Photo Frame", descriptionAr: "إطار صور من المعدن الراقي", descriptionEn: "Premium metal photo frame with engraving", price: 145, stock: 40, imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", featured: true, collectionId: 1, collectionNameAr: "هدايا الأعراس", collectionNameEn: "Wedding Gifts", createdAt: d(19) },
  { id: 3, nameAr: "طقم شاي فاخر", nameEn: "Luxury Tea Set", descriptionAr: "طقم شاي من البورسلان الفاخر", descriptionEn: "Fine porcelain tea set in a gift box", price: 349, stock: 15, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", featured: true, collectionId: 1, collectionNameAr: "هدايا الأعراس", collectionNameEn: "Wedding Gifts", createdAt: d(18) },
  { id: 4, nameAr: "شمعة عطرية فاخرة", nameEn: "Luxury Scented Candle", descriptionAr: "شمعة عطرية بعطور راقية", descriptionEn: "Premium scented soy wax candle", price: 89, stock: 60, imageUrl: null, featured: true, collectionId: 2, collectionNameAr: "هدايا أعياد الميلاد", collectionNameEn: "Birthday Gifts", createdAt: d(17) },
  { id: 5, nameAr: "محفظة جلدية راقية", nameEn: "Elegant Leather Wallet", descriptionAr: "محفظة من الجلد الطبيعي الفاخر", descriptionEn: "Genuine leather bifold wallet", price: 275, stock: 30, imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80", featured: true, collectionId: 2, collectionNameAr: "هدايا أعياد الميلاد", collectionNameEn: "Birthday Gifts", createdAt: d(16) },
  { id: 6, nameAr: "ساعة أنيقة كلاسيكية", nameEn: "Classic Elegant Watch", descriptionAr: "ساعة كلاسيكية بتصميم أنيق", descriptionEn: "Classic timepiece with leather strap", price: 599, stock: 10, imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80", featured: false, collectionId: 2, collectionNameAr: "هدايا أعياد الميلاد", collectionNameEn: "Birthday Gifts", createdAt: d(15) },
  { id: 7, nameAr: "لعبة حيوانات محشوة", nameEn: "Stuffed Animal Toy", descriptionAr: "مجموعة حيوانات محشوة ناعمة", descriptionEn: "Soft plush animal set for babies", price: 95, stock: 50, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", featured: false, collectionId: 3, collectionNameAr: "هدايا المواليد", collectionNameEn: "Baby Gifts", createdAt: d(14) },
  { id: 8, nameAr: "طقم ملابس مولود", nameEn: "Newborn Clothing Set", descriptionAr: "طقم ملابس قطنية للمولود الجديد", descriptionEn: "Organic cotton newborn clothing set", price: 149, stock: 35, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80", featured: false, collectionId: 3, collectionNameAr: "هدايا المواليد", collectionNameEn: "Baby Gifts", createdAt: d(13) },
  { id: 9, nameAr: "تمور ملكية فاخرة", nameEn: "Royal Premium Dates", descriptionAr: "تمور مجدول فاخرة في علبة هدايا", descriptionEn: "Premium Medjool dates in a gift box", price: 129, stock: 80, imageUrl: null, featured: false, collectionId: 4, collectionNameAr: "هدايا رمضان", collectionNameEn: "Ramadan Gifts", createdAt: d(12) },
  { id: 10, nameAr: "بخور عودي فاخر", nameEn: "Luxury Oud Incense", descriptionAr: "بخور عود طبيعي فاخر", descriptionEn: "Premium natural oud wood incense", price: 320, stock: 20, imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80", featured: true, collectionId: 4, collectionNameAr: "هدايا رمضان", collectionNameEn: "Ramadan Gifts", createdAt: d(11) },
  { id: 11, nameAr: "مسبحة كريستال فاخرة", nameEn: "Luxury Crystal Tasbih", descriptionAr: "مسبحة من الكريستال الفاخر", descriptionEn: "Premium crystal prayer beads", price: 245, stock: 25, imageUrl: null, featured: false, collectionId: 4, collectionNameAr: "هدايا رمضان", collectionNameEn: "Ramadan Gifts", createdAt: d(10) },
  { id: 12, nameAr: "فانوس رمضاني تقليدي", nameEn: "Traditional Ramadan Lantern", descriptionAr: "فانوس رمضاني بتصميم تراثي أصيل", descriptionEn: "Traditional handcrafted Ramadan lantern", price: 189, stock: 30, imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80", featured: true, collectionId: 4, collectionNameAr: "هدايا رمضان", collectionNameEn: "Ramadan Gifts", createdAt: d(9) },
];

const settings = {
  id: 1,
  storeNameAr: "هدايا",
  storeNameEn: "Hadaya",
  timezone: "Africa/Cairo",
  defaultLanguage: "ar",
  logoUrl: null,
  faviconUrl: null,
  currencyCode: "SAR",
  currencySymbol: "ر.س",
  deliveryTimeAr: "2-5 أيام عمل",
  deliveryTimeEn: "2-5 business days",
  deliveryFee: 25,
  freeDeliveryThreshold: 200,
  giftLinkExpiryDays: 7,
  maxGiftMessageLength: 500,
  defaultGiftMessageAr: null,
  defaultGiftMessageEn: null,
  enableGiftWrapping: true,
  wrappingFee: 0,
  greetingCardFee: 0,
  maxRecipientsPerGift: 1,
  termsAr: null,
  termsEn: null,
  privacyAr: null,
  privacyEn: null,
  returnsAr: null,
  returnsEn: null,
  supportEmail: "hello@hadaya.sa",
  phone: "+966 50 000 0000",
  whatsapp: null,
  maintenanceMode: false,
  acceptNewOrders: true,
  socialLinks: [],
  paymentCod: true,
  paymentCreditCard: false,
  paymentVodafone: false,
  paymentVodafoneWallet: null,
  paymentVodafoneInstructions: null,
  paymentInstapay: false,
  paymentInstapayName: null,
  paymentInstapayId: null,
  paymentInstapayInstructions: null,
};

const orders = [
  { id: 1, customerName: "أحمد محمد", customerPhone: "+966501234567", customerEmail: "ahmed@example.com", status: "delivered", subtotal: 549, deliveryFee: 25, total: 574, paymentMethod: "cash_on_delivery", notes: null, isGift: false, giftToken: null, recipientName: null, recipientPhone: null, recipientAddress: null, recipientCity: null, giftMessage: null, createdAt: d(5) },
  { id: 2, customerName: "سارة علي", customerPhone: "+966509876543", customerEmail: "sara@example.com", status: "shipped", subtotal: 274, deliveryFee: 25, total: 299, paymentMethod: "bank_transfer", notes: null, isGift: true, giftToken: "abc123", recipientName: "فاطمة", recipientPhone: "+966501111111", recipientAddress: "شارع الملك فهد", recipientCity: "الرياض", giftMessage: "كل عام وأنت بخير!", createdAt: d(3) },
  { id: 3, customerName: "محمد عبدالله", customerPhone: "+966512345678", customerEmail: "m.abdallah@example.com", status: "confirmed", subtotal: 199, deliveryFee: 25, total: 224, paymentMethod: "cash_on_delivery", notes: "يرجى التغليف بعناية", isGift: false, giftToken: null, recipientName: null, recipientPhone: null, recipientAddress: null, recipientCity: null, giftMessage: null, createdAt: d(1) },
  { id: 4, customerName: "نورة خالد", customerPhone: "+966543210987", customerEmail: "noura@example.com", status: "pending", subtotal: 689, deliveryFee: 25, total: 714, paymentMethod: "bank_transfer", notes: null, isGift: false, giftToken: null, recipientName: null, recipientPhone: null, recipientAddress: null, recipientCity: null, giftMessage: null, createdAt: now },
];

const dashboard = {
  totalOrders: 4,
  pendingOrders: 1,
  totalRevenue: 1811,
  totalProducts: 12,
  recentOrders: orders.slice(0, 5),
  ordersByStatus: [
    { status: "pending", count: 1 },
    { status: "confirmed", count: 1 },
    { status: "shipped", count: 1 },
    { status: "delivered", count: 1 },
    { status: "cancelled", count: 0 },
  ],
  recentActivity: [
    { id: 1, type: "order_placed", message: "طلب جديد من نورة خالد", orderId: 4, createdAt: now },
    { id: 2, type: "order_shipped", message: "تم شحن طلب سارة علي", orderId: 2, createdAt: d(2) },
    { id: 3, type: "order_delivered", message: "تم تسليم طلب أحمد محمد", orderId: 1, createdAt: d(4) },
  ],
};

router.get("/healthz", (_req, res) => res.json({ status: "ok" }));

router.get("/products", (_req, res) => res.json(products));
router.get("/products/:id", (req, res) => {
  const p = products.find((x) => x.id === Number(req.params.id));
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json(p);
});

router.get("/collections", (_req, res) => res.json(collections));
router.get("/collections/:id", (req, res) => {
  const c = collections.find((x) => x.id === Number(req.params.id));
  if (!c) { res.status(404).json({ error: "Not found" }); return; }
  const collectionProducts = products.filter((p) => p.collectionId === c.id);
  res.json({ ...c, products: collectionProducts });
});

router.post("/orders", (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    customerName: req.body.customerName ?? "",
    customerPhone: req.body.customerPhone ?? "",
    customerEmail: req.body.customerEmail ?? "",
    status: "pending",
    subtotal: 0,
    deliveryFee: 25,
    total: 25,
    paymentMethod: req.body.paymentMethod ?? "cash_on_delivery",
    notes: req.body.notes ?? null,
    isGift: req.body.isGift ?? false,
    giftToken: req.body.isGift ? `mock-${Date.now()}` : null,
    recipientName: null, recipientPhone: null,
    recipientAddress: null, recipientCity: null, giftMessage: null,
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder as typeof orders[number]);
  res.status(201).json(newOrder);
});

router.get("/orders/:id", (req, res) => {
  const o = orders.find((x) => x.id === Number(req.params.id));
  if (!o) { res.status(404).json({ error: "Not found" }); return; }
  res.json(o);
});

router.get("/gift/:token", (req, res) => {
  const o = orders.find((x) => x.giftToken === req.params.token);
  if (!o) { res.status(404).json({ error: "Gift not found" }); return; }
  res.json(o);
});
router.patch("/gift/:token", (req, res) => {
  const o = orders.find((x) => x.giftToken === req.params.token);
  if (!o) { res.status(404).json({ error: "Gift not found" }); return; }
  Object.assign(o, req.body);
  res.json(o);
});

router.get("/admin/settings", (_req, res) => res.json(settings));
router.patch("/admin/settings", (req, res) => {
  Object.assign(settings, req.body);
  res.json(settings);
});

router.get("/admin/dashboard", (_req, res) => res.json(dashboard));

router.get("/admin/orders", (_req, res) => res.json(orders));
router.get("/admin/orders/:id", (req, res) => {
  const o = orders.find((x) => x.id === Number(req.params.id));
  if (!o) { res.status(404).json({ error: "Not found" }); return; }
  res.json(o);
});
router.patch("/admin/orders/:id", (req, res) => {
  const o = orders.find((x) => x.id === Number(req.params.id));
  if (!o) { res.status(404).json({ error: "Not found" }); return; }
  Object.assign(o, req.body);
  res.json(o);
});

router.get("/admin/products", (_req, res) => res.json(products));
router.post("/admin/products", (req, res) => {
  const newProd = { id: products.length + 1, ...req.body, createdAt: new Date().toISOString() };
  products.push(newProd);
  res.status(201).json(newProd);
});
router.patch("/admin/products/:id", (req, res) => {
  const p = products.find((x) => x.id === Number(req.params.id));
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  Object.assign(p, req.body);
  res.json(p);
});
router.delete("/admin/products/:id", (req, res) => {
  const idx = products.findIndex((x) => x.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  products.splice(idx, 1);
  res.status(204).send();
});

router.get("/admin/collections", (_req, res) => res.json(collections));
router.post("/admin/collections", (req, res) => {
  const newColl = { id: collections.length + 1, ...req.body, createdAt: new Date().toISOString() };
  collections.push(newColl);
  res.status(201).json(newColl);
});
router.patch("/admin/collections/:id", (req, res) => {
  const c = collections.find((x) => x.id === Number(req.params.id));
  if (!c) { res.status(404).json({ error: "Not found" }); return; }
  Object.assign(c, req.body);
  res.json(c);
});
router.delete("/admin/collections/:id", (req, res) => {
  const idx = collections.findIndex((x) => x.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  collections.splice(idx, 1);
  res.status(204).send();
});

export default router;
