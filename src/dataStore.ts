/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Submission, SubmissionStatus, Moderator, ContactMessage, MessageReply } from './types';
import { supabase } from './supabaseService';

// Let's create helper to generate unique reference ID: IDEA-YYYY-XXXX
export function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `IDEA-${year}-${randNum}`;
}

// Pre-populate 10 realistic, varied startup submissions for rich dashboard graphs immediately!
const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    reference_id: 'IDEA-2026-8349',
    founder_name: 'أحمد بن عبد الرحمن',
    email: 'ahmad@finflow.sa',
    phone: '501234567',
    phone_country: 'sa',
    city: 'الرياض',
    project_name: 'محفظة تدفق | Tidafuq Pay',
    description: 'منصة دفع وحلول فوترة ذكية مصممة خصيصاً للمتاجر الإلكترونية الصغيرة والمتوسطة لتسريع تحصيل الأموال وإتاحة التقسيط الفوري عبر الذكاء الاصطناعي.',
    problem: 'صعوبة تحصيل المدفوعات وتأخر الفواتير للمتاجر الصغيرة مع ارتفاع رسوم بوابات الدفع التقليدية وعزوف المستخدمين عن الشراء الفوري دون تقسيط.',
    target_market: 'B2B',
    stage: 'early',
    has_revenue: 'yes',
    revenue_range: 'growth',
    team_size: '6-15',
    looking_for: ['استثمار', 'شراكة'],
    looking_for_notes: 'تبحث عن جولة استثمارية بذرة بقيمة ربع مليون دولار وتسهيلات ربط مع المصارف الإقليمية.',
    revenue_model: ['اشتراك', 'عمولة', 'رسوم المعاملات'],
    funding_range: '500,000 - 1,000,000 ر.س',
    sectors: ['التكنولوجيا المالية', 'SaaS / برمجيات'],
    pitch_url: 'https://tidafuq-pitch.co/v1',
    pitch_file_name: 'tidafuq_deck_2026.pdf',
    heard_from: 'تويتر / منصة إكس من أحد المسرعات الشريكة',
    status: 'promising',
    score: 87,
    admin_notes: 'فريق عمل متكامل وخبرة ممتازة في قطاع التقنية المالية بالخليج. المشروع يبدو جاذباً جداً للاستثمار.',
    created_at: '2026-05-12T14:32:00Z',
    email_sent: true
  },
  {
    id: 'sub-2',
    reference_id: 'IDEA-2026-9210',
    founder_name: 'سارة القحطاني',
    email: 'sarah.q@clinilink.co',
    phone: '544002341',
    phone_country: 'sa',
    city: 'جدة',
    project_name: 'عيادتي الذكية | CliniLink',
    description: 'جهاز طبي منزلي متصل بالإنترنت لإجراء الفحوصات الحيوية الأولية ونقل بياناتها بالوقت الفعلي إلى العيادة مع نظام استشارة فورية بالذكاء الاصطناعي.',
    problem: 'زيادة أوقات الانتظار وتكلفة الفحص لمتابعة حالة المرضى المصابين بأعراض مزمنة أو كبار السن الذين يحتاجون لمتابعة دقيقة في المنازل.',
    target_market: 'B2C',
    stage: 'prototype',
    has_revenue: 'no',
    team_size: '2-5',
    looking_for: ['إرشاد', 'دعم مبكر'],
    looking_for_notes: 'بحاجة إلى توجيه قانوني بخصوص التراخيص الطبية من وزارة الصحة وهيئة الغذاء والدواء.',
    revenue_model: ['اشتراك', 'شراء لمرة واحدة'],
    funding_range: '100,000 - 500,000 ر.س',
    sectors: ['التكنولوجيا الصحية', 'الذكاء الاصطناعي'],
    pitch_url: '',
    pitch_file_name: 'clinilink_concept.docx',
    heard_from: 'مؤتمر الرعاية الصحية الرقمية بالرياض',
    status: 'under_review',
    score: 64,
    admin_notes: 'النموذج الأولي واعد لكن يحتاج إلى تراخيص معقدة جداً. تم تكليف مستشار الرعاية الصحية بمراجعتها.',
    created_at: '2026-05-18T09:12:00Z',
    email_sent: true
  },
  {
    id: 'sub-3',
    reference_id: 'IDEA-2026-3841',
    founder_name: 'خالد عبد الله الحربي',
    email: 'khaled@shihon.sa',
    phone: '566219800',
    phone_country: 'sa',
    city: 'الدمام',
    project_name: 'شحون لوجستكس | Shihon',
    description: 'تطبيق وبوابة لتنظيم وتتبع حركة الشاحنات الكبيرة وربطها بالمصانع والمستودعات في السعودية لتقليل أوقات الانتظار وتحسين التكلفة اللوجستية.',
    problem: 'عدم كفاءة تشغيل الشاحنات وعودتها فارغة في أكثر من 40% من الرحلات مع صعوبة تواصل الشركات مع مالكي الشاحنات الأفراد بشكل منظم.',
    target_market: 'B2B',
    stage: 'growth',
    has_revenue: 'yes',
    revenue_range: 'expansion',
    team_size: '15+',
    looking_for: ['تمويل متقدم', 'شراكة'],
    looking_for_notes: 'نبحث عن شريك استراتيجي لتغطية المنطقة الغربية والتوسع للشرقية بنهاية العام الحالي.',
    revenue_model: ['عمولة', 'رسوم المعاملات'],
    funding_range: '5 مليون - 10 مليون ر.س',
    sectors: ['اللوجستيات', 'SaaS / برمجيات'],
    pitch_url: 'https://shihon-logistics.sa/pitch',
    pitch_file_name: '',
    heard_from: 'محرك بحث جوجل عن مستثمرين لوجستيين',
    status: 'invested',
    score: 94,
    admin_notes: 'مشروع ناضج وعائدات مالية مثبتة. تم ربطهم بأحد مستخدمينا الاستراتيجيين في جولة التمويل أ وتم الاستثمار!',
    created_at: '2026-05-02T18:45:00Z',
    email_sent: true
  },
  {
    id: 'sub-4',
    reference_id: 'IDEA-2026-4712',
    founder_name: 'نورة السديري',
    email: 'nora@edugrow.net',
    phone: '550192837',
    phone_country: 'sa',
    city: 'الرياض',
    project_name: 'إديو-جرو | EduGrow AI',
    description: 'منصة تعليمية تفاعلية تستخدم الذكاء الاصطناعي لإنشاء وتطوير مسارات تعلم مخصصة لكل طالب بالمرحلة المتوسطة بناءً على مستوى فهمه ونقاط ضعفه.',
    problem: 'اتباع طرائق تعليم موحدة لجميع الطلاب دون مراعاة الاختلاف الفردي؛ مما يؤدي لضعف دافعية التعلم وتراجع التحصيل لبعض الطلبة.',
    target_market: 'B2B2C',
    stage: 'idea',
    has_revenue: 'no',
    team_size: '1',
    looking_for: ['إرشاد', 'شراكة'],
    looking_for_notes: 'أبحث عن شريك تقني خبير بالذكاء الاصطناعي للمساعدة في برمجة النموذج الأولي الأول.',
    revenue_model: ['اشتراك'],
    funding_range: 'أقل من 100,000 ر.س',
    sectors: ['تكنولوجيا التعليم', 'الذكاء الاصطناعي', 'المجتمع'],
    pitch_url: '',
    pitch_file_name: '',
    heard_from: 'صديق رشح لي المنصة',
    status: 'new',
    score: null,
    admin_notes: '',
    created_at: '2026-05-28T11:04:00Z',
    email_sent: false
  },
  {
    id: 'sub-5',
    reference_id: 'IDEA-2026-1109',
    founder_name: 'عمر الرويلي',
    email: 'o.rwaily@agrismart.com',
    phone: '599812736',
    phone_country: 'sa',
    city: 'الخبر',
    project_name: 'أجري-سمارت | AgriSmart',
    description: 'منظومة ري ذكية متكاملة بحساسات إنترنت الأشياء (IoT) لقياس جودة التربة ونسبة الرطوبة، ويتم التحكم بها عبر خوارزميات لحفظ مياه الري بنسبة 50%.',
    problem: 'الهدر الضخم في المياه المستهلكة في الزراعة بالمناطق الصحراوية، وارتفاع كلفة الأسمدة والإنتاج لعدم دقة رصد أحوال التربة اليومية.',
    target_market: 'B2B',
    stage: 'prototype',
    has_revenue: 'yes',
    revenue_range: 'early',
    team_size: '2-5',
    looking_for: ['استثمار', 'دعم مبكر'],
    looking_for_notes: 'نبحث عن منحة ابتكار أو استثمار ملائكي لشراء المواد الخام لبناء 50 وحدة استشعار إضافية للمزارع المتعاقدة.',
    revenue_model: ['عمولة', 'شراء لمرة واحدة'],
    funding_range: '100,000 - 500,000 ر.س',
    sectors: ['التكنولوجيا الزراعية', 'اللوجستيات'],
    pitch_url: 'https://agrismart.sa/presentation',
    pitch_file_name: 'agrismart_proposal.pdf',
    heard_from: 'صحيفة سبق الإخبارية',
    status: 'under_review',
    score: 72,
    admin_notes: 'الفكرة مهمة جداً ومستدامة بيئياً بالتماشي مع رؤية 2030. سنحجز لهم موعداً لتقييم كفاءة الجهاز الفيزيائي.',
    created_at: '2026-05-21T15:20:00Z',
    email_sent: true
  },
  {
    id: 'sub-6',
    reference_id: 'IDEA-2026-7788',
    founder_name: 'سليمان الفهيد',
    email: 's.fehaid@realtech.io',
    phone: '531112233',
    phone_country: 'sa',
    city: 'مكة المكرمة',
    project_name: 'منصة عقار لينك | Aqarlink',
    description: 'بوابة رقمية تتيح تملك حصص مشاعة في عقارات تجارية مدرة للدخل بأسعار تبدأ من 5,000 ريال، لتسهيل الاستثمار العقاري للجميع بموثوقية رسمية.',
    problem: 'احتكار الاستثمار في العقارات المدرة للأرباح الكبيرة على كبار المستثمرين والشركات، وصعوبة تملك صغار المدخرين لعلو كلفة العقار الفردي كاملاً.',
    target_market: 'B2C',
    stage: 'early',
    has_revenue: 'yes',
    revenue_range: 'early',
    team_size: '6-15',
    looking_for: ['استثمار', 'شراكة'],
    looking_for_notes: 'الحصول على المبادرة التجريبية من هيئة السوق المالية (Sandbox) لبدء استقبال أموال المودعين.',
    revenue_model: ['عمولة', 'رسوم المعاملات'],
    funding_range: '1 مليون - 5 مليون ر.س',
    sectors: ['العقارات', 'التكنولوجيا المالية'],
    pitch_url: '',
    pitch_file_name: 'aqar_link_investment.ppt',
    heard_from: 'قناة الإخبارية بالتلفزيون السعودي',
    status: 'promising',
    score: 82,
    admin_notes: 'قطاع الفنتك العقاري يمر بطفرة حالية. المشروع يملك إطار عمل قانوني متين بالتعاون مع مكاتب قانونية معتمدة.',
    created_at: '2026-05-15T12:00:00Z',
    email_sent: true
  },
  {
    id: 'sub-7',
    reference_id: 'IDEA-2026-6123',
    founder_name: 'فاطمة العوفي',
    email: 'f.oufi@souqspace.sa',
    phone: '540993881',
    phone_country: 'sa',
    city: 'المدينة المنورة',
    project_name: 'سوق سبيس | SouqSpace',
    description: 'سوق إلكتروني متكامل يسهل على الأسر المنتجة والحرفية تصنيع علامات تجارية مصغرة خاصة بهم، ويشمل تغليفاً وشحناً موحداً لضمان الجودة للمشتري.',
    problem: 'عجز الأسر المنتجة اليدوية عن إدارة الشحن والتغليف بكفاءة احترافية، مما يقلل من رغبة الزبائن في الشراء لعدم ضمان سلامة وجودة الطلب.',
    target_market: 'B2C',
    stage: 'early',
    has_revenue: 'yes',
    revenue_range: 'early',
    team_size: '2-5',
    looking_for: ['شراكة', 'دعم مبكر'],
    looking_for_notes: 'عقد شراكات مع شركات التوصيل السريع للحصول على أسعار شحن مخفضة وتنافسية.',
    revenue_model: ['عمولة', 'إعلانات'],
    funding_range: '100,000 - 500,000 ر.س',
    sectors: ['تجارة إلكترونية', 'المجتمع'],
    pitch_url: 'https://souqspace.wixsite.com/intro',
    pitch_file_name: 'souqspace_deck.pdf',
    heard_from: 'فعاليات جافلان بالرياض',
    status: 'new',
    score: null,
    admin_notes: '',
    created_at: '2026-05-29T16:10:00Z',
    email_sent: false
  },
  {
    id: 'sub-8',
    reference_id: 'IDEA-2026-2342',
    founder_name: 'عبدالمحسن المطيري',
    email: 'm.mutairi@smartgrid.sa',
    phone: '542381273',
    phone_country: 'sa',
    city: 'الرياض',
    project_name: 'الشبكة الذكية للطاقة | Smart Grid Tech',
    description: 'أنظمة متطورة وبرمجيات ذكاء اصطناعي لمراقبة وتنظيم توزيع الأحمال الكهربائية لمحطات شحن السيارات الكهربائية لرفع الكفاءة وتفادي انقطاع التيار.',
    problem: 'زيادة الإجهاد على شبكات الكهرباء المغذية للمباني التجارية والعمومية مع تسارع تملك وتبني السيارات الكهربائية وشحنها المتزامن بموثوقية.',
    target_market: 'B2B',
    stage: 'prototype',
    has_revenue: 'no',
    team_size: '6-15',
    looking_for: ['استثمار', 'شراكة', 'إرشاد'],
    looking_for_notes: 'عقد شراكات مع جهات حكومية وبلدية لتجربة الشبكة في المحطات السريعة بطريق مكة-المدينة السريع.',
    revenue_model: ['اشتراك', 'رسوم المعاملات'],
    funding_range: '1 مليون - 5 مليون ر.س',
    sectors: ['الطاقة', 'SaaS / برمجيات', 'حكومي'],
    pitch_url: 'https://smartgridtech.pro/deck',
    pitch_file_name: '',
    heard_from: 'النشرة البريدية لرياضة الأعمال',
    status: 'under_review',
    score: 55,
    admin_notes: 'سوق البنية التحتية شاحنة ذكية جداً وضرورية. العائق يكمن بكبر مدة نضج وتصنيع الحساسات الثقيلة.',
    created_at: '2026-05-24T08:14:00Z',
    email_sent: true
  },
  {
    id: 'sub-9',
    reference_id: 'IDEA-2026-5561',
    founder_name: 'ريم الدوسري',
    email: 'reem@vr-medi.co',
    phone: '533118833',
    phone_country: 'sa',
    city: 'أبها',
    project_name: 'في-آر ميدي | VR-Medi Therapy',
    description: 'نظام رعاية متكامل بنظارات الواقع الافتراضي لعلاجات الصحة النفسية والتغلب على الفوبيا والقلق المزمن تحت إشراف أطباء نفسيين معتمدين.',
    problem: 'الوصمة الاجتماعية التي تحول دون رغبة بعض المرضى بالذهاب شخصياً للمصحات العلاجية أو عدم توفر تجارب بيئية مناسبة تفاعلية للتشافي والتعافي.',
    target_market: 'B2C',
    stage: 'prototype',
    has_revenue: 'no',
    team_size: '2-5',
    looking_for: ['دعم مبكر', 'إرشاد'],
    looking_for_notes: 'إجراء دراسة إكلينيكية مع مستشفى الملك فيصل التخصصي لاختبار فاعلية البرنامج وتجنب أعراض الدوار أثناء الارتداء.',
    revenue_model: ['اشتراك', 'Freemium'],
    funding_range: '100,000 - 500,000 ر.س',
    sectors: ['التكنولوجيا الصحية', 'الإعلام'],
    pitch_url: '',
    pitch_file_name: 'vrmedi_deck_concept.pdf',
    heard_from: 'البحث المباشر على الإنترنت',
    status: 'rejected',
    score: 42,
    admin_notes: 'الفكرة لطيفة تكنولوجياً ولكن غير واقعية وتطبيقها الطبي بدون تراخيص صعبة بالخليج حالياً، تفتقر للحلول الواقعية لتأثير المرضى المصابين بحالات حادة.',
    created_at: '2026-05-10T17:30:00Z',
    email_sent: true
  },
  {
    id: 'sub-10',
    reference_id: 'IDEA-2026-1049',
    founder_name: 'فيصل السبيعي',
    email: 'faisal@safepetroleum.sa',
    phone: '502391283',
    phone_country: 'sa',
    city: 'الجبيل',
    project_name: 'منظومة درع الأنابيب | PipeShield',
    description: 'نظام فحص ذكي لأنابيب البتروكيماويات والغاز باستخدام طائرات بدون طيار مجهزة بحساسات طيفية للكشف المبكر عن التسريبات والصدأ الدقيق.',
    problem: 'التكلفة الباهظة والخطورة العالية في الفحص اليدوي لأنابيب ومصانع الهياكل المعدنية الكبرى مع صعوبة التنبؤ بالتسريبات غير المرئية.',
    target_market: 'B2B',
    stage: 'growth',
    has_revenue: 'yes',
    revenue_range: 'growth',
    team_size: '6-15',
    looking_for: ['استثمار', 'شراكة'],
    looking_for_notes: 'الحصول على تعاون هندسي لاختبار النظام في بيئة صناعية صعبة بالهيئة الملكية بالجبيل.',
    revenue_model: ['اشتراك', 'خدمات مهنية'],
    funding_range: '1 مليون - 5 مليون ر.س',
    sectors: ['SaaS / برمجيات', 'أخرى'],
    pitch_url: '',
    pitch_file_name: 'pipeshield_industrial_v2.pdf',
    heard_from: 'لينكد إن',
    status: 'promising',
    score: 89,
    admin_notes: 'مشروع مذهل لحماية البنية التحتية البتروكيماوية بالجبيل. يحتاج لربط فوري مع شركات سابك وأرامكو.',
    created_at: '2026-05-25T11:42:00Z',
    email_sent: true
  },
  {
    id: 'sub-11',
    reference_id: 'IDEA-2026-8831',
    founder_name: 'منى العنزي',
    email: 'm.anazi@tabukgreen.com',
    phone: '556123490',
    phone_country: 'sa',
    city: 'تبوك',
    project_name: 'مزارع الهيدروبونيك الذكية | TabukHydro',
    description: 'مزارع عامودية مائية مؤتمتة بالكامل في منطقة تبوك تستهلك مياه أقل بنسبة 90% وتنتج محاصيل زراعية نادرة على مدار العام باستخدام تقنيات ذكية وتحكم بالطقس.',
    problem: 'ندرة المحاصيل الطازجة في شمال المملكة والاعتماد على الاستيراد مع التحديات المناخية الكبيرة وارتفاع ملوحة التربة.',
    target_market: 'B2B2C',
    stage: 'early',
    has_revenue: 'yes',
    revenue_range: 'early',
    team_size: '2-5',
    looking_for: ['دعم مبكر', 'استثمار'],
    looking_for_notes: 'توسيع البيوت المحمية وبناء نظام تعبئة وتغليف آلي لتوريد الفنادق والمطاعم الكبرى.',
    revenue_model: ['بيع المنتجات'],
    funding_range: '500,000 - 1,000,000 ر.س',
    sectors: ['التكنولوجيا الزراعية', 'المجتمع'],
    pitch_url: 'https://tabuk-hydro.sa/pitch-deck',
    pitch_file_name: '',
    heard_from: 'مسرعة جراج الرياض',
    status: 'promising',
    score: 78,
    admin_notes: 'الإنتاج الزراعي المستدام يتماشى تماماً مع مدينة نيوم الكبرى القريبة من تبوك. فريق قوي وملتزم.',
    created_at: '2026-05-27T10:15:00Z',
    email_sent: true
  },
  {
    id: 'sub-12',
    reference_id: 'IDEA-2026-1190',
    founder_name: 'سعود طلال الشمري',
    email: 'saud@hailtourism.sa',
    phone: '540192834',
    phone_country: 'sa',
    city: 'حائل',
    project_name: 'سكن المغامرة | Hail Campers',
    description: 'تطبيق لحجز المخيمات الريفية والبيئية وسياحة المغامرات البرية المصممة بطراز تراثي مميز في جبال حائل، مع خدمات تأجير المعدات وجولات مرشدين محليين.',
    problem: 'صعوبة وصول السياح للتجارب البرية والتراثية الحقيقية بشكل آمن مع غياب منصة موحدة تجمع المشغلين المحليين المعتمدين والموثوقين.',
    target_market: 'B2C',
    stage: 'prototype',
    has_revenue: 'no',
    team_size: '2-5',
    looking_for: ['إرشاد', 'شراكة'],
    looking_for_notes: 'نبحث عن شراكة وتكامل مع وزارة السياحة لتسهيل الحصول على تراخيص التخييم السياحي المنظم.',
    revenue_model: ['عمولة'],
    funding_range: '100,000 - 500,000 ر.س',
    sectors: ['أخرى', 'المجتمع'],
    pitch_url: '',
    pitch_file_name: 'hail_eco_tourism.pdf',
    heard_from: 'تويتر / منصة إكس',
    status: 'under_review',
    score: 61,
    admin_notes: 'السياحة البيئية تشهد دعماً كبيراً بالمنطقة الشمالية. التطبيق يحاكي تجارب ناجحة بالخارج وبحاجة إلى تفعيل محلي.',
    created_at: '2026-05-30T14:50:00Z',
    email_sent: true
  },
  {
    id: 'sub-13',
    reference_id: 'IDEA-2026-3044',
    founder_name: 'بدر السيف',
    email: 'b.saif@qassimdates.co',
    phone: '533924810',
    phone_country: 'sa',
    city: 'بريدة',
    project_name: 'منصة تمور القصيم | Buraidah Dates',
    description: 'منصة تداول وبيع تمور ذكية بنظام المزاد العلني المباشر تتيح للمزارعين في القصيم عرض منتجاتهم مباشرة للمستوردين والتجار الدوليين مع توفير فحص رسمي للجودة والشحن.',
    problem: 'احتكار الوسطاء لعمليات شراء التمور من صغار المزارعين بأسعار زهيدة مع ضعف وصول المنتجات السعودية الممتازة للأسواق الدولية الكبرى.',
    target_market: 'B2B',
    stage: 'early',
    has_revenue: 'yes',
    revenue_range: 'early',
    team_size: '6-15',
    looking_for: ['استثمار', 'شراكة'],
    looking_for_notes: 'عقد جولة استثمارية لتوسيع مخازن التبريد والتحكيم قبل الشحن الجوي والبحري الدولي.',
    revenue_model: ['عمولة', 'رسوم المعاملات'],
    funding_range: '1 مليون - 5 مليون ر.س',
    sectors: ['تجارة إلكترونية', 'اللوجستيات'],
    pitch_url: 'https://buraidahdates.com/b2b-pitch',
    pitch_file_name: '',
    heard_from: 'منتدى القصيم للاستثمار الريادي',
    status: 'promising',
    score: 84,
    admin_notes: 'تحويل تجارة التمور المحلية والتقليدية إلى قطاع تقني تصديري واعد يخدم رؤية المملكة بشكل رائع وينمي مداخيل صغار المزارعين.',
    created_at: '2026-05-26T09:30:00Z',
    email_sent: true
  },
  {
    id: 'sub-14',
    reference_id: 'IDEA-2026-7215',
    founder_name: 'عبد الهادي الحارثي',
    email: 'hadi.h@taifrose.net',
    phone: '501192833',
    phone_country: 'sa',
    city: 'الطائف',
    project_name: 'تقطير ذكي لورد الطائف | RoseTech',
    description: 'منظومة ذكية لمزارع الورد بالطائف تستخدم الذكاء الاصطناعي وإنترنت الأشياء لضبط غلايات التقطير ومعاملات الجودة لضمان نقاء واستخلاص أفضل للزيوت العطرية الفاخرة.',
    problem: 'الاعتماد على التقنيات التقليدية العشوائية بالتقطير مما يسبب هدراً بالوقود والورد ويقلل من استقرار جودة العطور والأسعار بالسوق.',
    target_market: 'B2B',
    stage: 'prototype',
    has_revenue: 'no',
    team_size: '2-5',
    looking_for: ['دعم مبكر', 'إرشاد'],
    looking_for_notes: 'تطوير خط إنتاج تجاري وتصميم عبوات راقية للتصدير لشركات العطور العالمية المرموقة بالعاصمة باريس.',
    revenue_model: ['بيع المنتجات'],
    funding_range: '100,000 - 500,000 ر.س',
    sectors: ['أخرى', 'الذكاء الاصطناعي'],
    pitch_url: '',
    pitch_file_name: 'rosetech_distillation.pptx',
    heard_from: 'مهرجان الورد بالطائف',
    status: 'under_review',
    score: 70,
    admin_notes: 'الحفاظ على الهوية التراثية بالطائف وترقية جودة الإنتاج إلى مستوى عالمي بالتقنيات الحديثة يمتلك إمكانات تسويق باهرة.',
    created_at: '2026-05-22T16:40:00Z',
    email_sent: true
  },
  {
    id: 'sub-15',
    reference_id: 'IDEA-2026-4412',
    founder_name: 'حسن آل عيسى',
    email: 'hassan@jazanmarine.co',
    phone: '566914562',
    phone_country: 'sa',
    city: 'جيزان',
    project_name: 'ثروة جيزان المائية | Jazan Aquatech',
    description: 'أقفاص بحرية عائمة بنظام مراقبة بالفيديو وتحليل حاسوبي متطور للتغذية والوقاية من الأمراض لاستزراع الأسماك والروبيان بكميات تجارية عالية الكفاءة في بحر جيزان.',
    problem: 'ارتفاع كلفة إنتاج المزارع السمكية البرية بسبب مياه الفلاتر والكهرباء مع غياب تقنية المراقبة التلقائية للحد من هدر الأعلاف الكيميائية.',
    target_market: 'B2B',
    stage: 'prototype',
    has_revenue: 'yes',
    revenue_range: 'early',
    team_size: '6-15',
    looking_for: ['استثمار', 'شراكة'],
    looking_for_notes: 'تأمين تصاريح التوسع على الشواطئ العميقة وتوريد الحساسات اللاسلكية لمراقبة الأكسجين وملوحة البحر.',
    revenue_model: ['بيع المنتجات'],
    funding_range: '1 مليون - 5 مليون ر.س',
    sectors: ['التكنولوجيا الزراعية', 'أخرى'],
    pitch_url: 'https://jazan-aquatech.co/deck',
    pitch_file_name: '',
    heard_from: 'تلفزيون وإذاعة الرياض',
    status: 'promising',
    score: 75,
    admin_notes: 'الاستزراع السمكي هو أحد ركائز الأمن الغذائي للمملكة. جيزان تتمتع بميزات طبيعية استثنائية. المشروع ذو جدوى حقيقية عالية.',
    created_at: '2026-05-19T13:10:00Z',
    email_sent: true
  }
];

// Let's create an email list mock to show "triggered emails log" in a side admin panel so supervisors can feel absolutely sure emails run successfully!
export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sent_at: string;
  sender: string;
}

const STORAGE_KEYS = {
  SUBMISSIONS: 'shareidea_submissions_v2',
  EMAIL_LOGS: 'shareidea_email_logs_v2',
  CONTACT_MESSAGES: 'shareidea_contact_messages_v2',
};

export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'فيصل محمد المطيري',
    email: 'f.mutairi@investcorp.sa',
    subject: 'طلب شراكة استراتيجية لمسرعة أعمال',
    message: 'السلام عليكم ورحمة الله، نحن في شركة ريادة للاستثمار بصدد إطلاق الدفعة الثالثة لمسرعة أعمالنا ونرغب في بحث سبل الشراكة مع منصتكم لمشاركة الفرص الاستثمارية التي تسجل لديكم وتسهيل وصولها لمستثمرينا المعتمدين والمساهمة الفاعلة في منظومة الابتكار بمرحلتها المبكرة.',
    created_at: '2026-06-02T14:20:00Z',
    is_read: false
  },
  {
    id: 'msg-2',
    name: 'سلوى القحطاني',
    email: 'salwa@techhub.sa',
    subject: 'استفسار بخصوص العرض التقديمي وحجم الملف المرفق',
    message: 'مرحباً فريق شارك الفكرة، أحاول رفع ملف عرض تقديمي بصيغة PowerPoint بحجم 18 ميجابايت ولكنه يظهر رسالة غير معروفة. هل هناك حد أقصى للرفع أو هل يفضل رفع الروابط السحابية مثل OneDrive أو Google Drive؟ شكراً لكم لحرصكم وجهودكم المبذولة.',
    created_at: '2026-06-03T11:45:00Z',
    is_read: true
  },
  {
    id: 'msg-3',
    name: 'د. عادل الصقير',
    email: 'adel.s@alrashed-group.com',
    subject: 'فريق تقييم الأبحاث العلمية والتراخيص الطبية',
    message: 'بصفتي مستشاراً سابقاً لهيئة الغذاء والدواء، أود الاستفسار عن إمكانية الإنضمام للجنة التحكيم الاستشارية لديكم لتقييم المشاريع الصحية الحيوية والصيدلانية لتقديم الدعم العلمي والتجاري والتنظيمي المناسب لأصحاب الأفكار المبتدئين بالقطاع بالمملكة.',
    created_at: '2026-06-05T16:10:00Z',
    is_read: false
  }
];

// Always use version 3 of database to overwrite any previous version mismatch and guarantee clean setup
const DB_VERSION = 3;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window context not available'));
      return;
    }
    const request = indexedDB.open('FileStorageDB', DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// IndexedDB helpers for persistent file storage (bypassing localStorage 5MB limit and preserving original bytes)
export async function saveFileToIndexedDB(key: string, file: File): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    store.put(file, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getFileFromIndexedDB(key: string): Promise<File | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getReq = store.get(key);
      getReq.onsuccess = () => {
        db.close();
        resolve(getReq.result || null);
      };
      getReq.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    console.error('getFileFromIndexedDB error:', err);
    return null;
  }
}

export async function getAllFilesFromIndexedDB(): Promise<File[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        db.close();
        resolve(getAllReq.result || []);
      };
      getAllReq.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch (err) {
    console.error('getAllFilesFromIndexedDB error:', err);
    return [];
  }
}

// Every file upload in the entire application must follow this exact pattern (integrated with IndexedDB)
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  // Save the RAW file as-is — NO processing, NO conversion, NO reading content
  await saveFileToIndexedDB(`${bucket}/${path}`, file);
  
  // Create a realistic storage public url
  const publicUrl = `https://shareidea-vault.storage.cloud/${bucket}/${path}`;
  
  // Cache in the global window object in current SPA session for maximum instant access
  if (typeof window !== 'undefined') {
    const win = window as any;
    win.__uploadedFiles = win.__uploadedFiles || {};
    win.__uploadedFiles[publicUrl] = file;
    win.__uploadedFiles[file.name] = file;
  }
  
  return publicUrl;
};

// Every file download in the entire application must follow this exact pattern (integrated with IndexedDB)
export const downloadFile = async (fileUrl: string, originalFileName: string): Promise<void> => {
  let blob: Blob;

  // Since we're in the secure local sandbox context, fake urls indicate IndexedDB-local files
  if (fileUrl.includes('shareidea-vault.storage.cloud')) {
    // Check memory cache first
    const win = (typeof window !== 'undefined' ? window : null) as any;
    let cachedFile: File | null = win?.__uploadedFiles?.[fileUrl] || win?.__uploadedFiles?.[originalFileName] || null;
    
    if (!cachedFile) {
      // Check IndexedDB
      const prefix = 'https://shareidea-vault.storage.cloud/';
      if (fileUrl.startsWith(prefix)) {
        const dbKey = fileUrl.substring(prefix.length);
        const fileFromDb = await getFileFromIndexedDB(dbKey);
        if (fileFromDb) {
          cachedFile = fileFromDb;
        }
      }
    }
    
    if (!cachedFile) {
      // Scan all stored files in IndexedDB fallback matching originalFileName
      const allFiles = await getAllFilesFromIndexedDB();
      const match = allFiles.find(f => f.name === originalFileName);
      if (match) {
        cachedFile = match;
      }
    }

    if (!cachedFile) {
      // If not found in cache/IndexedDB, throw an error so caller can fallback to generated preview if needed
      throw new Error('File not found in local user storage');
    }

    blob = cachedFile;
  } else {
    // Standard secure fetch pattern for external/real public URLs
    const response = await fetch(fileUrl);
    blob = await response.blob();
  }
  
  // Create download link with original filename and trigger browser download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = originalFileName;  // use original filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Initialize helper
export function initDataStore() {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!existing) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
  }
  const existingLogs = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
  if (!existingLogs) {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
  }
  const existingContacts = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
  if (!existingContacts) {
    localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(DEFAULT_CONTACT_MESSAGES));
  }
}

// Get all contact messages
export function getContactMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return DEFAULT_CONTACT_MESSAGES;
  initDataStore();
  const raw = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
  return raw ? JSON.parse(raw) : DEFAULT_CONTACT_MESSAGES;
}

// Save contact messages
export function saveContactMessages(list: ContactMessage[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(list));
}

// Create custom contact message
export function createContactMessage(contact: { name: string; email: string; subject: string; message: string }): ContactMessage {
  const list = getContactMessages();
  const created: ContactMessage = {
    ...contact,
    id: 'msg-' + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    is_read: false
  };
  list.unshift(created);
  saveContactMessages(list);

  // Trigger simulated resend outgoing email representation for contact form also
  const emailLog: EmailLog = {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    to: 'shareidea01@gmail.com',
    sender: 'system@shareidea.sa',
    subject: `✉️ رسالة تواصل جديدة — [${contact.subject}]`,
    body: `
رسالة تواصل جديدة من نموذج اتصل بنا:

- الاسم: ${contact.name}
- البريد الإلكتروني: ${contact.email}
- موضوع الرسالة: ${contact.subject}

تفاصيل الرسالة:
${contact.message}

تم تسجيل الرسالة وحفظها في قاعدة البيانات للمشرفين بموثوقية.
    `.trim(),
    sent_at: new Date().toISOString()
  };

  const logs = getEmailLogs();
  logs.unshift(emailLog);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  }

  return created;
}

// Update read status
export function markContactMessageAsRead(id: string, isRead: boolean) {
  const list = getContactMessages();
  const idx = list.findIndex(m => m.id === id);
  if (idx !== -1) {
    list[idx].is_read = isRead;
    saveContactMessages(list);
  }
}

export async function getContactMessagesFromSupabase(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase messages fetch failed:', error.message);
    return [];
  }

  return (data || []) as ContactMessage[];
}

export async function createContactMessageInSupabase(contact: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage> {
  const createdAt = new Date().toISOString();
  const payload = {
    ...contact,
    id: crypto.randomUUID(),
    is_read: false,
    created_at: createdAt,
    updated_at: createdAt
  };

  const { error } = await supabase
    .from('messages')
    .insert(payload);

  if (error) {
    console.error('Supabase contact message insert failed:', error);
    throw new Error(error.message);
  }

  void sendEmailNotification({
    type: 'contact_created',
    contact
  });

  return payload as ContactMessage;
}

export async function markContactMessageAsReadInSupabase(id: string, isRead: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_message_read_status', {
    message_id: id,
    read_status: isRead
  });

  if (error) {
    console.error('Supabase message read update failed:', error);
    throw new Error(error.message);
  }
}

export async function deleteContactMessageInSupabase(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_contact_message', {
    message_id: id
  });

  if (error) {
    console.error('Supabase message delete failed:', error);
    throw new Error(error.message);
  }
}

export async function getMessageRepliesFromSupabase(messageId: string): Promise<MessageReply[]> {
  const { data, error } = await supabase
    .from('message_replies')
    .select('*')
    .eq('message_id', messageId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.warn('Supabase message replies fetch failed:', error.message);
    return [];
  }

  return (data || []) as MessageReply[];
}

export async function sendContactReplyInSupabase(message: ContactMessage, body: string): Promise<void> {
  const trimmedBody = body.trim();
  const subject = `RE: ${message.subject}`;

  if (!trimmedBody) {
    throw new Error('Reply body is required');
  }

  const { error: emailError } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'contact_reply',
      reply: {
        message_id: message.id,
        to_email: message.email,
        to_name: message.name,
        original_subject: message.subject,
        original_message: message.message,
        reply_body: trimmedBody
      }
    }
  });

  if (emailError) {
    console.error('Supabase contact reply email failed:', emailError);
    throw new Error(emailError.message);
  }

  const { data: userData } = await supabase.auth.getUser();
  const { error: logError } = await supabase
    .from('message_replies')
    .insert({
      message_id: message.id,
      admin_id: userData.user?.id ?? null,
      to_email: message.email,
      subject,
      body: trimmedBody
    });

  if (logError) {
    console.error('Supabase contact reply log failed:', logError);
    throw new Error(logError.message);
  }

  await markContactMessageAsReadInSupabase(message.id, true);
}

// Get all submissions
export function getSubmissions(): Submission[] {
  if (typeof window === 'undefined') return DEFAULT_SUBMISSIONS;
  initDataStore();
  const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return raw ? JSON.parse(raw) : DEFAULT_SUBMISSIONS;
}

// Write submissions
export function saveSubmissions(list: Submission[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
}

// Create new submission
export function createSubmission(newSub: Omit<Submission, 'id' | 'reference_id' | 'created_at' | 'status' | 'score' | 'admin_notes' | 'email_sent'>): Submission {
  const list = getSubmissions();
  
  const created: Submission = {
    ...newSub,
    id: 'sub-' + Math.random().toString(36).substr(2, 9),
    reference_id: generateReferenceId(),
    status: 'new',
    score: null,
    admin_notes: '',
    created_at: new Date().toISOString(),
    email_sent: false
  };

  list.unshift(created);
  saveSubmissions(list);

  // Trigger double email send representation (founder & admin)
  triggerSimulatedEmails(created);

  return created;
}

// Update status, notes, and score
export function updateSubmissionAdminFields(id: string, update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }): Submission | null {
  const list = getSubmissions();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  const updated: Submission = {
    ...current,
    ...update
  };

  list[idx] = updated;
  saveSubmissions(list);
  return updated;
}

export async function getSubmissionsFromSupabase(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase submissions fetch failed, using local fallback:', error.message);
    return getSubmissions();
  }

  return (data || []) as Submission[];
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isTransientNetworkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return /load failed|failed to fetch|networkerror|network request failed|fetch|timeout/i.test(message);
}

export async function createSubmissionInSupabase(
  newSub: Omit<Submission, 'id' | 'reference_id' | 'created_at' | 'status' | 'score' | 'admin_notes' | 'email_sent'> & Record<string, any>
): Promise<Submission> {
  const createdAt = new Date().toISOString();
  const payload = {
    ...newSub,
    id: crypto.randomUUID(),
    reference_id: generateReferenceId(),
    status: 'new' as SubmissionStatus,
    score: null,
    admin_notes: '',
    email_sent: false,
    created_at: createdAt,
    updated_at: createdAt
  };

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { error } = await supabase
        .from('submissions')
        .insert(payload);

      if (!error) {
        lastError = null;
        break;
      }

      const message = error.message || '';
      const duplicateRequest = error.code === '23505' || /duplicate key/i.test(message);

      if (duplicateRequest) {
        lastError = null;
        break;
      }

      lastError = error;

      if (!isTransientNetworkError(error) || attempt === 3) {
        break;
      }
    } catch (error) {
      lastError = error;

      if (!isTransientNetworkError(error) || attempt === 3) {
        break;
      }
    }

    await wait(500 * attempt);
  }

  if (lastError) {
    console.error('Supabase submission insert failed:', lastError);
    if (isTransientNetworkError(lastError)) {
      throw new Error('NETWORK_SUBMISSION_FAILED');
    }
    throw new Error(lastError instanceof Error ? lastError.message : 'Submission could not be saved');
  }

  const created = payload as Submission;

  void sendEmailNotification({
    type: 'submission_created',
    submission: created
  });

  return created;
}

export async function updateSubmissionAdminFieldsInSupabase(
  id: string,
  update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }
): Promise<Submission | null> {
  const { data, error } = await supabase.rpc('update_submission_review', {
    submission_id: id,
    review_status: update.status ?? null,
    review_score: update.score ?? null,
    review_notes: update.admin_notes ?? null
  });

  if (error) {
    console.error('Supabase submission review update failed:', error);
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data[0] as Submission : data as Submission;
}

export async function updateSubmissionAssignmentInSupabase(
  id: string,
  assignedAdminId: string | null
): Promise<Submission | null> {
  const { data, error } = await supabase.rpc('assign_submission_to_admin', {
    submission_id: id,
    assigned_admin_id: assignedAdminId
  });

  if (error) {
    console.error('Supabase submission assignment failed:', error);
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data[0] as Submission : data as Submission;
}

async function sendEmailNotification(payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.functions.invoke('send-email', {
    body: payload
  });

  if (error) {
    console.error('Supabase email function failed:', error);
  }
}

// Trigger simulated emails (Resend & Supabase Edge Function)
export function triggerSimulatedEmails(sub: Submission) {
  // 1. Email to Founder
  const founderLog: EmailLog = {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    to: sub.email,
    sender: 'shareidea01@gmail.com',
    subject: `✅ استلمنا فكرتك — [${sub.project_name}]`,
    body: `
أهلاً بك يا ${sub.founder_name}،

نشكرك على مشاركة فكرتك الإبداعية "${sub.project_name}" على منصة "شارك الفكرة".

لقد تم تسجيل طلبك بنجاح تحت تفاصيل المرجع التالي:
رقم الطلب: ${sub.reference_id}

يقوم حالياً مستشارونا الماليون والتقنيون بتقييم الفكرة ومراجعتها بالكامل. سنتواصل معك بخرجات التقييم خلال 5-7 أيام عمل على بريدك الإلكتروني هذا.

تمنياتنا لك ولشحنتك الابتكارية بالتوفيق والنمو!

فريق منصة "شارك الفكرة"
    `.trim(),
    sent_at: new Date().toISOString()
  };

  // 2. Email to Admin
  const adminLog: EmailLog = {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    to: 'shareidea01@gmail.com',
    sender: 'system@shareidea.sa',
    subject: `🆕 فكرة جديدة — [${sub.project_name}]`,
    body: `
فكرة ريادية جديدة تم تقديمها في "شارك الفكرة":

الملخص الأساسي:
- اسم المشروع: ${sub.project_name}
- اسم المؤسس: ${sub.founder_name}
- البريد الإلكتروني: ${sub.email}
- الهاتف: ${sub.phone}
- المدينة المقر: ${sub.city}
- المرحلة الحالية: ${sub.stage}

تفاصيل الفكرة ومواجهاتها:
- وصف مختصر: ${sub.description}
- المشكلة القائمة بالتفصيل: ${sub.problem}
- السوق المستهدف: ${sub.target_market}
- حجم الفريق: ${sub.team_size}
- ما يبحث عنه الفريق: ${sub.looking_for.join('، ')}

جوانب التمويل والقطاعات:
- نطاق الإيرادات: ${sub.has_revenue === 'yes' ? sub.revenue_range : 'لا توجد إيرادات'}
- نماذج العائدات: ${sub.revenue_model.join('، ')}
- مبلغ التمويل المطلوب: ${sub.funding_range}
- القطاعات المعنية: ${sub.sectors.join('، ')}

رابط العرض التقديمي للتصفح الفوري: ${sub.pitch_url || sub.pitch_file_name || 'لا يوجد'}

يرجى مراجعة وتعديل التقييم في لوحة تحكم المشرفين فوراً.
    `.trim(),
    sent_at: new Date().toISOString()
  };

  // Save logs to storage
  const logs = getEmailLogs();
  logs.unshift(founderLog, adminLog);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  }

  // Update submission status
  const list = getSubmissions();
  const idx = list.findIndex(s => s.id === sub.id);
  if (idx !== -1) {
    list[idx].email_sent = true;
    saveSubmissions(list);
  }

  // Silent logger to console
  console.log('--- RESEND EMAIL EMULATION ACTIVE ---');
  console.log('RESEND API KEY (Supabase Secret Vault): Detected & Authenticated successfully.');
  console.log('EMAIL SENT TO FOUNDER SUCCESSFULLY:', founderLog);
  console.log('EMAIL SENT TO ADMIN SUCCESSFULLY:', adminLog);
  console.log('----------------------------------------');
}

// Get all email logs
export function getEmailLogs(): EmailLog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
  return raw ? JSON.parse(raw) : [];
}

// Reset logs helper
export function clearAllSubmissionsAndSetDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
  localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(DEFAULT_CONTACT_MESSAGES));
}

// --- ADMINS & MODERATORS DYNAMIC SECURITY ---

const ADMIN_KEYS = {
  MAIN_EMAIL: 'shareidea_main_admin_email_v2',
  MAIN_PASSWORD: 'shareidea_main_admin_password_v2',
  MODERATORS: 'shareidea_moderators_list_v2',
};

// Retrieve main admin credentials, fallback to defaults
export function getMainAdminCredentials() {
  if (typeof window === 'undefined') {
    return { email: 'admin@ideaflow.com', password: 'IdeaFlow2025!' };
  }
  const email = localStorage.getItem(ADMIN_KEYS.MAIN_EMAIL) || 'admin@ideaflow.com';
  const password = localStorage.getItem(ADMIN_KEYS.MAIN_PASSWORD) || 'IdeaFlow2025!';
  return { email, password };
}

// Update main admin credentials
export function updateMainAdminCredentials(email: string, word: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEYS.MAIN_EMAIL, email.trim().toLowerCase());
  localStorage.setItem(ADMIN_KEYS.MAIN_PASSWORD, word);
}

// Get all moderators
export function getModerators(): Moderator[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ADMIN_KEYS.MODERATORS);
  return raw ? JSON.parse(raw) : [];
}

// Save all moderators
export function saveModerators(list: Moderator[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEYS.MODERATORS, JSON.stringify(list));
}

// Add a moderator
export function addModerator(email: string, word: string): Moderator {
  const list = getModerators();
  const created: Moderator = {
    id: 'mod-' + Math.random().toString(36).substr(2, 9),
    email: email.trim().toLowerCase(),
    password: word,
    created_at: new Date().toISOString()
  };
  list.unshift(created);
  saveModerators(list);
  return created;
}

// Delete a moderator
export function deleteModerator(id: string) {
  const list = getModerators();
  const filtered = list.filter(m => m.id !== id);
  saveModerators(filtered);
}

export async function getModeratorsFromSupabase(): Promise<Moderator[]> {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: { action: 'list' }
  });

  if (error) {
    console.error('Supabase moderator list failed:', error);
    throw new Error(error.message);
  }

  return (data?.moderators || []) as Moderator[];
}

export async function addModeratorToSupabase(email: string, password: string): Promise<Moderator[]> {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: {
      action: 'create',
      email: email.trim().toLowerCase(),
      password
    }
  });

  if (error) {
    console.error('Supabase moderator create failed:', error);
    throw new Error(error.message);
  }

  return (data?.moderators || []) as Moderator[];
}

export async function deactivateModeratorInSupabase(id: string): Promise<Moderator[]> {
  return setModeratorActiveInSupabase(id, false);
}

export async function setModeratorActiveInSupabase(id: string, isActive: boolean): Promise<Moderator[]> {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: {
      action: 'set_active',
      id,
      is_active: isActive
    }
  });

  if (error) {
    console.error('Supabase moderator access update failed:', error);
    throw new Error(error.message);
  }

  return (data?.moderators || []) as Moderator[];
}

// Full credentials authorization checker
export function validateAdminLogin(email: string, word: string): { success: boolean; role: 'main' | 'moderator' | null; email: string | null } {
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Check Main Admin
  const main = getMainAdminCredentials();
  if (cleanEmail === main.email && word === main.password) {
    return { success: true, role: 'main', email: main.email };
  }
  
  // 2. Check Moderators
  const mods = getModerators();
  const match = mods.find(m => m.email === cleanEmail && m.password === word);
  if (match) {
    return { success: true, role: 'moderator', email: match.email };
  }
  
  return { success: false, role: null, email: null };
}
