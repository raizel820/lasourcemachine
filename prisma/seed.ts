import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ============================================
  // 1. ADMIN USER
  // ============================================
  console.log('📝 Creating Admin User...');
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: 'admin123',
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('   ✅ Admin user created.\n');

  // ============================================
  // 2. CATEGORIES
  // ============================================
  console.log('📂 Creating Categories...');
  const categoriesData = [
    {
      name: JSON.stringify({ en: 'CNC Machines', fr: 'Machines CNC', ar: 'آلات التحكم الرقمي' }),
      slug: 'cnc-machines',
      icon: 'Cpu',
      order: 1,
    },
    {
      name: JSON.stringify({ en: 'Press Machines', fr: 'Machines de Presse', ar: 'آلات الضغط' }),
      slug: 'press-machines',
      icon: 'ArrowDownToLine',
      order: 2,
    },
    {
      name: JSON.stringify({ en: 'Lathes & Turning', fr: 'Tours et Tournage', ar: 'الخراطات والتشكيل' }),
      slug: 'lathes-turning',
      icon: 'RotateCw',
      order: 3,
    },
    {
      name: JSON.stringify({ en: 'Welding Equipment', fr: 'Équipements de Soudure', ar: 'معدات اللحام' }),
      slug: 'welding-equipment',
      icon: 'Flame',
      order: 4,
    },
    {
      name: JSON.stringify({ en: 'Cutting & Shearing', fr: 'Coupe et Cisaillement', ar: 'القطع والقص' }),
      slug: 'cutting-shearing',
      icon: 'Scissors',
      order: 5,
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
    console.log(`   ✅ Category: ${cat.slug}`);
  }
  console.log('');

  // ============================================
  // 3. MACHINES (12)
  // ============================================
  console.log('⚙️ Creating Machines...');

  const machinesData = [
    // --- CNC Machines ---
    {
      name: JSON.stringify({
        en: 'CNC Vertical Machining Center VM-500',
        fr: 'Centre d\'Usinage Vertical CNC VM-500',
        ar: 'مركز تصنيع عمودي بالتحكم الرقمي VM-500',
      }),
      slug: 'cnc-vertical-machining-center-vm-500',
      description: JSON.stringify({
        en: 'The VM-500 is a high-precision CNC vertical machining center designed for demanding industrial applications. It features a rigid cast iron structure and advanced servo motors for exceptional accuracy. Ideal for aerospace, automotive, and general engineering workshops.',
        fr: 'Le VM-500 est un centre d\'usinage vertical CNC de haute précision conçu pour les applications industrielles exigeantes. Il dispose d\'une structure en fonte rigide et de servomoteurs avancés pour une précision exceptionnelle. Idéal pour l\'aérospatiale, l\'automobile et les ateliers d\'ingénierie générale.',
        ar: 'جهاز VM-500 هو مركز تصنيع عمودي بالتحكم الرقمي عالي الدقة مصمم للتطبيقات الصناعية المتطلبة. يتميز بهيكل من الحديد الزهر المتين ومحركات سيرفو متقدمة لدقة استثنائية. مثالي للطيران والسيارات وورش الهندسة العامة.',
      }),
      shortDesc: JSON.stringify({
        en: 'High-precision 3-axis CNC machining center for complex part manufacturing.',
        fr: 'Centre d\'usinage CNC 3 axes de haute précision pour la fabrication de pièces complexes.',
        ar: 'مركز تصنيع بالتحكم الرقمي 3 محاور عالي الدقة لتصنيع القطع المعقدة.',
      }),
      categoryId: categories['cnc-machines'],
      machineType: 'CNC',
      capacity: '500mm x 500mm',
      specs: JSON.stringify({
        en: [
          { key: 'Power', value: '15 kW' },
          { key: 'Spindle Speed', value: '12,000 RPM' },
          { key: 'Table Size', value: '500 x 500 mm' },
          { key: 'Weight', value: '4,500 kg' },
          { key: 'Accuracy', value: '±0.005 mm' },
        ],
        fr: [
          { key: 'Puissance', value: '15 kW' },
          { key: 'Vitesse de Broche', value: '12 000 tr/min' },
          { key: 'Taille de Table', value: '500 x 500 mm' },
          { key: 'Poids', value: '4 500 kg' },
          { key: 'Précision', value: '±0,005 mm' },
        ],
        ar: [
          { key: 'الطاقة', value: '15 kW' },
          { key: 'سرعة العمود', value: '12,000 لفة/د' },
          { key: 'حجم الطاولة', value: '500 × 500 مم' },
          { key: 'الوزن', value: '4,500 كجم' },
          { key: 'الدقة', value: '±0.005 مم' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 18500000,
      status: 'published',
      featured: true,
      order: 1,
    },
    {
      name: JSON.stringify({
        en: 'CNC Lathe CL-300',
        fr: 'Tour CNC CL-300',
        ar: 'خراطة تحكم رقمي CL-300',
      }),
      slug: 'cnc-lathe-cl-300',
      description: JSON.stringify({
        en: 'The CL-300 CNC lathe offers superior turning performance for medium to large workpieces. Equipped with a powerful spindle and high-speed turret, it handles complex turning operations with ease. Perfect for serial production and custom machining tasks.',
        fr: 'Le tour CNC CL-300 offre des performances de tournage supérieures pour les pièces de taille moyenne à grande. Équipé d\'une broche puissante et d\'une tourelle rapide, il gère les opérations de tournage complexes avec facilité. Parfait pour la production en série et les tâches d\'usinage personnalisées.',
        ar: 'تقدم خراطة التحكم الرقمي CL-300 أداء تشكيل فائق للقطع المتوسطة إلى الكبيرة. مجهزة بعمود دوار قوي وبرج عالي السرعة، تتعامل مع عمليات التشكيل المعقدة بسهولة. مثالية للإنتاج المتسلسل ومهام التشكيل المخصص.',
      }),
      shortDesc: JSON.stringify({
        en: 'Precision CNC lathe for medium to large workpiece turning operations.',
        fr: 'Tour CNC de précision pour le tournage de pièces moyennes à grandes.',
        ar: 'خراطة تحكم رقمي دقيقة لتشكيل القطع المتوسطة والكبيرة.',
      }),
      categoryId: categories['cnc-machines'],
      machineType: 'CNC',
      capacity: '300mm swing',
      specs: JSON.stringify({
        en: [
          { key: 'Power', value: '11 kW' },
          { key: 'Max Swing', value: '300 mm' },
          { key: 'Spindle Speed', value: '50-4,000 RPM' },
          { key: 'Weight', value: '3,200 kg' },
          { key: 'Tool Stations', value: '8' },
        ],
        fr: [
          { key: 'Puissance', value: '11 kW' },
          { key: 'Swing Max', value: '300 mm' },
          { key: 'Vitesse de Broche', value: '50-4 000 tr/min' },
          { key: 'Poids', value: '3 200 kg' },
          { key: 'Postes d\'Outil', value: '8' },
        ],
        ar: [
          { key: 'الطاقة', value: '11 kW' },
          { key: 'أقصى قطر تشغيل', value: '300 مم' },
          { key: 'سرعة العمود', value: '50-4,000 لفة/د' },
          { key: 'الوزن', value: '3,200 كجم' },
          { key: 'محطات الأدوات', value: '8' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
      ]),
      basePrice: 12500000,
      status: 'published',
      featured: false,
      order: 2,
    },
    {
      name: JSON.stringify({
        en: 'CNC Plasma Cutter PC-200',
        fr: 'Coupe-Plasma CNC PC-200',
        ar: 'قاطع بلازما بالتحكم الرقمي PC-200',
      }),
      slug: 'cnc-plasma-cutter-pc-200',
      description: JSON.stringify({
        en: 'The PC-200 CNC plasma cutting machine delivers fast and precise cutting for sheet metal and steel plates. Its high-definition plasma system ensures clean edges and minimal dross. An essential tool for any metal fabrication shop.',
        fr: 'La machine de découpe plasma CNC PC-200 offre une découpe rapide et précise pour les tôles et les plaques d\'acier. Son système plasma haute définition garantit des bords nets et un minimum de scories. Un outil essentiel pour tout atelier de fabrication métallique.',
        ar: 'يوفر جهاز قاطع البلازما بالتحكم الرقمي PC-200 قطعاً سريعاً ودقيقاً للصفائح المعدنية وألواح الصلب. يضمن نظام البلازما عالي الدقة حوافاً نظيفة بأقل قدر من الخبث. أداة أساسية لأي ورشة تصنيع معادن.',
      }),
      shortDesc: JSON.stringify({
        en: 'Fast precision CNC plasma cutting system for sheet metal and steel plates.',
        fr: 'Système de découpe plasma CNC rapide et précis pour tôles et plaques d\'acier.',
        ar: 'نظام قاطع بلازما بالتحكم الرقمي سريع ودقيق للصفائح المعدنية وألواح الصلب.',
      }),
      categoryId: categories['cnc-machines'],
      machineType: 'CNC',
      capacity: '2000mm x 4000mm',
      specs: JSON.stringify({
        en: [
          { key: 'Cutting Thickness', value: '3-40 mm' },
          { key: 'Working Area', value: '2000 x 4000 mm' },
          { key: 'Power', value: '200 A' },
          { key: 'Weight', value: '1,800 kg' },
          { key: 'Cutting Speed', value: 'Up to 6,000 mm/min' },
        ],
        fr: [
          { key: 'Épaisseur de Coupe', value: '3-40 mm' },
          { key: 'Zone de Travail', value: '2 000 x 4 000 mm' },
          { key: 'Puissance', value: '200 A' },
          { key: 'Poids', value: '1 800 kg' },
          { key: 'Vitesse de Coupe', value: 'Jusqu\'à 6 000 mm/min' },
        ],
        ar: [
          { key: 'سماكة القص', value: '3-40 مم' },
          { key: 'مساحة العمل', value: '2000 × 4000 مم' },
          { key: 'الطاقة', value: '200 A' },
          { key: 'الوزن', value: '1,800 كجم' },
          { key: 'سرعة القص', value: 'حتى 6,000 مم/د' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 8500000,
      status: 'published',
      featured: true,
      order: 3,
    },

    // --- Press Machines ---
    {
      name: JSON.stringify({
        en: 'Hydraulic Press 200T',
        fr: 'Presse Hydraulique 200T',
        ar: 'مكبس هيدروليكي 200 طن',
      }),
      slug: 'hydraulic-press-200t',
      description: JSON.stringify({
        en: 'The 200-ton hydraulic press is built for heavy-duty metal forming, deep drawing, and stamping applications. Its robust frame and advanced hydraulic system provide consistent pressure throughout the stroke. Suitable for automotive parts, appliance manufacturing, and general metal forming.',
        fr: 'La presse hydraulique de 200 tonnes est conçue pour le formage de métaux lourds, l\'emboutissage profond et les applications d\'estampage. Son cadre robuste et son système hydraulique avancé assurent une pression constante pendant toute la course. Adaptée aux pièces automobiles, à la fabrication d\'appareils et au formage de métaux général.',
        ar: 'المكبس الهيدروليكي سعة 200 طن مصمم لتشكيل المعادن الثقيلة والسحب العميق وتطبيقات الختم. هيكله المتين ونظامه الهيدروليكي المتقدم يوفر ضغطاً متسقاً طوال الشوط. مناسب لقطع السيارات وتصنيع الأجهزة وتشكيل المعادن العام.',
      }),
      shortDesc: JSON.stringify({
        en: 'Heavy-duty 200-ton hydraulic press for metal forming and deep drawing.',
        fr: 'Presse hydraulique lourde de 200 tonnes pour le formage et l\'emboutissage.',
        ar: 'مكبس هيدروليكي ثقيل سعة 200 طن لتشكيل المعادن والسحب العميق.',
      }),
      categoryId: categories['press-machines'],
      machineType: 'Press',
      capacity: '200 tons',
      specs: JSON.stringify({
        en: [
          { key: 'Capacity', value: '200 Tons' },
          { key: 'Working Area', value: '1200 x 1200 mm' },
          { key: 'Stroke', value: '500 mm' },
          { key: 'Weight', value: '12,000 kg' },
          { key: 'Motor Power', value: '22 kW' },
        ],
        fr: [
          { key: 'Capacité', value: '200 Tonnes' },
          { key: 'Surface de Travail', value: '1 200 x 1 200 mm' },
          { key: 'Course', value: '500 mm' },
          { key: 'Poids', value: '12 000 kg' },
          { key: 'Puissance Moteur', value: '22 kW' },
        ],
        ar: [
          { key: 'السعة', value: '200 طن' },
          { key: 'مساحة العمل', value: '1200 × 1200 مم' },
          { key: 'الشوط', value: '500 مم' },
          { key: 'الوزن', value: '12,000 كجم' },
          { key: 'قدرة المحرك', value: '22 kW' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
      ]),
      basePrice: 22000000,
      status: 'published',
      featured: true,
      order: 4,
    },
    {
      name: JSON.stringify({
        en: 'Mechanical Press 100T',
        fr: 'Presse Mécanique 100T',
        ar: 'مكبس ميكانيكي 100 طن',
      }),
      slug: 'mechanical-press-100t',
      description: JSON.stringify({
        en: 'The 100-ton mechanical press offers high-speed precision stamping for mass production environments. Its crank mechanism delivers powerful and repeatable strokes at high cycle rates. Ideal for blanking, coining, and progressive die operations.',
        fr: 'La presse mécanique de 100 tonnes offre un estampage de précision à grande vitesse pour les environnements de production de masse. Son mécanisme à manivelle délivre des coups puissants et reproductibles à des cadences élevées. Idéale pour le détourage, la frappe et les opérations à matrice progressive.',
        ar: 'يوفر المكبس الميكانيكي سعة 100 طن ختماً عالي السرعة والدقة لبيئات الإنتاج الضخم. آلية المرفق الخاصة به توفر ضربات قوية ومتكررة بمعدلات دورة عالية. مثالي للقطع والضرب وعمليات القوالب التدريجية.',
      }),
      shortDesc: JSON.stringify({
        en: 'High-speed mechanical press for precision stamping and mass production.',
        fr: 'Presse mécanique rapide pour l\'estampage de précision et la production de masse.',
        ar: 'مكبس ميكانيكي عالي السرعة للختم الدقيق والإنتاج الضخم.',
      }),
      categoryId: categories['press-machines'],
      machineType: 'Press',
      capacity: '100 tons',
      specs: JSON.stringify({
        en: [
          { key: 'Capacity', value: '100 Tons' },
          { key: 'Strokes Per Minute', value: '30-60 SPM' },
          { key: 'Bed Size', value: '900 x 600 mm' },
          { key: 'Weight', value: '8,500 kg' },
          { key: 'Motor Power', value: '15 kW' },
        ],
        fr: [
          { key: 'Capacité', value: '100 Tonnes' },
          { key: 'Coups par Minute', value: '30-60 CPM' },
          { key: 'Taille du Bâti', value: '900 x 600 mm' },
          { key: 'Poids', value: '8 500 kg' },
          { key: 'Puissance Moteur', value: '15 kW' },
        ],
        ar: [
          { key: 'السعة', value: '100 طن' },
          { key: 'الضربات في الدقيقة', value: '30-60' },
          { key: 'حجم القاعدة', value: '900 × 600 مم' },
          { key: 'الوزن', value: '8,500 كجم' },
          { key: 'قدرة المحرك', value: '15 kW' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
      ]),
      basePrice: 15000000,
      status: 'published',
      featured: false,
      order: 5,
    },
    {
      name: JSON.stringify({
        en: 'CNC Press Brake PB-4000',
        fr: 'Plihydraulique CNC PB-4000',
        ar: 'ماكينة ثني هيدروليكية بالتحكم الرقمي PB-4000',
      }),
      slug: 'cnc-press-brake-pb-4000',
      description: JSON.stringify({
        en: 'The PB-4000 CNC press brake provides precise bending for sheet metal up to 4 meters in length. Its CNC-controlled back gauge and crowning system ensure consistent bend angles across the entire workpiece. A must-have for any sheet metal fabrication facility.',
        fr: 'Le plioir hydraulique CNC PB-4000 assure un pliage précis pour les tôles jusqu\'à 4 mètres de longueur. Sa butée arrière contrôlée par CNC et son système de correction garantissent des angles de pliage constants sur toute la pièce. Un incontournable pour tout atelier de fabrication de tôles.',
        ar: 'يوفر جهاز الثني الهيدروليكي بالتحكم الرقمي PB-4000 ثنياً دقيقاً للصفائح المعدنية بطول يصل إلى 4 أمتار. نظام المسند الخلفي المُتحكم به بالتحكم الرقمي ونظام التاج يضمن زوايا ثني متسقة عبر القطعة بأكملها. ضروري لأي ورشة تصنيع صفائح معدنية.',
      }),
      shortDesc: JSON.stringify({
        en: 'Precision CNC press brake for sheet metal bending up to 4 meters.',
        fr: 'Plihydraulique CNC de précision pour le pliage de tôles jusqu\'à 4 mètres.',
        ar: 'ماكينة ثني بالتحكم الرقمي دقيقة للصفائح المعدنية بطول يصل إلى 4 أمتار.',
      }),
      categoryId: categories['press-machines'],
      machineType: 'Press',
      capacity: '4000mm x 3mm',
      specs: JSON.stringify({
        en: [
          { key: 'Bending Length', value: '4,000 mm' },
          { key: 'Max Bending Force', value: '160 Tons' },
          { key: 'Control', value: 'CNC DELEM DA-58T' },
          { key: 'Weight', value: '7,500 kg' },
          { key: 'Motor Power', value: '11 kW' },
        ],
        fr: [
          { key: 'Longueur de Pliage', value: '4 000 mm' },
          { key: 'Force de Pliage Max', value: '160 Tonnes' },
          { key: 'Commande', value: 'CNC DELEM DA-58T' },
          { key: 'Poids', value: '7 500 kg' },
          { key: 'Puissance Moteur', value: '11 kW' },
        ],
        ar: [
          { key: 'طول الثني', value: '4,000 مم' },
          { key: 'أقصى قوة ثني', value: '160 طن' },
          { key: 'التحكم', value: 'CNC DELEM DA-58T' },
          { key: 'الوزن', value: '7,500 كجم' },
          { key: 'قدرة المحرك', value: '11 kW' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=10',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=10',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 16500000,
      status: 'published',
      featured: false,
      order: 6,
    },

    // --- Lathes & Turning ---
    {
      name: JSON.stringify({
        en: 'Conventional Lathe CQ-6230',
        fr: 'Tour Conventionnel CQ-6230',
        ar: 'خراطة تقليدية CQ-6230',
      }),
      slug: 'conventional-lathe-cq-6230',
      description: JSON.stringify({
        en: 'The CQ-6230 conventional lathe is a reliable workhorse for general-purpose turning operations. With a generous swing and bed length, it handles a wide range of workpieces. Its simple and robust design ensures years of dependable service in any workshop.',
        fr: 'Le tour conventionnel CQ-6230 est une machine fiable pour les opérations de tournage générales. Avec un swing généreux et une longueur de banc importante, il traite une grande variété de pièces. Sa conception simple et robuste garantit des années de service fiable dans tout atelier.',
        ar: 'الخراطة التقليدية CQ-6230 هي آلة موثوقة لعمليات التشكيل العامة. مع قطر تشغيل سخي وطول سرير كبير، فإنها تتعامل مع مجموعة واسعة من القطع. تصميمها البسيط والمتين يضمن سنوات من الخدمة الموثوقة في أي ورشة.',
      }),
      shortDesc: JSON.stringify({
        en: 'Reliable conventional lathe for general-purpose turning operations.',
        fr: 'Tour conventionnel fiable pour les opérations de tournage générales.',
        ar: 'خراطة تقليدية موثوقة لعمليات التشكيل العامة.',
      }),
      categoryId: categories['lathes-turning'],
      machineType: 'Lathe',
      capacity: '630mm swing x 3000mm',
      specs: JSON.stringify({
        en: [
          { key: 'Swing Over Bed', value: '630 mm' },
          { key: 'Distance Between Centers', value: '3,000 mm' },
          { key: 'Spindle Bore', value: '105 mm' },
          { key: 'Weight', value: '3,800 kg' },
          { key: 'Motor Power', value: '7.5 kW' },
        ],
        fr: [
          { key: 'Swing Sur Banc', value: '630 mm' },
          { key: 'Distance Entre Pointes', value: '3 000 mm' },
          { key: 'Alésage de Broche', value: '105 mm' },
          { key: 'Poids', value: '3 800 kg' },
          { key: 'Puissance Moteur', value: '7,5 kW' },
        ],
        ar: [
          { key: 'قطر التشغيل فوق السرير', value: '630 مم' },
          { key: 'المسافة بين المراكز', value: '3,000 مم' },
          { key: 'قطر العمود', value: '105 مم' },
          { key: 'الوزن', value: '3,800 كجم' },
          { key: 'قدرة المحرك', value: '7.5 kW' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop&s=20',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop&s=20',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 4500000,
      status: 'published',
      featured: false,
      order: 7,
    },
    {
      name: JSON.stringify({
        en: 'CNC Turret Lathe TL-800',
        fr: 'Tour Tourelle CNC TL-800',
        ar: 'خراطة برجية بالتحكم الرقمي TL-800',
      }),
      slug: 'cnc-turret-lathe-tl-800',
      description: JSON.stringify({
        en: 'The TL-800 CNC turret lathe combines high-speed turning with multi-tool capability for efficient batch production. Its 12-station turret allows quick tool changes, reducing setup time significantly. Designed for precision bar work and chucking applications.',
        fr: 'Le tour tourelle CNC TL-800 combine le tournage à grande vitesse avec une capacité multi-outils pour une production en lot efficace. Sa tourelle à 12 postes permet des changements d\'outils rapides, réduisant considérablement le temps de réglage. Conçu pour le travail de barres de précision et les applications de mandrin.',
        ar: 'تجمع الخراطة البرجية بالتحكم الرقمي TL-800 بين التشكيل عالي السرعة وقدرة الأدوات المتعددة للإنتاج الدفعي الفعال. برجها ذو 12 محطة يسمح بتغيير الأدوات بسرعة، مما يقلل وقت الإعداد بشكل كبير. مصممة لعمل القضبان الدقيق وتطبيقات المشبك.',
      }),
      shortDesc: JSON.stringify({
        en: 'High-speed CNC turret lathe with 12-station tool turret for batch production.',
        fr: 'Tour tourelle CNC rapide avec tourelle à 12 postes pour la production en série.',
        ar: 'خراطة برجية بالتحكم الرقمي عالية السرعة مع برج أدوات 12 محطة للإنتاج الدفعي.',
      }),
      categoryId: categories['lathes-turning'],
      machineType: 'CNC',
      capacity: '800mm swing',
      specs: JSON.stringify({
        en: [
          { key: 'Swing Over Bed', value: '800 mm' },
          { key: 'Max Turning Length', value: '1,000 mm' },
          { key: 'Turret Stations', value: '12' },
          { key: 'Spindle Speed', value: '50-3,500 RPM' },
          { key: 'Weight', value: '5,500 kg' },
        ],
        fr: [
          { key: 'Swing Sur Banc', value: '800 mm' },
          { key: 'Longueur de Tournage Max', value: '1 000 mm' },
          { key: 'Postes de Tourelle', value: '12' },
          { key: 'Vitesse de Broche', value: '50-3 500 tr/min' },
          { key: 'Poids', value: '5 500 kg' },
        ],
        ar: [
          { key: 'قطر التشغيل فوق السرير', value: '800 مم' },
          { key: 'أقصى طول تشكيل', value: '1,000 مم' },
          { key: 'محطات البرج', value: '12' },
          { key: 'سرعة العمود', value: '50-3,500 لفة/د' },
          { key: 'الوزن', value: '5,500 كجم' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 18000000,
      status: 'published',
      featured: true,
      order: 8,
    },

    // --- Welding Equipment ---
    {
      name: JSON.stringify({
        en: 'MIG/MAG Welder WM-350',
        fr: 'Poste à Souder MIG/MAG WM-350',
        ar: 'ماكينة لحام MIG/MAG WM-350',
      }),
      slug: 'mig-mag-welder-wm-350',
      description: JSON.stringify({
        en: 'The WM-350 is a versatile MIG/MAG welding machine suitable for both thin sheet metal and heavy steel fabrication. It features advanced inverter technology for stable arc performance and low energy consumption. Perfect for automotive, construction, and general fabrication work.',
        fr: 'Le WM-350 est un poste à souder MIG/MAG polyvalent adapté aussi bien aux tôles fines qu\'à la fabrication de structures lourdes. Il dispose d\'une technologie à onduleur avancée pour des performances d\'arc stables et une faible consommation d\'énergie. Parfait pour l\'automobile, la construction et la fabrication générale.',
        ar: 'جهاز WM-350 هو ماكينة لحام MIG/MAG متعددة الاستخدامات مناسبة لكل من الصفائح المعدنية الرقيقة وتصنيع الصلب الثقيل. يتميز بتقنية العاكس المتقدمة لأداء قوس مستقر واستهلاك طاقة منخفض. مثالي للسيارات والبناء وأعمال التصنيع العامة.',
      }),
      shortDesc: JSON.stringify({
        en: 'Versatile MIG/MAG inverter welder for thin sheet to heavy steel fabrication.',
        fr: 'Poste à souder MIG/MAG onduleur polyvalent pour tôles fines à acier lourd.',
        ar: 'ماكينة لحام MIG/MAG عاكس متعددة الاستخدامات للصفائح الرقيقة إلى تصنيع الصلب الثقيل.',
      }),
      categoryId: categories['welding-equipment'],
      machineType: 'Welder',
      capacity: '350A',
      specs: JSON.stringify({
        en: [
          { key: 'Amperage Range', value: '50-350 A' },
          { key: 'Duty Cycle', value: '60% at 300A' },
          { key: 'Wire Diameter', value: '0.8-2.0 mm' },
          { key: 'Weight', value: '85 kg' },
          { key: 'Input Power', value: '380V 3-Phase' },
        ],
        fr: [
          { key: 'Plage d\'Ampérage', value: '50-350 A' },
          { key: 'Facteur de Marche', value: '60% à 300A' },
          { key: 'Diamètre de Fil', value: '0,8-2,0 mm' },
          { key: 'Poids', value: '85 kg' },
          { key: 'Alimentation', value: '380V Triphasé' },
        ],
        ar: [
          { key: 'نطاق الأمبير', value: '50-350 A' },
          { key: 'دورة العمل', value: '60% عند 300A' },
          { key: 'قطر السلك', value: '0.8-2.0 مم' },
          { key: 'الوزن', value: '85 كجم' },
          { key: 'طاقة الإدخال', value: '380V ثلاثي الأطوار' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&s=30',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&s=30',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 2500000,
      status: 'published',
      featured: false,
      order: 9,
    },
    {
      name: JSON.stringify({
        en: 'TIG Welder WT-200',
        fr: 'Poste à Souder TIG WT-200',
        ar: 'ماكينة لحام TIG WT-200',
      }),
      slug: 'tig-welder-wt-200',
      description: JSON.stringify({
        en: 'The WT-200 TIG welder delivers precision welding for stainless steel, aluminum, and other non-ferrous metals. Its pulse function and HF start ensure clean, high-quality welds every time. The ideal choice for applications requiring superior weld appearance and integrity.',
        fr: 'Le poste à souder TIG WT-200 assure un soudage de précision pour l\'acier inoxydable, l\'aluminium et d\'autres métaux non ferreux. Sa fonction impulsionnelle et son démarrage HF garantissent des soudures propres et de haute qualité à chaque fois. Le choix idéal pour les applications exigeant une apparence et une intégrité de soudure supérieures.',
        ar: 'يوفر جهاز لحام TIG WT-200 لحاماً دقيقاً للصلب المقاوم للصدأ والألمنيوم والمعادن غير الحديدية الأخرى. وظيفة النبض والبدء HF تضمن لحامات نظيفة وعالية الجودة في كل مرة. الخيار المثالي للتطبيقات التي تتطلب مظهر لحام ومتانة فائقة.',
      }),
      shortDesc: JSON.stringify({
        en: 'Precision TIG welder with pulse function for stainless steel and aluminum.',
        fr: 'Poste à souder TIG de précision avec fonction impulsion pour inox et aluminium.',
        ar: 'ماكينة لحام TIG دقيقة مع وظيفة النبض للصلب المقاوم والألمنيوم.',
      }),
      categoryId: categories['welding-equipment'],
      machineType: 'Welder',
      capacity: '200A',
      specs: JSON.stringify({
        en: [
          { key: 'Amperage Range', value: '10-200 A' },
          { key: 'Duty Cycle', value: '60% at 200A' },
          { key: 'HF Start', value: 'Yes' },
          { key: 'Weight', value: '45 kg' },
          { key: 'Input Power', value: '220V Single-Phase' },
        ],
        fr: [
          { key: 'Plage d\'Ampérage', value: '10-200 A' },
          { key: 'Facteur de Marche', value: '60% à 200A' },
          { key: 'Démarrage HF', value: 'Oui' },
          { key: 'Poids', value: '45 kg' },
          { key: 'Alimentation', value: '220V Monophasé' },
        ],
        ar: [
          { key: 'نطاق الأمبير', value: '10-200 A' },
          { key: 'دورة العمل', value: '60% عند 200A' },
          { key: 'بدء HF', value: 'نعم' },
          { key: 'الوزن', value: '45 كجم' },
          { key: 'طاقة الإدخال', value: '220V أحادي الطور' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=30',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=30',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
      ]),
      basePrice: 1800000,
      status: 'published',
      featured: false,
      order: 10,
    },

    // --- Cutting & Shearing ---
    {
      name: JSON.stringify({
        en: 'Hydraulic Shear HS-3000',
        fr: 'Cisaille Hydraulique HS-3000',
        ar: 'ماكينة قص هيدروليكية HS-3000',
      }),
      slug: 'hydraulic-shear-hs-3000',
      description: JSON.stringify({
        en: 'The HS-3000 hydraulic shear provides clean, burr-free cutting of sheet metal up to 3mm thickness and 3 meters in length. Its CNC back gauge and adjustable blade clearance ensure precise cuts every time. Essential for any sheet metal processing workshop.',
        fr: 'La cisaille hydraulique HS-3000 assure une coupe propre et sans bavures de tôles jusqu\'à 3 mm d\'épaisseur et 3 mètres de longueur. Sa butée arrière CNC et le jeu de lames réglable garantissent des coupes précises à chaque fois. Essentielle pour tout atelier de traitement de tôles.',
        ar: 'توفر ماكينة القص الهيدروليكية HS-3000 قصاً نظيفاً وخالياً من الحواف للصفائح المعدنية بسماكة تصل إلى 3 مم وطول 3 أمتار. المسند الخلفي المُتحكم به بالتحكم الرقمي وتخليص الشفرات القابل للتعديل يضمن قطعاً دقيقة في كل مرة. أساسية لأي ورشة معالجة صفائح معدنية.',
      }),
      shortDesc: JSON.stringify({
        en: 'Hydraulic shear for clean cutting of sheet metal up to 3mm x 3000mm.',
        fr: 'Cisaille hydraulique pour coupe nette de tôles jusqu\'à 3mm x 3000mm.',
        ar: 'ماكينة قص هيدروليكية لقص نظيف للصفائح المعدنية حتى 3 مم × 3000 مم.',
      }),
      categoryId: categories['cutting-shearing'],
      machineType: 'Shear',
      capacity: '3000mm x 3mm',
      specs: JSON.stringify({
        en: [
          { key: 'Cutting Length', value: '3,000 mm' },
          { key: 'Max Thickness', value: '3 mm (mild steel)' },
          { key: 'Shearing Angle', value: '1° 30\'' },
          { key: 'Weight', value: '5,000 kg' },
          { key: 'Motor Power', value: '7.5 kW' },
        ],
        fr: [
          { key: 'Longueur de Coupe', value: '3 000 mm' },
          { key: 'Épaisseur Max', value: '3 mm (acier doux)' },
          { key: 'Angle de Cisaillement', value: '1° 30\'' },
          { key: 'Poids', value: '5 000 kg' },
          { key: 'Puissance Moteur', value: '7,5 kW' },
        ],
        ar: [
          { key: 'طول القص', value: '3,000 مم' },
          { key: 'أقصى سماكة', value: '3 مم (صلب ناعم)' },
          { key: 'زاوية القص', value: '1° 30\'' },
          { key: 'الوزن', value: '5,000 كجم' },
          { key: 'قدرة المحرك', value: '7.5 kW' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&s=40',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&s=40',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
      ]),
      basePrice: 9500000,
      status: 'published',
      featured: false,
      order: 11,
    },
    {
      name: JSON.stringify({
        en: 'Circular Saw CS-500',
        fr: 'Scie Circulaire CS-500',
        ar: 'منشار دائري CS-500',
      }),
      slug: 'circular-saw-cs-500',
      description: JSON.stringify({
        en: 'The CS-500 circular saw is designed for cutting metal profiles, tubes, and solid bars with speed and accuracy. Its carbide-tipped blade and coolant system ensure clean cuts and extended blade life. Suitable for steel structures, fencing, and general metal cutting tasks.',
        fr: 'La scie circulaire CS-500 est conçue pour couper les profilés métalliques, les tubes et les barres pleines avec rapidité et précision. Sa lame à bout en carbure et son système de refroidissement assurent des coupes propres et une durée de vie prolongée de la lame. Adaptée aux structures en acier, aux clôtures et aux tâches de coupe de métaux générales.',
        ar: 'المنشار الدائري CS-500 مصمم لقطع الأشكال المعدنية والأنابيب والقضيب الصلبة بسرعة ودقة. شفرته المبطنة بالكربيد ونظام التبريد يضمن قطعاً نظيفة وعمراً أطول للشفرة. مناسب للهياكل الفولاذية والسياج ومهام قطع المعادن العامة.',
      }),
      shortDesc: JSON.stringify({
        en: 'Circular saw for fast, accurate cutting of metal profiles and tubes.',
        fr: 'Scie circulaire pour coupe rapide et précise de profilés et tubes métalliques.',
        ar: 'منشار دائري لقطع سريع ودقيق للأشكال المعدنية والأنابيب.',
      }),
      categoryId: categories['cutting-shearing'],
      machineType: 'Saw',
      capacity: '500mm blade',
      specs: JSON.stringify({
        en: [
          { key: 'Blade Diameter', value: '500 mm' },
          { key: 'Max Round Capacity', value: '160 mm' },
          { key: 'Motor Power', value: '5.5 kW' },
          { key: 'Weight', value: '1,200 kg' },
          { key: 'Cutting Speed', value: 'Variable' },
        ],
        fr: [
          { key: 'Diamètre de Lame', value: '500 mm' },
          { key: 'Capacité Ronde Max', value: '160 mm' },
          { key: 'Puissance Moteur', value: '5,5 kW' },
          { key: 'Poids', value: '1 200 kg' },
          { key: 'Vitesse de Coupe', value: 'Variable' },
        ],
        ar: [
          { key: 'قطر الشفرة', value: '500 مم' },
          { key: 'أقصى سعة دائرية', value: '160 مم' },
          { key: 'قدرة المحرك', value: '5.5 kW' },
          { key: 'الوزن', value: '1,200 كجم' },
          { key: 'سرعة القص', value: 'متغيرة' },
        ],
      }),
      coverImage: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop&s=10',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop&s=10',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      ]),
      basePrice: 1500000,
      status: 'published',
      featured: true,
      order: 12,
    },
  ];

  const machines: Record<string, string> = {};
  for (const machine of machinesData) {
    const created = await prisma.machine.upsert({
      where: { slug: machine.slug },
      update: {},
      create: machine,
    });
    machines[machine.slug] = created.id;
    console.log(`   ✅ Machine: ${machine.slug}`);
  }
  console.log('');

  // ============================================
  // 4. PRODUCTION LINES (3)
  // ============================================
  console.log('🏭 Creating Production Lines...');

  const productionLinesData = [
    {
      name: JSON.stringify({
        en: 'Complete Bakery Production Line',
        fr: 'Ligne Complète de Production de Boulangerie',
        ar: 'خط إنتاج مخبز متكامل',
      }),
      slug: 'complete-bakery-production-line',
      description: JSON.stringify({
        en: 'A turnkey bakery production line designed for medium to large-scale bread and pastry production. This complete solution includes dough mixing, shaping, proofing, baking, and packaging equipment. Engineered for Algerian bakeries with local technical support and training included.',
        fr: 'Une ligne de production de boulangerie clé en main conçue pour la production de pain et de pâtisserie à moyenne et grande échelle. Cette solution complète comprend un équipement de pétrissage, de façonnage, de fermentation, de cuisson et d\'emballage. Conçue pour les boulangeries algériennes avec support technique local et formation inclus.',
        ar: 'خط إنتاج مخبز متكامل مصمم لإنتاج الخبز والمعجنات بمقياس متوسط إلى كبير. تتضمن هذه الحلول الكاملة معدات العجن والتشكيل والتخمير والخبز والتعبئة. مصممة للمخابز الجزائرية مع دعم فني محلي وتدريب مشمول.',
      }),
      shortDesc: JSON.stringify({
        en: 'Turnkey bakery line with mixing, shaping, proofing, baking and packaging.',
        fr: 'Ligne de boulangerie clé en main avec pétrissage, façonnage, fermentation et cuisson.',
        ar: 'خط مخبز متكامل يشمل العجن والتشكيل والتخمير والخبز والتعبئة.',
      }),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
      featured: true,
      status: 'published',
      order: 1,
      linkedMachines: [
        { slug: 'cnc-press-brake-pb-4000', order: 1 },
      ],
    },
    {
      name: JSON.stringify({
        en: 'Plastic Injection Molding Line',
        fr: 'Ligne de Moulage par Injection Plastique',
        ar: 'خط حقن البلاستيك',
      }),
      slug: 'plastic-injection-molding-line',
      description: JSON.stringify({
        en: 'A comprehensive plastic injection molding production line for manufacturing plastic parts and components. Includes injection molding machines, temperature controllers, mold handling equipment, and granulators. Perfect for producing packaging, containers, automotive parts, and consumer goods.',
        fr: 'Une ligne de production complète de moulage par injection plastique pour la fabrication de pièces et composants en plastique. Comprend des machines d\'injection, des contrôleurs de température, des équipements de manutention de moules et des broyeurs. Parfaite pour la production d\'emballages, de conteneurs, de pièces automobiles et de biens de consommation.',
        ar: 'خط إنتاج متكامل لحقن البلاستيك لتصنيع القطع والمكونات البلاستيكية. يشمل آلات حقن البلاستيك ووحدات التحكم في الحرارة ومعدات التعامل مع القوالب والطواحين. مثالي لإنتاج التغليف والحاويات وقطع السيارات والسلع الاستهلاكية.',
      }),
      shortDesc: JSON.stringify({
        en: 'Complete plastic injection line with molding machines and auxiliary equipment.',
        fr: 'Ligne d\'injection plastique complète avec machines et équipements auxiliaires.',
        ar: 'خط حقن بلاستيك متكامل مع آلات ومعدات مساعدة.',
      }),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      featured: true,
      status: 'published',
      order: 2,
      linkedMachines: [
        { slug: 'cnc-vertical-machining-center-vm-500', order: 1 },
        { slug: 'cnc-lathe-cl-300', order: 2 },
        { slug: 'cnc-plasma-cutter-pc-200', order: 3 },
      ],
    },
    {
      name: JSON.stringify({
        en: 'Steel Fabrication Workshop Line',
        fr: 'Ligne d\'Atelier de Fabrication Métallique',
        ar: 'خط ورشة تصنيع الحديد والصلب',
      }),
      slug: 'steel-fabrication-workshop-line',
      description: JSON.stringify({
        en: 'A complete steel fabrication workshop setup equipped with cutting, welding, bending, and forming machinery. Designed for structural steel work, metal building construction, and general fabrication projects. Includes all essential equipment for a fully operational steel workshop.',
        fr: 'Une installation complète d\'atelier de fabrication métallique équipée de machines de coupe, soudage, pliage et formage. Conçue pour les travaux de charpente métallique, la construction de bâtiments métalliques et les projets de fabrication générale. Inclut tout l\'équipement essentiel pour un atelier d\'acier entièrement opérationnel.',
        ar: 'إعداد ورشة تصنيع حديد وصلب متكامل مجهز بآلات القص واللحام والثني والتشكيل. مصممة لأعمال الهياكل الفولاذية وبناء المنشآت المعدنية ومشاريع التصنيع العامة. تشمل جميع المعدات الأساسية لورشة فولاذية تعمل بالكامل.',
      }),
      shortDesc: JSON.stringify({
        en: 'Full steel workshop setup with cutting, welding, bending and forming machines.',
        fr: 'Atelier d\'acier complet avec machines de coupe, soudage, pliage et formage.',
        ar: 'ورشة فولاذية كاملة مع آلات قص ولحام وثني وتشكيل.',
      }),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
      featured: false,
      status: 'published',
      order: 3,
      linkedMachines: [
        { slug: 'cnc-plasma-cutter-pc-200', order: 1 },
        { slug: 'mig-mag-welder-wm-350', order: 2 },
        { slug: 'tig-welder-wt-200', order: 3 },
      ],
    },
  ];

  for (const pl of productionLinesData) {
    const { linkedMachines, ...plData } = pl;
    const created = await prisma.productionLine.upsert({
      where: { slug: pl.slug },
      update: {},
      create: plData,
    });

    // Link machines to production line
    for (const lm of linkedMachines) {
      const machineId = machines[lm.slug];
      if (machineId) {
        await prisma.machineProductionLine.upsert({
          where: {
            machineId_productionLineId: {
              machineId,
              productionLineId: created.id,
            },
          },
          update: { order: lm.order },
          create: {
            machineId,
            productionLineId: created.id,
            order: lm.order,
          },
        });
      }
    }
    console.log(`   ✅ Production Line: ${pl.slug}`);
  }
  console.log('');

  // ============================================
  // 5. NEWS POSTS (4)
  // ============================================
  console.log('📰 Creating News Posts...');

  const newsPostsData = [
    {
      title: JSON.stringify({
        en: 'New Partnership with TechMach Germany',
        fr: 'Nouveau Partenariat avec TechMach Allemagne',
        ar: 'شراكة جديدة مع TechMach ألمانيا',
      }),
      slug: 'new-partnership-techmach-germany',
      content: JSON.stringify({
        en: 'We are thrilled to announce a new strategic partnership with TechMach Germany, one of Europe\'s leading manufacturers of precision CNC machinery. This partnership will allow LA SOURCE MACHIEN to offer an extended range of high-quality German-engineered machines to the Algerian market.\n\nThe collaboration includes technology transfer, training programs for Algerian technicians, and joint development of machines specifically adapted to North African industrial needs. Our first shipment of TechMach CNC machining centers and lathes is expected to arrive in Q2 2025.\n\nThis partnership reinforces our commitment to bringing world-class industrial solutions to Algeria, supporting local manufacturing and helping Algerian industries compete globally.',
        fr: 'Nous sommes ravis d\'annoncer un nouveau partenariat stratégique avec TechMach Allemagne, l\'un des principaux fabricants européens de machines CNC de précision. Ce partenariat permettra à LA SOURCE MACHIEN d\'offrir une gamme étendue de machines de haute qualité de conception allemande au marché algérien.\n\nLa collaboration inclut le transfert de technologie, des programmes de formation pour les techniciens algériens, et le développement conjoint de machines spécialement adaptées aux besoins industriels nord-africains. Notre première livraison de centres d\'usinage et de tours CNC TechMach est prévue pour le T2 2025.\n\nCe partenariat renforce notre engagement à apporter des solutions industrielles de classe mondiale à l\'Algérie, soutenant la fabrication locale et aidant les industries algériennes à concurrencer à l\'échelle mondiale.',
        ar: 'يسعدنا أن نعلن عن شراكة استراتيجية جديدة مع TechMach ألمانيا، واحدة من الشركات الرائدة في أوروبا في تصنيع آلات التحكم الرقمي الدقيقة. ستسمح هذه الشراكة لـ LA SOURCE MACHIEN بتقديم مجموعة واسعة من الآلات عالية الجودة من التصميم الألماني للسوق الجزائرية.\n\nتشمل التعاون نقل التكنولوجيا وبرامج تدريب للفنيين الجزائريين وتطوير مشترك لآلات مخصصة خصيصاً للاحتياجات الصناعية في شمال أفريقيا. من المتوقع أن تصل شحنتنا الأولى من مراكز التصنيع والخراطات الرقمية TechMach في الربع الثاني من 2025.\n\nتعزز هذه الشراكة التزامنا بجلب حلول صناعية عالمية المستوى إلى الجزائر، ودعم التصنيع المحلي ومساعدة الصناعات الجزائرية على المنافسة عالمياً.',
      }),
      excerpt: JSON.stringify({
        en: 'LA SOURCE MACHIEN partners with TechMach Germany to bring world-class CNC machinery to Algeria.',
        fr: 'LA SOURCE MACHIEN s\'associe à TechMach Allemagne pour offrir des machines CNC de classe mondiale en Algérie.',
        ar: 'تشراك LA SOURCE MACHIEN مع TechMach ألمانيا لتقديم آلات تحكم رقمي عالمية المستوى للجزائر.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&s=50',
      status: 'published',
      publishedAt: new Date('2025-01-15'),
      author: 'Admin',
      order: 1,
    },
    {
      title: JSON.stringify({
        en: 'LA SOURCE MACHIEN at Algiers Industry Exhibition 2025',
        fr: 'LA SOURCE MACHIEN au Salon de l\'Industrie d\'Alger 2025',
        ar: 'LA SOURCE MACHIEN في معرض الجزائر الصناعي 2025',
      }),
      slug: 'algiers-industry-exhibition-2025',
      content: JSON.stringify({
        en: 'LA SOURCE MACHIEN is proud to participate in the Algiers Industry Exhibition 2025, the largest industrial trade show in North Africa. Visit us at Hall B, Stand 214 to explore our latest machinery lineup, including new CNC models and production line solutions.\n\nOur team of technical experts will be on hand to demonstrate machine capabilities, discuss custom solutions for your manufacturing needs, and provide detailed quotations. We will also showcase our comprehensive after-sales service including installation, training, and maintenance programs.\n\nDon\'t miss our live machining demonstrations scheduled daily at 10:00 AM and 2:00 PM. Register at our stand for exclusive exhibition discounts and early-bird pricing on selected models.',
        fr: 'LA SOURCE MACHIEN est fier de participer au Salon de l\'Industrie d\'Alger 2025, le plus grand salon professionnel industriel d\'Afrique du Nord. Visitez-nous au Hall B, Stand 214 pour découvrir notre dernière gamme de machines, y compris les nouveaux modèles CNC et les solutions de ligne de production.\n\nNotre équipe d\'experts techniques sera présente pour démontrer les capacités des machines, discuter de solutions sur mesure pour vos besoins de fabrication et fournir des devis détaillés. Nous présenterons également notre service après-vente complet comprenant l\'installation, la formation et les programmes de maintenance.\n\nNe manquez pas nos démonstrations d\'usinage en direct programmées quotidiennement à 10h00 et 14h00. Inscrivez-vous à notre stand pour des réductions exclusives du salon et des tarifs anticipés sur les modèles sélectionnés.',
        ar: 'تفخر LA SOURCE MACHIEN بالمشاركة في معرض الجزائر الصناعي 2025، أكبر معرض صناعي تجاري في شمال أفريقيا. تزورونا في القاعة B، الجناح 214 لاكتشاف أحدث تشكيلات آلاتنا، بما في ذلك نماذج التحكم الرقمي الجديدة وحلول خطوط الإنتاج.\n\nسيكون فريقنا من الخبراء التقنيين حاضرين لعرض قدرات الآلات ومناقشة الحلول المخصصة لاحتياجات التصنيع الخاصة بكم وتقديم عروض أسعار مفصلة. سنعرض أيضاً خدمة ما بعد البيع الشاملة لدينا بما في ذلك التركيب والتدريب وبرامج الصيانة.\n\nلا تفوت عروض التصنيع المباشرة المجدولة يومياً في الساعة 10:00 صباحاً و2:00 مساءً. سجل في جناحنا للحصول على خصومات حصرية للمعرض وأسعار مبكرة على النماذج المختارة.',
      }),
      excerpt: JSON.stringify({
        en: 'Visit us at Hall B, Stand 214 at the Algiers Industry Exhibition 2025.',
        fr: 'Visitez-nous au Hall B, Stand 214 au Salon de l\'Industrie d\'Alger 2025.',
        ar: 'زورونا في القاعة B، الجناح 214 في معرض الجزائر الصناعي 2025.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop&s=50',
      status: 'published',
      publishedAt: new Date('2025-02-20'),
      author: 'Admin',
      order: 2,
    },
    {
      title: JSON.stringify({
        en: 'New CNC Machine Models Now Available',
        fr: 'Nouveaux Modèles de Machines CNC Maintenant Disponibles',
        ar: 'نماذج آلات تحكم رقمي جديدة متاحة الآن',
      }),
      slug: 'new-cnc-machine-models-now-available',
      content: JSON.stringify({
        en: 'We are excited to announce the arrival of our new CNC machine models for 2025. The VM-500 Vertical Machining Center and the CL-300 CNC Lathe are now in stock and ready for immediate delivery. These machines feature the latest FANUC control systems and are backed by full warranty and technical support.\n\nThe VM-500 offers improved spindle performance with speeds up to 12,000 RPM, while the CL-300 comes with an 8-station turret for increased flexibility. Both machines are designed for the demanding conditions of Algerian manufacturing environments.\n\nContact our sales team today for a personalized demonstration and competitive pricing. Trade-in options are available for your existing equipment.',
        fr: 'Nous sommes ravis d\'annoncer l\'arrivée de nos nouveaux modèles de machines CNC pour 2025. Le centre d\'usinage vertical VM-500 et le tour CNC CL-300 sont maintenant en stock et prêts pour une livraison immédiate. Ces machines sont équipées des derniers systèmes de commande FANUC et sont couverts par une garantie complète et un support technique.\n\nLe VM-500 offre des performances de broche améliorées avec des vitesses allant jusqu\'à 12 000 tr/min, tandis que le CL-300 est équipé d\'une tourelle à 8 postes pour une flexibilité accrue. Les deux machines sont conçues pour les conditions exigeantes des environnements de fabrication algériens.\n\nContactez notre équipe commerciale dès aujourd\'hui pour une démonstration personnalisée et des tarifs compétitifs. Des options de reprise sont disponibles pour votre équipement existant.',
        ar: 'يسعدنا أن نعلن عن وصول نماذج آلات التحكم الرقمي الجديدة لعام 2025. مركز التصنيع العمودي VM-500 وخراطة التحكم الرقمي CL-300 متوفرة الآن في المخزون وجاهزة للتسليم الفوري. هذه الآلات مجهزة بأحدث أنظمة التحكم FANUC ومدعومة بضمان كامل ودعم فني.\n\nيقدم VM-500 أداء محسّن للعمود الدوار بسرعات تصل إلى 12,000 لفة/د، بينما يأتي CL-300 مع برج ذو 8 محطات لمرونة متزايدة. كلا الآلتين مصممتان للظروف المتطلبة لبيئات التصنيع الجزائرية.\n\nتواصل مع فريق المبيعات لدينا اليوم للحصول على عرض توضيحي مخصص وأسعار تنافسية. خيارات استبدال متاحة لمعداتك الحالية.',
      }),
      excerpt: JSON.stringify({
        en: 'New VM-500 and CL-300 CNC models now in stock with FANUC controls.',
        fr: 'Nouveaux modèles CNC VM-500 et CL-300 en stock avec commandes FANUC.',
        ar: 'نماذج VM-500 و CL-300 الجديدة متوفرة الآن مع تحكم FANUC.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&s=50',
      status: 'published',
      publishedAt: new Date('2025-03-10'),
      author: 'Admin',
      order: 3,
    },
    {
      title: JSON.stringify({
        en: 'Expanding Our Service Network Across Algeria',
        fr: 'Extension de Notre Réseau de Services à Travers l\'Algérie',
        ar: 'توسيع شبكة خدماتنا في جميع أنحاء الجزائر',
      }),
      slug: 'expanding-service-network-across-algeria',
      content: JSON.stringify({
        en: 'In our ongoing commitment to provide excellent after-sales support, LA SOURCE MACHIEN is expanding its service network across Algeria. We are opening new service centers in Oran, Constantine, Annaba, and Setif to ensure faster response times and on-site technical support for our customers.\n\nEach new service center will be staffed with certified technicians equipped with genuine spare parts and diagnostic tools. We are also launching a 24/7 technical hotline for emergency support, ensuring minimal downtime for your production operations.\n\nThis expansion is part of our broader strategy to support Algerian industrialization and provide world-class service to every corner of the country. Stay tuned for more announcements as we continue to grow our presence nationwide.',
        fr: 'Dans notre engagement continu à fournir un excellent support après-vente, LA SOURCE MACHIEN étend son réseau de services à travers l\'Algérie. Nous ouvrons de nouveaux centres de service à Oran, Constantine, Annaba et Sétif pour garantir des temps de réponse plus rapides et un support technique sur site pour nos clients.\n\nChaque nouveau centre de service sera doté de techniciens certifiés équipés de pièces de rechange d\'origine et d\'outils de diagnostic. Nous lançons également une ligne d\'assistance technique 24h/24 pour le support d\'urgence, garantissant un temps d\'arrêt minimal pour vos opérations de production.\n\nCette extension fait partie de notre stratégie plus large pour soutenir l\'industrialisation algérienne et fournir un service de classe mondiale dans chaque coin du pays. Restez à l\'écoute pour plus d\'annonces alors que nous continuons à développer notre présence à l\'échelle nationale.',
        ar: 'في إطار التزامنا المستمر بتقديم دعم ممتاز ما بعد البيع، توسع LA SOURCE MACHIEN شبكة خدماتها في جميع أنحاء الجزائر. نحن نفتتح مراكز خدمة جديدة في وهران وقسنطينة وعنابة و سطيف لضمان أوقات استجابة أسرع ودعم فني ميداني لعملائنا.\n\nسيكون كل مركز خدمة جديد مزوداً بفنيين معتمدين مجهزين بقطع غيار أصلية وأدوات تشخيصية. نحن نطلق أيضاً خطاً ساخناً فنياً يعمل على مدار الساعة للدعم الطارئ، مما يضمن توقفاً minimal لعمليات الإنتاج الخاصة بكم.\n\nهذا التوسع جزء من استراتيجيتنا الأوسع لدعم التصنيع الجزائري وتقديم خدمة عالمية المستوى في كل ركن من أركان البلاد. ترقبوا المزيد من الإعلانات بينما نواصل توسيع حضورنا على مستوى الوطن.',
      }),
      excerpt: JSON.stringify({
        en: 'New service centers opening in Oran, Constantine, Annaba and Setif.',
        fr: 'Ouverture de nouveaux centres de service à Oran, Constantine, Annaba et Sétif.',
        ar: 'افتتاح مراكز خدمة جديدة في وهران وقسنطينة وعنابة وسطيف.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&s=50',
      status: 'published',
      publishedAt: new Date('2025-04-05'),
      author: 'Admin',
      order: 4,
    },
  ];

  for (const news of newsPostsData) {
    await prisma.newsPost.upsert({
      where: { slug: news.slug },
      update: {},
      create: news,
    });
    console.log(`   ✅ News Post: ${news.slug}`);
  }
  console.log('');

  // ============================================
  // 6. PROJECTS (4)
  // ============================================
  console.log('🏗️ Creating Projects...');

  const projectsData = [
    {
      title: JSON.stringify({
        en: 'Industrial Bakery - Algiers',
        fr: 'Boulangerie Industrielle - Alger',
        ar: 'مخبز صناعي - الجزائر العاصمة',
      }),
      slug: 'industrial-bakery-algiers',
      description: JSON.stringify({
        en: 'Complete industrial bakery setup for Boulangerie El Baraka in Algiers, including automated dough mixing, shaping, and baking production lines with custom metal fabrication for all enclosures and supports.',
        fr: 'Installation complète de boulangerie industrielle pour Boulangerie El Baraka à Alger, comprenant des lignes de production automatisées de pétrissage, façonnage et cuisson avec fabrication métallique sur mesure pour tous les enclos et supports.',
        ar: 'إعداد مخبز صناعي متكامل لـ Boulangerie El Baraka في الجزائر العاصمة، يشمل خطوط إنتاج آلية للعجن والتشكيل والخبز مع تصنيع معادن مخصص لجميع الأغطية والدعامات.',
      }),
      content: JSON.stringify({
        en: 'LA SOURCE MACHIEN supplied and installed a complete industrial bakery production line for Boulangerie El Baraka in the Bir Mourad Raïs district of Algiers. The project included a 500kg/hr dough mixing system, automated dividing and shaping equipment, a 40-meter tunnel oven, and a cooling and packaging line.\n\nAll metal structures, guards, and support frames were custom fabricated using our CNC press brake and welding equipment. The project was completed in 4 months, including installation, testing, and staff training. The bakery now produces over 10,000 loaves per day with a workforce of 15 operators.',
        fr: 'LA SOURCE MACHIEN a fourni et installé une ligne de production de boulangerie industrielle complète pour Boulangerie El Baraka dans le quartier de Bir Mourad Raïs à Alger. Le projet comprenait un système de pétrissage de 500 kg/h, un équipement automatisé de division et façonnage, un four tunnel de 40 mètres et une ligne de refroidissement et d\'emballage.\n\nToutes les structures métalliques, protections et cadres de support ont été fabriqués sur mesure avec notre plioir CNC et notre équipement de soudage. Le projet a été achevé en 4 mois, y compris l\'installation, les tests et la formation du personnel. La boulangerie produit maintenant plus de 10 000 pains par jour avec une équipe de 15 opérateurs.',
        ar: 'زوّدت LA SOURCE MACHIEN وركبت خط إنتاج مخبز صناعي متكامل لـ Boulangerie El Baraka في حي بئر مراد رايس في الجزائر العاصمة. تضمن المشروع نظام عجن بسعة 500 كجم/ساعة ومعدات تقسيم وتشكيل آلية وفرن نفق بطول 40 متراً وخط تبريد وتعبئة.\n\nجميع الهياكل المعدنية والحماية والأطر الداعمة تم تصنيعها حسب الطلب باستخدام ماكينة الثني واللحام لدينا. أُنجز المشروع في 4 أشهر، بما في ذلك التركيب والاختبار وتدريب الموظفين. ينتج المخبز الآن أكثر من 10,000 رغيف يومياً مع فريق عمل يبلغ 15 عاملاً.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&s=60',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&s=60',
      ]),
      client: 'Boulangerie El Baraka',
      location: 'Algiers',
      date: '2024-09',
      status: 'published',
      order: 1,
    },
    {
      title: JSON.stringify({
        en: 'Steel Workshop - Oran',
        fr: 'Atelier de Construction Métallique - Oran',
        ar: 'ورشة حديد وتصنيع - وهران',
      }),
      slug: 'steel-workshop-oran',
      description: JSON.stringify({
        en: 'Full steel fabrication workshop setup for Atelier Métal Plus in Oran, including CNC plasma cutter, welding stations, and hydraulic press brake for structural steel and metal building construction.',
        fr: 'Installation complète d\'atelier de fabrication métallique pour Atelier Métal Plus à Oran, comprenant une coupeuse plasma CNC, des postes de soudage et un plioir hydraulique pour la construction en acier et les bâtiments métalliques.',
        ar: 'إعداد ورشة تصنيع حديد كاملة لـ Atelier Métal Plus في وهران، تشمل قاطع بلازما بالتحكم الرقمي ومحطات لحام وماكينة ثني هيدروليكية لتصنيع الهياكل الفولاذية والمباني المعدنية.',
      }),
      content: JSON.stringify({
        en: 'We equipped Atelier Métal Plus with a complete steel fabrication workshop in the industrial zone of Oran. The project included a CNC plasma cutting table (2000x4000mm), a 160-ton CNC press brake, a 200-ton hydraulic press, MIG/MAG and TIG welding stations, and all necessary hand tools and safety equipment.\n\nThe workshop was designed for structural steel fabrication, serving the growing construction sector in western Algeria. Our team provided full installation, electrical work, and 2 weeks of operator training. The workshop now processes up to 50 tons of steel per month.',
        fr: 'Nous avons équipé Atelier Métal Plus d\'un atelier de fabrication métallique complet dans la zone industrielle d\'Oran. Le projet comprenait une table de découpe plasma CNC (2000x4000mm), un plioir hydraulique CNC de 160 tonnes, une presse hydraulique de 200 tonnes, des postes de soudage MIG/MAG et TIG, et tous les outils à main et équipements de sécurité nécessaires.\n\nL\'atelier a été conçu pour la fabrication de charpentes métalliques, servant le secteur de la construction en croissance dans l\'ouest de l\'Algérie. Notre équipe a assuré l\'installation complète, les travaux électriques et 2 semaines de formation des opérateurs. L\'atelier traite maintenant jusqu\'à 50 tonnes d\'acier par mois.',
        ar: 'جهزنا Atelier Métal Plus بورشة تصنيع حديد كاملة في المنطقة الصناعية بوهران. تضمن المشروع طاولة قص بلازما بالتحكم الرقمي (2000×4000 مم) وماكينة ثني هيدروليكية بالتحكم الرقمي سعة 160 طن ومكبس هيدروليكي 200 طن ومحطات لحام MIG/MAG وTIG وجميع الأدوات اليدوية ومعدات السلامة اللازمة.\n\nتم تصميم الورشة لتصنيع الهياكل الفولاذية، لخدمة قطاع البناء المتنامي في غرب الجزائر. قدم فريقنا التركيب الكامل والأعمال الكهربائية وأسبوعين من تدريب المشغلين. تعالج الورشة الآن ما يصل إلى 50 طناً من الفولاذ شهرياً.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&s=60',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=60',
      ]),
      client: 'Atelier Métal Plus',
      location: 'Oran',
      date: '2024-11',
      status: 'published',
      order: 2,
    },
    {
      title: JSON.stringify({
        en: 'Plastic Factory - Constantine',
        fr: 'Usine Plastique - Constantine',
        ar: 'مصنع بلاستيك - قسنطينة',
      }),
      slug: 'plastic-factory-constantine',
      description: JSON.stringify({
        en: 'Plastic injection molding setup for PlastDz Industries in Constantine, including injection molding machines, CNC machining for mold maintenance, and material handling systems.',
        fr: 'Installation de moulage par injection pour PlastDz Industries à Constantine, comprenant des machines d\'injection, de l\'usinage CNC pour l\'entretien des moules et des systèmes de manutention des matériaux.',
        ar: 'إعداد حقن بلاستيك لـ PlastDz Industries في قسنطينة، يشمل آلات حقن البلاستيك وتصنيع بالتحكم الرقمي لصيانة القوالب وأنظمة معالجة المواد.',
      }),
      content: JSON.stringify({
        en: 'PlastDz Industries partnered with us to establish a modern plastic injection molding facility in the Palma industrial zone of Constantine. The project scope included three injection molding machines (200T, 500T, and 800T), a CNC vertical machining center for mold maintenance and modification, temperature control units, and a complete material handling and drying system.\n\nWe also provided the entire electrical and hydraulic infrastructure, including transformers and cooling water systems. The factory produces plastic packaging containers and custom parts for the food and consumer goods industries. Our team conducted 3 weeks of comprehensive training covering machine operation, mold handling, and preventive maintenance.',
        fr: 'PlastDz Industries s\'est associé à nous pour établir une installation moderne de moulage par injection plastique dans la zone industrielle de Palma à Constantine. Le projet comprenait trois machines d\'injection (200T, 500T et 800T), un centre d\'usinage vertical CNC pour l\'entretien et la modification des moules, des unités de contrôle de température et un système complet de manutention et de séchage des matériaux.\n\nNous avons également fourni toute l\'infrastructure électrique et hydraulique, y compris les transformateurs et les systèmes d\'eau de refroidissement. L\'usine produit des conteneurs d\'emballage plastique et des pièces sur mesure pour les industries alimentaires et des biens de consommation. Notre équipe a mené 3 semaines de formation complète couvrant le fonctionnement des machines, la manipulation des moules et la maintenance préventive.',
        ar: 'تعاونت PlastDz Industries معنا لتأسيس منشأة حديثة لحقن البلاستيك في المنطقة الصناعية بالما بقسنطينة. تضمن نطاق المشروع ثلاث آلات حقن بلاستيك (200 طن و500 طن و800 طن) ومركز تصنيع عمودي بالتحكم الرقمي لصيانة وتعديل القوالب ووحدات تحكم درجة الحرارة ونظام كامل للتعامل مع المواد وتجفيفها.\n\nقدمنا أيضاً البنية التحتية الكهربائية والهيدروليكية بالكامل، بما في ذلك المحولات وأنظمة مياه التبريد. ينتج المصنع حاويات تغليف بلاستيكية وقطع مخصصة لصناعات الأغذية والسلع الاستهلاكية. قاد فريقنا 3 أسابيع من التدريب الشامل يغطي تشغيل الآلات والتعامل مع القوالب والصيانة الوقائية.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=60',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop&s=60',
      ]),
      client: 'PlastDz Industries',
      location: 'Constantine',
      date: '2025-01',
      status: 'published',
      order: 3,
    },
    {
      title: JSON.stringify({
        en: 'Construction Workshop - Annaba',
        fr: 'Atelier de Construction - Annaba',
        ar: 'ورشة بناء وتشييد - عنابة',
      }),
      slug: 'construction-workshop-annaba',
      description: JSON.stringify({
        en: 'Metal construction and fabrication workshop for BatiTravail SARL in Annaba, equipped with cutting, welding, and forming machinery for the construction and infrastructure sector.',
        fr: 'Atelier de construction et fabrication métallique pour BatiTravail SARL à Annaba, équipé de machines de coupe, soudage et formage pour le secteur de la construction et des infrastructures.',
        ar: 'ورشة بناء وتصنيع معادن لـ BatiTravail SARL في عنابة، مجهزة بآلات قص ولحام وتشكيل لقطاع البناء والبنية التحتية.',
      }),
      content: JSON.stringify({
        en: 'BatiTravail SARL selected LA SOURCE MACHIEN as their equipment partner for a new metal construction workshop in the Berrahal industrial zone of Annaba. The project delivered a comprehensive machinery package including a CNC plasma cutter, hydraulic shear (3000mm), CNC press brake, MIG/MAG welding stations, and a circular saw for profile cutting.\n\nThe workshop serves the booming construction sector in eastern Algeria, producing structural steel, metal framing, gates, and custom architectural metalwork. Our team managed the complete project from machinery selection through installation, electrical setup, and operator training completed in just 6 weeks.',
        fr: 'BatiTravail SARL a sélectionné LA SOURCE MACHIEN comme partenaire d\'équipement pour un nouvel atelier de construction métallique dans la zone industrielle de Berrahal à Annaba. Le projet a livré un ensemble complet de machines comprenant une coupeuse plasma CNC, une cisaille hydraulique (3000mm), un plioir hydraulique CNC, des postes de soudage MIG/MAG et une scie circulaire pour la coupe de profilés.\n\nL\'atelier dessert le secteur du construction en plein essor dans l\'est de l\'Algérie, produisant des charpentes métalliques, de l\'ossature métallique, des portails et de la ferronnerie architecturale sur mesure. Notre équipe a géré le projet complet de la sélection des machines à l\'installation, la mise en place électrique et la formation des opérateurs achevée en seulement 6 semaines.',
        ar: 'اختارت BatiTravail SARL شركة LA SOURCE MACHIEN كشريك معدات لورشة بناء معدنية جديدة في المنطقة الصناعية برحال بعنابة. سلّم المشروع حزمة آلات شاملة تشمل قاطع بلازما بالتحكم الرقمي وماكينة قص هيدروليكية (3000 مم) وماكينة ثني هيدروليكية بالتحكم الرقمي ومحطات لحام MIG/MAG ومنشار دائري لقطع الأشكال.\n\nتخدم الورشة قطاع البناء المزدهر في شرق الجزائر، وتنتج الهياكل الفولاذية والهياكل المعدنية والأبواب وأعمال المعادن المعمارية المخصصة. أدار فريقنا المشروع بالكامل من اختيار الآلات إلى التركيب والإعداد الكهربائي وتدريب المشغلين الذي اكتمل في 6 أسابيع فقط.',
      }),
      coverImage: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop&s=60',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&s=60',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&s=60',
      ]),
      client: 'BatiTravail SARL',
      location: 'Annaba',
      date: '2025-03',
      status: 'published',
      order: 4,
    },
  ];

  for (const project of projectsData) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
    console.log(`   ✅ Project: ${project.slug}`);
  }
  console.log('');

  // ============================================
  // 7. SERVICES (5)
  // ============================================
  console.log('🔧 Creating Services...');

  const servicesData = [
    {
      title: JSON.stringify({
        en: 'Machine Installation',
        fr: 'Installation de Machines',
        ar: 'تركيب الآلات',
      }),
      description: JSON.stringify({
        en: 'Professional installation of industrial machinery by our certified technical team. We handle site preparation, machine positioning, electrical connections, hydraulic setup, and initial calibration to ensure your equipment is production-ready from day one.',
        fr: 'Installation professionnelle de machines industrielles par notre équipe technique certifiée. Nous gérons la préparation du site, le positionnement des machines, les connexions électriques, l\'installation hydraulique et l\'étalonnage initial pour garantir que votre équipement est prêt pour la production dès le premier jour.',
        ar: 'تركيب احترافي للآلات الصناعية من قبل فريقنا التقني المعتمد. نتولى تجهيز الموقع ووضع الآلات والتوصيلات الكهربائية والإعداد الهيدروليكي والمعايرة الأولية لضمان جاهزية معداتك للإنتاج من اليوم الأول.',
      }),
      icon: 'Wrench',
      features: JSON.stringify({
        en: ['On-site assessment and planning', 'Professional rigging and positioning', 'Electrical and hydraulic connections', 'Initial calibration and testing', 'Operator handover training'],
        fr: ['Évaluation et planification sur site', 'Gréage et positionnement professionnels', 'Connexions électriques et hydrauliques', 'Étalonnage et tests initiaux', 'Formation de passation aux opérateurs'],
        ar: ['التقييم والتخطيط الميداني', 'الرفع والوضع الاحترافي', 'التوصيلات الكهربائية والهيدروليكية', 'المعايرة والاختبارات الأولية', 'تدريب تسليم المشغلين'],
      }),
      order: 1,
      status: 'draft',
    },
    {
      title: JSON.stringify({
        en: 'Import & Customs',
        fr: 'Importation et Douanes',
        ar: 'الاستيراد والجمارك',
      }),
      description: JSON.stringify({
        en: 'End-to-end import services for industrial machinery, handling all documentation, customs clearance, freight forwarding, and door-to-door delivery. Our experienced logistics team ensures smooth and timely importation from our global network of manufacturers.',
        fr: 'Services d\'importation de bout en bout pour les machines industrielles, traitant toute la documentation, le dédouanement, le transit fret et la livraison porte à porte. Notre équipe logistique expérimentée assure une importation fluide et ponctuelle depuis notre réseau mondial de fabricants.',
        ar: 'خدمات استيراد شاملة للآلات الصناعية، تشمل جميع الوثائق والتخليص الجمركي والشحن والتوصيل من الباب للباب. فريقنا اللوجستي ذو الخبرة يضمن استيراداً سلساً وفي الوقت المناسب من شبكتنا العالمية من المصنعين.',
      }),
      icon: 'Ship',
      features: JSON.stringify({
        en: ['Complete documentation handling', 'Customs clearance and compliance', 'Freight forwarding coordination', 'Door-to-door delivery', 'Insurance and tracking'],
        fr: ['Gestion complète de la documentation', 'Dédouanement et conformité', 'Coordination du transit fret', 'Livraison porte à porte', 'Assurance et suivi'],
        ar: ['التعامل الكامل مع الوثائق', 'التخليص الجمركي والامتثال', 'تنسيق الشحن', 'التوصيل من الباب للباب', 'التأمين والتتبع'],
      }),
      order: 2,
      status: 'draft',
    },
    {
      title: JSON.stringify({
        en: 'Maintenance & Repair',
        fr: 'Maintenance et Réparation',
        ar: 'الصيانة والإصلاح',
      }),
      description: JSON.stringify({
        en: 'Comprehensive maintenance and repair services to keep your machinery running at peak performance. We offer preventive maintenance programs, emergency repairs, spare parts supply, and machine overhauls to minimize downtime and extend equipment lifespan.',
        fr: 'Services complets de maintenance et réparation pour maintenir vos machines à des performances optimales. Nous proposons des programmes de maintenance préventive, des réparations d\'urgence, un approvisionnement en pièces de rechange et des révisions de machines pour minimiser les temps d\'arrêt et prolonger la durée de vie des équipements.',
        ar: 'خدمات صيانة وإصلاح شاملة للحفاظ على أداء آلاتك في ذروته. نقدم برامج صيانة وقائية وإصلاحات طارئة وتوريد قطع غيار وإعادة بناء الآلات لتقليل وقت التوقف وإطالة عمر المعدات.',
      }),
      icon: 'Settings',
      features: JSON.stringify({
        en: ['Preventive maintenance programs', 'Emergency breakdown response', 'Genuine spare parts supply', 'Machine overhaul and retrofit', 'Performance optimization'],
        fr: ['Programmes de maintenance préventive', 'Réponse d\'urgence aux pannes', 'Approvisionnement en pièces d\'origine', 'Révision et modernisation de machines', 'Optimisation des performances'],
        ar: ['برامج الصيانة الوقائية', 'الاستجابة الطارئة للأعطال', 'توريد قطع الغيار الأصلية', 'إعادة بناء وتحديث الآلات', 'تحسين الأداء'],
      }),
      order: 3,
      status: 'draft',
    },
    {
      title: JSON.stringify({
        en: 'Training & Support',
        fr: 'Formation et Support',
        ar: 'التدريب والدعم',
      }),
      description: JSON.stringify({
        en: 'Expert training programs for machine operators and maintenance technicians. Our training covers machine operation, programming, safety procedures, and basic troubleshooting. We provide both on-site training at your facility and hands-on sessions at our demonstration center.',
        fr: 'Programmes de formation experts pour les opérateurs de machines et les techniciens de maintenance. Notre formation couvre le fonctionnement des machines, la programmation, les procédures de sécurité et le dépannage de base. Nous fournissons une formation sur site dans vos installations et des sessions pratiques dans notre centre de démonstration.',
        ar: 'برامج تدريبية متخصصة لمشغلي الآلات وفنيي الصيانة. يغطي تدريبنا تشغيل الآلات والبرمجة وإجراءات السلامة واستكشاف الأعطال الأساسية. نقدم التدريب الميداني في منشآتكم وجلسات عملية في مركز العروض لدينا.',
      }),
      icon: 'GraduationCap',
      features: JSON.stringify({
        en: ['Operator training programs', 'CNC programming courses', 'Safety certification', 'On-site and in-center options', 'Technical documentation provided'],
        fr: ['Programmes de formation des opérateurs', 'Cours de programmation CNC', 'Certification de sécurité', 'Options sur site et en centre', 'Documentation technique fournie'],
        ar: ['برامج تدريب المشغلين', 'دورات برمجة التحكم الرقمي', 'شهادة السلامة', 'خيارات ميدانية وفي المركز', 'توثيق تقني متوفر'],
      }),
      order: 4,
      status: 'draft',
    },
    {
      title: JSON.stringify({
        en: 'Consultation & Planning',
        fr: 'Consultation et Planification',
        ar: 'الاستشارات والتخطيط',
      }),
      description: JSON.stringify({
        en: 'Strategic consultation services for industrial machinery procurement and workshop planning. Our engineering team helps you select the right equipment, plan your workshop layout, optimize production workflows, and develop long-term maintenance strategies aligned with your business goals.',
        fr: 'Services de consultation stratégique pour l\'approvisionnement en machines industrielles et la planification d\'ateliers. Notre équipe d\'ingénierie vous aide à sélectionner le bon équipement, planifier l\'aménagement de votre atelier, optimiser les flux de production et développer des stratégies de maintenance à long terme alignées sur vos objectifs commerciaux.',
        ar: 'خدمات استشارات استراتيجية لشراء الآلات الصناعية وتخطيط الورش. يساعد فريق الهندسة لديك في اختيار المعدات المناسبة وتخطيط تخطيط ورشتك وتحسين سير العمل الإنتاجي وتطوير استراتيجيات صيانة طويلة الأمد تتوافق مع أهداف عملكم.',
      }),
      icon: 'ClipboardList',
      features: JSON.stringify({
        en: ['Equipment selection guidance', 'Workshop layout planning', 'Production flow optimization', 'Cost-benefit analysis', 'Long-term maintenance strategy'],
        fr: ['Conseils en sélection d\'équipements', 'Planification de l\'aménagement d\'atelier', 'Optimisation du flux de production', 'Analyse coûts-bénéfices', 'Stratégie de maintenance à long terme'],
        ar: ['إرشادات اختيار المعدات', 'تخطيط تخطيط الورشة', 'تحسين سير العمل الإنتاجي', 'تحليل التكلفة والعائد', 'استراتيجية صيانة طويلة الأمد'],
      }),
      order: 5,
      status: 'draft',
    },
  ];

  await prisma.service.deleteMany();
  for (const service of servicesData) {
    await prisma.service.create({
      data: service,
    });
    console.log(`   ✅ Service: ${service.icon}`);
  }
  console.log('');

  // ============================================
  // 8. PARTNERS (6)
  // ============================================
  console.log('🤝 Creating Partners...');

  const partnersData = [
    {
      name: 'TechMach Germany',
      logo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop&s=70',
      website: 'https://www.techmach.de',
      order: 1,
    },
    {
      name: 'SinoSteel China',
      logo: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&h=200&fit=crop&s=70',
      website: 'https://www.sinosteel.com',
      order: 2,
    },
    {
      name: 'EuroTools Italy',
      logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop&s=70',
      website: 'https://www.eurotools.it',
      order: 3,
    },
    {
      name: 'NordMec Sweden',
      logo: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=200&h=200&fit=crop&s=70',
      website: 'https://www.nordmec.se',
      order: 4,
    },
    {
      name: 'AtlasMach Turkey',
      logo: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop&s=70',
      website: 'https://www.atlasmach.com.tr',
      order: 5,
    },
    {
      name: 'LaserTech Korea',
      logo: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=200&h=200&fit=crop&s=70',
      website: 'https://www.lasertech.kr',
      order: 6,
    },
  ];

  await prisma.partner.deleteMany();
  for (const partner of partnersData) {
    await prisma.partner.create({
      data: partner,
    });
    console.log(`   ✅ Partner: ${partner.name}`);
  }
  console.log('');

  // ============================================
  // 9. FAQs (8)
  // ============================================
  console.log('❓ Creating FAQs...');

  const faqsData = [
    {
      question: JSON.stringify({
        en: 'How do I place an order for a machine?',
        fr: 'Comment commander une machine ?',
        ar: 'كيف يمكنني طلب آلة؟',
      }),
      answer: JSON.stringify({
        en: 'You can place an order by contacting our sales team via phone, email, or WhatsApp. We will discuss your requirements, provide a detailed quotation, and guide you through the ordering process. Once the order is confirmed, we handle all import documentation and logistics for you.',
        fr: 'Vous pouvez passer commande en contactant notre équipe commerciale par téléphone, e-mail ou WhatsApp. Nous discuterons de vos besoins, fournirons un devis détaillé et vous guiderons dans le processus de commande. Une fois la commande confirmée, nous gérons toute la documentation d\'importation et la logistique pour vous.',
        ar: 'يمكنك تقديم طلب عن طريق التواصل مع فريق المبيعات لدينا عبر الهاتف أو البريد الإلكتروني أو واتساب. سنناقش متطلباتك ونقدم عرض أسعار مفصل ونرشدك خلال عملية الطلب. بمجرد تأكيد الطلب، نتولى جميع وثائق الاستيراد واللوجستيات نيابة عنك.',
      }),
      order: 1,
      category: 'general',
    },
    {
      question: JSON.stringify({
        en: 'What is the typical delivery time for machines?',
        fr: 'Quel est le délai de livraison typique pour les machines ?',
        ar: 'ما هو وقت التسليم المعتاد للآلات؟',
      }),
      answer: JSON.stringify({
        en: 'Delivery times vary depending on the machine type and availability. For in-stock machines, delivery takes approximately 2-4 weeks including customs clearance. For made-to-order machines from our international partners, delivery typically takes 8-16 weeks. We provide accurate delivery estimates with every quotation.',
        fr: 'Les délais de livraison varient selon le type de machine et la disponibilité. Pour les machines en stock, la livraison prend environ 2-4 semaines y compris le dédouanement. Pour les machines sur commande de nos partenaires internationaux, la livraison prend généralement 8-16 semaines. Nous fournissons des estimations de livraison précises avec chaque devis.',
        ar: 'تختلف أوقات التسليم حسب نوع الآلة والتوفر. للآلات المتوفرة في المخزون، يستغرق التسليم حوالي 2-4 أسابيع بما في ذلك التخليص الجمركي. للآلات المصنوعة حسب الطلب من شركائنا الدوليين، يستغرق التسليم عادة 8-16 أسبوعاً. نقدم تقديرات تسليم دقيقة مع كل عرض أسعار.',
      }),
      order: 2,
      category: 'general',
    },
    {
      question: JSON.stringify({
        en: 'What warranty do you offer on machines?',
        fr: 'Quelle garantie offrez-vous sur les machines ?',
        ar: 'ما الضمان الذي تقدمونه على الآلات؟',
      }),
      answer: JSON.stringify({
        en: 'All our machines come with a manufacturer warranty that typically covers 12-24 months from the date of commissioning. The warranty covers manufacturing defects and component failures under normal use conditions. We also offer extended warranty packages for additional peace of mind.',
        fr: 'Toutes nos machines sont livrées avec une garantie fabricant qui couvre généralement 12-24 mois à compter de la date de mise en service. La garantie couvre les défauts de fabrication et les défaillances de composants dans des conditions d\'utilisation normales. Nous proposons également des forfaits de garantie prolongée.',
        ar: 'تأتي جميع آلاتنا مع ضمان من الشركة المصنعة يغطي عادة 12-24 شهراً من تاريخ التشغيل. يغطي الضمان عيوب التصنيع وأعطال المكونات في ظل ظروف الاستخدام العادية. نقدم أيضاً حزم ضمان ممتدة لراحة بال إضافية.',
      }),
      order: 3,
      category: 'services',
    },
    {
      question: JSON.stringify({
        en: 'What payment methods do you accept?',
        fr: 'Quelles méthodes de paiement acceptez-vous ?',
        ar: 'ما طرق الدفع التي تقبلونها؟',
      }),
      answer: JSON.stringify({
        en: 'We accept bank transfers (domestic and international), certified checks, and letters of credit. For large orders, we offer flexible payment plans including a 30% advance payment with the balance due upon delivery. Payment terms can be negotiated based on order size and customer relationship.',
        fr: 'Nous acceptons les virements bancaires (nationaux et internationaux), les chèques certifiés et les lettres de crédit. Pour les commandes importantes, nous proposons des plans de paiement flexibles incluant un acompte de 30% avec le solde à la livraison. Les conditions de paiement peuvent être négociées selon la taille de la commande.',
        ar: 'نقبل التحويلات البنكية (المحلية والدولية) والشيكات المعتمدة واعتمادات الاستيراد. للطلبات الكبيرة، نقدم خطط دفع مرنة تشمل دفعة مقدمة 30% مع الباقي عند التسليم. يمكن التفاوض على شروط الدفع بناءً على حجم الطلب والعلاقة مع العميل.',
      }),
      order: 4,
      category: 'general',
    },
    {
      question: JSON.stringify({
        en: 'Do you provide machine installation services?',
        fr: 'Proposez-vous des services d\'installation de machines ?',
        ar: 'هل تقدمون خدمات تركيب الآلات؟',
      }),
      answer: JSON.stringify({
        en: 'Yes, professional machine installation is one of our core services. Our certified technical team handles complete installation including site preparation, machine positioning, electrical and hydraulic connections, calibration, and testing. We also provide operator training during the installation process.',
        fr: 'Oui, l\'installation professionnelle de machines est l\'un de nos services principaux. Notre équipe technique certifiée assure l\'installation complète comprenant la préparation du site, le positionnement, les connexions électriques et hydrauliques, l\'étalonnage et les tests. Nous fournissons également une formation des opérateurs pendant le processus d\'installation.',
        ar: 'نعم، تركيب الآلات بشكل احترافي هو أحد خدماتنا الأساسية. يتولى فريقنا التقني المعتمد التركيب الكامل بما في ذلك تجهيز الموقع ووضع الآلة والتوصيلات الكهربائية والهيدروليكية والمعايرة والاختبار. نقدم أيضاً تدريباً للمشغلين أثناء عملية التركيب.',
      }),
      order: 5,
      category: 'services',
    },
    {
      question: JSON.stringify({
        en: 'Do you provide technical support after purchase?',
        fr: 'Fournissez-vous un support technique après l\'achat ?',
        ar: 'هل تقدمون دعماً تقنياً بعد الشراء؟',
      }),
      answer: JSON.stringify({
        en: 'Absolutely. We provide comprehensive after-sales technical support including a dedicated support hotline, on-site repair services, remote diagnostics, and preventive maintenance programs. Our service centers across Algeria ensure quick response times. We also maintain a full inventory of genuine spare parts.',
        fr: 'Absolument. Nous fournissons un support technique après-vente complet comprenant une ligne d\'assistance dédiée, des services de réparation sur site, un diagnostic à distance et des programmes de maintenance préventive. Nos centres de service à travers l\'Algérie garantissent des temps de réponse rapides. Nous maintenons également un inventaire complet de pièces de rechange d\'origine.',
        ar: 'بالتأكيد. نقدم دعماً تقنياً شاملاً بعد البيع يشمل خطاً ساخناً مخصصاً للدعم وخدمات إصلاح ميدانية وتشخيصاً عن بعد وبرامج صيانة وقائية. مراكز خدمتنا في جميع أنحاء الجزائر تضمن أوقات استجابة سريعة. نحافظ أيضاً على مخزون كامل من قطع الغيار الأصلية.',
      }),
      order: 6,
      category: 'services',
    },
    {
      question: JSON.stringify({
        en: 'Can I return or exchange a machine?',
        fr: 'Puis-je retourner ou échanger une machine ?',
        ar: 'هل يمكنني إرجاع أو استبدال آلة؟',
      }),
      answer: JSON.stringify({
        en: 'Machine returns are handled on a case-by-case basis. If the machine arrives with manufacturing defects or does not match the agreed specifications, we will repair, replace, or refund according to the warranty terms. For custom-made machines ordered specifically for your requirements, returns are generally not accepted unless there is a warranty-covered defect.',
        fr: 'Les retours de machines sont traités au cas par cas. Si la machine arrive avec des défauts de fabrication ou ne correspond pas aux spécifications convenues, nous réparerons, remplacerons ou rembourserons selon les termes de la garantie. Pour les machines sur mesure commandées spécifiquement pour vos besoins, les retours ne sont généralement pas acceptés sauf en cas de défaut couvert par la garantie.',
        ar: 'يتم التعامل مع إرجاع الآلات حسب كل حالة على حدة. إذا وصلت الآلة مع عيوب تصنيع أو لا تتطابق مع المواصفات المتفق عليها، سنقوم بالإصلاح أو الاستبدال أو الاسترداد وفقاً لشروط الضمان. للآلات المصنوعة حسب الطلب، لا يتم قبول الإرجاع بشكل عام إلا في حالة وجود عيب مشمول بالضمان.',
      }),
      order: 7,
      category: 'general',
    },
    {
      question: JSON.stringify({
        en: 'Do you supply spare parts and consumables?',
        fr: 'Fournissez-vous des pièces de rechange et des consommables ?',
        ar: 'هل توردون قطع الغيار والمستهلكات؟',
      }),
      answer: JSON.stringify({
        en: 'Yes, we maintain a comprehensive inventory of genuine spare parts and consumables for all the machines we sell. This includes cutting tools, welding consumables, hydraulic components, electronic boards, motors, and wear parts. We can also source specialized parts from our international partners with fast delivery times.',
        fr: 'Oui, nous maintenons un inventaire complet de pièces de rechange d\'origine et de consommables pour toutes les machines que nous vendons. Cela comprend les outils de coupe, les consommables de soudage, les composants hydrauliques, les cartes électroniques, les moteurs et les pièces d\'usure. Nous pouvons également sourcer des pièces spécialisées auprès de nos partenaires internationaux avec des délais de livraison rapides.',
        ar: 'نعم، نحافظ على مخزون شامل من قطع الغيار الأصلية والمستهلكات لجميع الآلات التي نبيعها. يشمل ذلك أدوات القطع ومستهلكات اللحام والمكونات الهيدروليكية واللوحات الإلكترونية والمحركات وقطع التآكل. يمكننا أيضاً توفير قطع متخصصة من شركائنا الدوليين بأوقات تسليم سريعة.',
      }),
      order: 8,
      category: 'services',
    },
  ];

  await prisma.fAQ.deleteMany();
  for (const faq of faqsData) {
    await prisma.fAQ.create({
      data: faq,
    });
    console.log(`   ✅ FAQ ${faq.order}: ${JSON.parse(faq.question).en}`);
  }
  console.log('');

  // ============================================
  // 10. SITE SETTINGS
  // ============================================
  console.log('⚙️ Creating Site Settings...');

  const settingsData = [
    {
      key: 'company_name',
      value: 'LA SOURCE MACHIEN',
    },
    {
      key: 'company_description',
      value: JSON.stringify({
        en: 'LA SOURCE MACHIEN is Algeria\'s leading supplier of industrial machinery, CNC machines, welding equipment, and complete production line solutions. We bring world-class industrial technology to Algerian manufacturers with expert installation, training, and support.',
        fr: 'LA SOURCE MACHIEN est le principal fournisseur algérien de machines industrielles, machines CNC, équipements de soudage et solutions complètes de lignes de production. Nous apportons une technologie industrielle de classe mondiale aux fabricants algériens avec installation, formation et support experts.',
        ar: 'LA SOURCE MACHIEN هي المورد الرائد في الجزائر للآلات الصناعية وآلات التحكم الرقمي ومعدات اللحام وحلول خطوط الإنتاج المتكاملة. نقدم تكنولوجيا صناعية عالمية المستوى للمصنعين الجزائريين مع تركيب وتدريب ودعم احترافي.',
      }),
    },
    {
      key: 'contact_phone',
      value: '+213 23 45 67 89',
    },
    {
      key: 'contact_email',
      value: 'contact@lasourcemachien.dz',
    },
    {
      key: 'contact_whatsapp',
      value: '+213 555 123 456',
    },
    {
      key: 'contact_address',
      value: 'Zone Industrielle, Rouiba, Alger, Algeria',
    },
    {
      key: 'social_facebook',
      value: 'https://www.facebook.com/lasourcemachien',
    },
    {
      key: 'working_hours',
      value: JSON.stringify({
        en: 'Sun-Thu 8AM-5PM',
        fr: 'Dim-Jeu 8h-17h',
        ar: 'الأحد-الخميس 8ص-5م',
      }),
    },
    {
      key: 'meta_title',
      value: 'LA SOURCE MACHIEN - Industrial Machinery Supplier in Algeria',
    },
    {
      key: 'meta_description',
      value: JSON.stringify({
        en: 'LA SOURCE MACHIEN - Algeria\'s leading supplier of CNC machines, press machines, lathes, welding equipment, and complete production line solutions. Expert installation and support.',
        fr: 'LA SOURCE MACHIEN - Le principal fournisseur algérien de machines CNC, presses, tours, équipements de soudage et solutions de lignes de production. Installation et support experts.',
        ar: 'LA SOURCE MACHIEN - المورد الرائد في الجزائر لآلات التحكم الرقمي والآلات المكبسية والخراطات ومعدات اللحام وحلول خطوط الإنتاج. تركيب ودعم احترافي.',
      }),
    },
  ];

  for (const setting of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`   ✅ Setting: ${setting.key}`);
  }
  console.log('');

  console.log('🎉 Seed completed successfully!\n');
  console.log('Summary:');
  console.log('  - 1 Admin User');
  console.log('  - 5 Categories');
  console.log('  - 12 Machines');
  console.log('  - 3 Production Lines (with machine links)');
  console.log('  - 4 News Posts');
  console.log('  - 4 Projects');
  console.log('  - 5 Services');
  console.log('  - 6 Partners');
  console.log('  - 8 FAQs');
  console.log('  - 10 Site Settings');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
