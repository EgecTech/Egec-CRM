// scripts/seedSystemSettings.js
// Run this script to seed initial system settings
// Usage: node scripts/seedSystemSettings.js

const mongoose = require('mongoose');

// Load environment variables manually (no dotenv needed)
const fs = require('fs');
const path = require('path');

try {
  // Try .env.local first, then .env
  const envFiles = ['.env.local', '.env'];
  let envLoaded = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    console.log(`Looking for ${envFile} at:`, envPath);
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) return;
        
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      });
      console.log(`✅ Loaded ${envFile}`);
      envLoaded = true;
      break;
    }
  }
  
  if (!envLoaded) {
    console.error('❌ No .env or .env.local file found!');
    console.log('Please create .env.local with MONGODB_URI');
    process.exit(1);
  }
  
  console.log('✅ MONGODB_URI loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in env file!');
    process.exit(1);
  }
} catch (err) {
  console.error('Error loading env file:', err);
  process.exit(1);
}

const systemSettingsData = [
  {
    settingKey: 'sales_statuses',
    settingValue: ['prospect', 'suspect', 'lost', 'forcast', 'potential', 'NOD'],
    settingType: 'dropdown_options',
    description: 'Sales pipeline statuses (حالة المبيعات)',
    isActive: true
  },
  {
    settingKey: 'interest_rates',
    settingValue: ['Hot', 'Warm', 'Cold', 'Unknown'],
    settingType: 'dropdown_options',
    description: 'Customer interest levels',
    isActive: true
  },
  {
    settingKey: 'interest_percentages',
    settingValue: ['%10', '%20', '%30', '%40', '%50', '%60', '%70', '%80', '%90', '%100'],
    settingType: 'dropdown_options',
    description: 'Interest percentage levels (نسبة الاهتمام)',
    isActive: true
  },
  {
    settingKey: 'followup_types',
    settingValue: ['Call', 'WhatsApp', 'Meeting', 'Email', 'SMS', 'Note'],
    settingType: 'dropdown_options',
    description: 'Follow-up activity types',
    isActive: true
  },
  {
    settingKey: 'loss_reasons',
    settingValue: [
      'Price too high',
      'Chose competitor',
      'Not qualified',
      'Lost contact',
      'Changed mind',
      'Not interested anymore',
      'Found better option',
      'Financial issues',
      'Other'
    ],
    settingType: 'dropdown_options',
    description: 'Reasons for lost customers',
    isActive: true
  },
  {
    settingKey: 'sources',
    settingValue: [
      'ab-W EGY',
      'ab-C EGY',
      'CRM',
      'C EGY',
      'INS',
      'W EGY',
      'website',
      'SNAP',
      'C UAE',
      'Twitter',
      'W UAE',
      'Google UAE',
      'F-EGEC',
      'G-Instgram',
      'social Media Egec',
      'W site',
      'G-Master',
      'IG-PHD',
      'G-PHD',
      'CHAT GPT',
      'IG-Master',
      'Google',
      'G-MasterENG',
      'Google-Master',
      'G-MA-Calls',
      'G-google',
      'Google-PHD',
      'G-PHD-Calls',
      'G-BA',
      'Google-Jeddah',
      'X-Jeddah',
      'X-Master',
      'Twitter-Master',
      'LinkedIn-MA',
      'G-BA-Calls',
      'ma calls bacloria',
      'G-Calls',
      'ma calls phd',
      'Ig'
    ],
    settingType: 'dropdown_options',
    description: 'Lead sources (المصدر)',
    isActive: true
  },
  {
    settingKey: 'nationalities',
    settingValue: [
      'سعودي',
      'مصري',
      'اردني',
      'لبناني',
      'سوري',
      'عراقي',
      'يمني',
      'كويتي',
      'اماراتي',
      'قطري',
      'بحريني',
      'عماني',
      'فلسطيني',
      'سوداني',
      'مغربي',
      'جزائري',
      'تونسي',
      'ليبي',
      'تشادي',
      'صومالي',
      'نيجيري',
      'موريتاني',
      'باكستاني',
      'جنوب السودان',
      'مالي',
      'تركي',
      'هندي',
      'افغانستانى',
      'اريتري',
      'سنغالى',
      'جيبوتى',
      'امريكي',
      'بنجلاديش',
      'كندي',
      'بريطانى',
      'اثيوبى',
      'اندونيسي',
      'الماني',
      'روسي',
      'بوركينافاسو',
      'ايراني',
      'غاني',
      'اوغندي',
      'صيني',
      'فلبيني',
      'جزر القمر',
      'كاميروني',
      'بدون',
      'نرويجي',
      'نيبالى',
      'كردستان',
      'تايلاندى',
      'اوكراني',
      'غير معروف',
      'جنسيه اخري'
    ],
    settingType: 'dropdown_options',
    description: 'Customer nationalities',
    isActive: true
  },
  {
    settingKey: 'countries',
    settingValue: [
      'السعودية',
      'مصر',
      'الاردن',
      'لبنان',
      'سوريا',
      'العراق',
      'اليمن',
      'الكويت',
      'الإمارات',
      'قطر',
      'البحرين',
      'عمان',
      'فلسطين',
      'السودان',
      'المغرب',
      'الجزائر',
      'تونس',
      'ليبيا',
      'تشاد',
      'الصومال',
      'نيجيريا',
      'موريتانيا',
      'باكستان',
      'ج سودان',
      'تركيا',
      'الهند',
      'افغانستان',
      'اريتريا',
      'السنغال',
      'امريكا',
      'بنجلادش',
      'بريطانيا',
      'الكاميرون',
      'استراليا',
      'المانيا',
      'روسيا',
      'ايران',
      'غانا',
      'تنزانيا',
      'جزر المالديف',
      'ج افريقيا',
      'ساحل العاج',
      'النرويج',
      'النمسا',
      'بلجيكا',
      'أسبانيا',
      'ايرلندا',
      'بونسوانا',
      'السويد',
      'فنلندا',
      'دبي',
      'رومانيا',
      'كيتفوار',
      'أخري'
    ],
    settingType: 'dropdown_options',
    description: 'Customer countries',
    isActive: true
  },
  {
    settingKey: 'genders',
    settingValue: ['Male', 'Female', 'Other'],
    settingType: 'dropdown_options',
    description: 'Gender options',
    isActive: true
  },
  {
    settingKey: 'university_types',
    settingValue: ['حكومية', 'أهلية', 'خاصة'],
    settingType: 'dropdown_options',
    description: 'University types (نوع الجامعة)',
    isActive: true
  },
  {
    settingKey: 'study_times',
    settingValue: [
      'الان',
      'اسرع وقت ممكن',
      'الترم الحالي',
      'الترم القادم',
      'العام القادم'
    ],
    settingType: 'dropdown_options',
    description: 'Study time preferences (وقت الدراسة)',
    isActive: true
  },
  {
    settingKey: 'certificate_ratings',
    settingValue: ['Excellent', 'Very Good', 'Good', 'Acceptable', 'Pass'],
    settingType: 'dropdown_options',
    description: 'Certificate overall ratings',
    isActive: true
  },
  {
    settingKey: 'grades',
    settingValue: [
      '2.5',
      '%10',
      '%20',
      '%30',
      '%40',
      '%50',
      '%60',
      '%70',
      '%80',
      '%90',
      '%100'
    ],
    settingType: 'dropdown_options',
    description: 'Grade/GPA options',
    isActive: true
  },
  {
    settingKey: 'document_types',
    settingValue: [
      'Certificate',
      'Transcript',
      'ID Card',
      'Passport',
      'Photo',
      'Equivalency Certificate',
      'Language Certificate',
      'Other'
    ],
    settingType: 'dropdown_options',
    description: 'Document types for uploads',
    isActive: true
  },
  {
    settingKey: 'counselor_statuses',
    settingValue: [
      'متجاوب',
      'استفسار',
      'غ مهتم',
      'غ مطابق',
      'بعت ورق',
      'ج مكتب',
      'بيجهز الاوراق',
      'تحويل',
      'مهتم جدا',
      'ب واتساب',
      'س ببلد اخري',
      'س ببلده',
      'س بنفسه',
      'رقم خطأ',
      'س بالغلط',
      'لاحق',
      'جامعه غاليه',
      'تم اولي',
      'رسوم غاليه',
      'عام قادم',
      'لم يتخرج',
      'منحة',
      'غير رايه',
      'كنسل نهائى',
      'بلوك',
      'NO Reach',
      'س من قبل'
    ],
    settingType: 'dropdown_options',
    description: 'Counselor status options (حالة المرشد)',
    isActive: true
  },
  {
    settingKey: 'customer_statuses',
    settingValue: [
      'interest',
      'Un Qualified',
      'INprogres',
      'Open Deal',
      'Done Deal',
      'lost',
      'badtim',
      'BadTiming'
    ],
    settingType: 'dropdown_options',
    description: 'Customer status options (حالة العميل)',
    isActive: true
  },
  {
    settingKey: 'study_destinations',
    settingValue: [
      'مصر',
      'السعودية',
      'الإمارات',
      'الكويت',
      'قطر',
      'البحرين',
      'عمان',
      'الاردن',
      'لبنان',
      'سوريا',
      'العراق',
      'فلسطين',
      'السودان',
      'ليبيا',
      'تونس',
      'الجزائر',
      'المغرب',
      'موريتانيا',
      'الصومال',
      'جيبوتي',
      'جزر القمر',
      'تركيا',
      'ايران',
      'باكستان',
      'افغانستان',
      'الهند',
      'بنجلاديش',
      'ماليزيا',
      'اندونيسيا',
      'الصين',
      'اليابان',
      'كوريا الجنوبية',
      'تايلاند',
      'الفلبين',
      'امريكا',
      'كندا',
      'بريطانيا',
      'المانيا',
      'فرنسا',
      'ايطاليا',
      'اسبانيا',
      'هولندا',
      'بلجيكا',
      'السويد',
      'النرويج',
      'الدنمارك',
      'فنلندا',
      'بولندا',
      'روسيا',
      'استراليا',
      'نيوزيلندا'
    ],
    settingType: 'dropdown_options',
    description: 'Study destinations (الوجهة الدراسية)',
    isActive: true
  },
  // ========== NEW: DEGREE TYPE SETTINGS ==========
  {
    settingKey: 'degree_types',
    settingValue: ['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'],
    settingType: 'dropdown_options',
    description: 'Available degree types (أنواع الدرجات العلمية)',
    isActive: true
  },
  {
    settingKey: 'master_types',
    settingValue: ['ماجستير بحثي', 'ماجستير مهني', 'ماجستير مختلط'],
    settingType: 'dropdown_options',
    description: 'Types of Master programs (أنواع الماجستير)',
    isActive: true
  },
  {
    settingKey: 'study_methods',
    settingValue: ['حضوري', 'عن بعد', 'مختلط', 'تنفيذي'],
    settingType: 'dropdown_options',
    description: 'Study methods for graduate programs (طريقة الدراسة)',
    isActive: true
  },
  {
    settingKey: 'research_fields',
    settingValue: [
      'علوم إنسانية',
      'علوم طبيعية',
      'علوم اجتماعية',
      'هندسة',
      'طب',
      'صيدلة',
      'إدارة أعمال',
      'اقتصاد',
      'قانون',
      'تربية',
      'علوم حاسب',
      'تكنولوجيا المعلومات',
      'فنون',
      'إعلام',
      'زراعة',
      'علوم بيئية'
    ],
    settingType: 'dropdown_options',
    description: 'Research fields for PhD (مجالات البحث)',
    isActive: true
  },
  {
    settingKey: 'study_systems',
    settingValue: [
      'سنوي',
      'فصلي',
      'ساعات معتمدة',
      'نظام الوحدات',
      'نظام المقررات'
    ],
    settingType: 'dropdown_options',
    description: 'Study systems (نظام الدراسة)',
    isActive: true
  },
  {
    settingKey: 'academic_sectors',
    settingValue: [
      'القطاع الطبي',
      'القطاع الهندسي',
      'القطاع الإداري',
      'القطاع العلمي',
      'القطاع الأدبي',
      'القطاع الشرعي',
      'القطاع التقني',
      'القطاع الفني'
    ],
    settingType: 'dropdown_options',
    description: 'Academic sectors (القطاع الدراسي)',
    isActive: true
  }
];

async function seedSystemSettings() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({
      settingKey: { type: String, unique: true, required: true },
      settingValue: mongoose.Schema.Types.Mixed,
      settingType: String,
      description: String,
      isActive: Boolean
    }, { timestamps: true }));
    
    console.log('🔄 Seeding system settings...');
    
    for (const setting of systemSettingsData) {
      const existing = await SystemSetting.findOne({ settingKey: setting.settingKey });
      
      if (existing) {
        console.log(`⏭️  Skipping ${setting.settingKey} (already exists)`);
      } else {
        await SystemSetting.create(setting);
        console.log(`✅ Created ${setting.settingKey}`);
      }
    }
    
    console.log('\n✅ System settings seeded successfully!');
    console.log(`📊 Total settings: ${systemSettingsData.length}`);
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    process.exit(1);
  }
}

seedSystemSettings();
