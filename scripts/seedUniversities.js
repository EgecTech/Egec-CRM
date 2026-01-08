// scripts/seedUniversities.js
// Run this script to add all universities to the database

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const universities = [
  { name: "Universität Bonn", arabicName: "جامعه بون", country: "Germany" },
  { name: "Karlsruhe Institute of Technology (KIT)", arabicName: "(KIT) معهد كالسروه للتكنولوجيا", country: "Germany" },
  { name: "Fresenius University of Applied Sciences", arabicName: "جامعة فريزينيوس للعلوم التطبيقية", country: "Germany" },
  { name: "John von Neumann University", arabicName: "جامعة جون فون نيومان", country: "Hungary" },
  { name: "Free University of Berlin", arabicName: "برلين الحره", country: "Germany" },
  { name: "University of Pécs", arabicName: "جامعة بيتش", country: "Hungary" },
  { name: "Budapest Metropolitan University", arabicName: "جامعة بودابست متروبوليتان", country: "Hungary" },
  { name: "Eötvös Loránd University (ELTE)", arabicName: "(ELTE) جامعة إيلتي إيتفوش لوراند", country: "Hungary" },
  { name: "Budapest University of Economics and Business", arabicName: "جامعة بودابست للاقتصاد والأعمال", country: "Hungary" },
  { name: "Budapest University of Technology and Economics", arabicName: "جامعة بودابست للتكنولوجيا والاقتصاد", country: "Hungary" },
  { name: "University of Miskolc", arabicName: "جامعة ميسكولك", country: "Hungary" },
  { name: "University of Szeged", arabicName: "جامعة سيجد", country: "Hungary" },
  { name: "American University of Ras Al Khaimah", arabicName: "الجامعة الأمريكية في رأس الخيمة", country: "United Arab Emirates" },
  { name: "Private university of applied sciences", arabicName: "جامعة العلوم التطبيقية الخاصة", country: "Jordan" },
  { name: "National university of technology", arabicName: "الجامعية الوطنية للتكنولوجيا", country: "Jordan" },
  { name: "Near East University", arabicName: "جامعة الشرق الادنى", country: "Cyprus" },
  { name: "Philadelphia university", arabicName: "جامعة فيلادلفيا", country: "Jordan" },
  { name: "CYPRUS INTERNATIONAL UNIVERSITY", arabicName: "جامعة قبرص الدولية", country: "Cyprus" },
  { name: "Florida International University", arabicName: "جامعة فلوريدا الدولية", country: "Cyprus" },
  { name: "KYRENIA ÜNİVERSİTESİ", arabicName: "جامعة كيرينيا", country: "Cyprus" },
  { name: "Gadara university", arabicName: "جامعة جدارا", country: "Jordan" },
  { name: "American university of madaba", arabicName: "الجامعة الأمريكية في مادبا", country: "Jordan" },
  { name: "Aqaba university of medical sciences", arabicName: "جامعة العقبة للعلوم الطبية", country: "Jordan" },
  { name: "Ibn sina national", arabicName: "إبن سينا الأهلية", country: "Jordan" },
  { name: "Ibn sina university of medical sciences", arabicName: "جامعة ابن سينا للعلوم الطبية", country: "Jordan" },
  { name: "CIU University", arabicName: "جامعة CIU", country: "Cyprus" },
  { name: "Balqa applied university", arabicName: "جامعة البلقاء التطبيقية", country: "Jordan" },
  { name: "Al-zaytoonah university of jordan", arabicName: "جامعة الزيتونة الأردنية", country: "Jordan" },
  { name: "University of Kansas", arabicName: "جامعة كانساس", country: "Cyprus" },
  { name: "Tafila technical university", arabicName: "جامعة الطفيلة التقنية", country: "Jordan" },
  { name: "Strong aqaba university", arabicName: "جامعة العقبة للتكنولوجيا", country: "Jordan" },
  { name: "Jerash university", arabicName: "جامعة جرش", country: "Jordan" },
  { name: "Luminus technical university college", arabicName: "كلية لومينوس الجامعية التقنية", country: "Jordan" },
  { name: "International islamic sciences university", arabicName: "جامعة العلوم الإسلامية العالمية", country: "Jordan" },
  { name: "Al-hussein technical university", arabicName: "جامعة الحسين التقنية", country: "Jordan" },
  { name: "Arab open niuversity, jordan branch", arabicName: "الجامعة العربية المفتوحة فرع الأردن", country: "Jordan" },
  { name: "Al-isra university", arabicName: "جامعة الإسراء", country: "Jordan" },
  { name: "Zarqa university", arabicName: "جامعة الزرقاء", country: "Jordan" },
  { name: "Aqaba university college", arabicName: "جامعة عمان العربية", country: "Jordan" },
  { name: "Ajloun National university", arabicName: "جامعة عجلون الوطنية", country: "Jordan" },
  { name: "Aqaba university college", arabicName: "كلية العقبة الجامعية", country: "Jordan" },
  { name: "Prince hussein academy for civil brotection", arabicName: "أكاديمية الأمير حسين للحماية المدنية", country: "Jordan" },
  { name: "Al hussein bin talal university", arabicName: "جامعة الحسين بن طلال", country: "Jordan" },
  { name: "Motah university", arabicName: "جامعة مؤتة", country: "Jordan" },
  { name: "Jordanian german university", arabicName: "الجامعة الألمانية الأردنية", country: "Jordan" },
  { name: "Lrbid national university", arabicName: "جامعة اربد الأهلية", country: "Jordan" },
  { name: "princess sumaya university for technology", arabicName: "جامعة الأميرة سمية للتكنولوجيا", country: "Jordan" },
  { name: "Jordan university of science and technology", arabicName: "جامعة العلوم والتكنولوجيا الاردنيه", country: "Jordan" },
  { name: "Middle east university - MEU", arabicName: "جامعة الشرق الأوسط", country: "Jordan" },
  { name: "University of Petra", arabicName: "جامعة البترا", country: "Jordan" },
  { name: "Amman private university", arabicName: "جامعة عمان الاهلية", country: "Jordan" },
  { name: "Hashemite university", arabicName: "الجامعة الهاشمية", country: "Jordan" },
  { name: "Yarmouk university", arabicName: "جامعة اليرموك", country: "Jordan" },
  { name: "Al Bayt university", arabicName: "جامعة آل البيت", country: "Jordan" },
  { name: "University of jordan", arabicName: "الجامعة الأردنية", country: "Jordan" },
  { name: "RAK Medical & Health Sciences University", arabicName: "جامعة رأس الخيمة للطب والعلوم الصحية", country: "United Arab Emirates" },
  { name: "Technical University of Munich", arabicName: "الجامعة التقنية فى ميونخ", country: "Germany" },
  { name: "Macromedia University of Applied Sciences", arabicName: "جامعة ماكروميديا للعلوم التطبيقية", country: "Germany" },
  { name: "Constructor University", arabicName: "جامعة كونستراكتور", country: "Germany" },
  { name: "Arden University Berlin", arabicName: "جامعة اردن برلين", country: "Germany" },
  { name: "University of Hochschule Fresenius", arabicName: "جامعة فريسينيوس للعلوم التطبيقية", country: "Germany" },
  { name: "SRH Berlin University of Applied Sciences", arabicName: "جامعة اس ار اتش برلين للعلوم التطبيقية", country: "Germany" },
  { name: "Gisma Universityof Applied sciences", arabicName: "جامعة جيسما للعلوم التطبيقية", country: "Germany" },
  { name: "Ain Shams University", arabicName: "جامعة عين شمس", country: "Egypt" },
  { name: "Assiut University", arabicName: "جامعة أسيوط", country: "Egypt" },
  { name: "Minya University", arabicName: "جامعة المنيا", country: "Egypt" },
  { name: "Helwan University", arabicName: "جامعة حلوان", country: "Egypt" },
  { name: "Zagazig University", arabicName: "جامعة الزقازيق", country: "Egypt" },
  { name: "Tanta University", arabicName: "جامعة طنطا", country: "Egypt" },
  { name: "Cairo University", arabicName: "جامعة القاهرة", country: "Egypt" },
  { name: "Tanta Al-Ahly", arabicName: "طنطا الأهليه", country: "Egypt" },
  { name: "Sadat City Private University", arabicName: "جامعة مدينة السادات الأهلية", country: "Egypt" },
  { name: "Damietta National", arabicName: "دمياط الأهلية", country: "Egypt" },
  { name: "Luxor National", arabicName: "الأقصر الأهلية", country: "Egypt" },
  { name: "Suez Private University", arabicName: "جامعة السويس الأهلية", country: "Egypt" },
  { name: "Damanhour National University", arabicName: "دمنهور الأهلية", country: "Egypt" },
  { name: "Fayoum National", arabicName: "الفيوم الأهلية", country: "Egypt" },
  { name: "Sohag National", arabicName: "سوهاج الأهلية", country: "Egypt" },
  { name: "New Valley Private School", arabicName: "الوادى الجديد الأهلية", country: "Egypt" },
  { name: "Kafr El Sheikh National", arabicName: "كفر الشيخ الأهلية", country: "Egypt" },
  { name: "Ain Shams Private University", arabicName: "جامعة عين شمس الأهلية", country: "Egypt" },
  { name: "Cairo national University", arabicName: "جامعة القاهرة الأهلية", country: "Egypt" },
  { name: "British University in Egypt", arabicName: "الجامعة البريطانية في مصر", country: "Egypt" },
  { name: "New Salhiya University", arabicName: "جامعة الصالحية الجديدة", country: "Egypt" },
  { name: "Draya University", arabicName: "جامعة دراية", country: "Egypt" },
  { name: "University of Peace in Egypt", arabicName: "جامعة السلام في مصر", country: "Egypt" },
  { name: "Nile Valley University", arabicName: "جامعة وادي النيل", country: "Egypt" },
  { name: "ALHAYAH University", arabicName: "جامعة الحياة", country: "Egypt" },
  { name: "City University of Cairo", arabicName: "جامعة المدينة بالقاهرة", country: "Egypt" },
  { name: "Innovation University", arabicName: "جامعة الإبتكار", country: "Egypt" },
  { name: "May University in Cairo", arabicName: "جامعة مايو بالقاهرة", country: "Egypt" },
  { name: "Merit University", arabicName: "جامعة ميريت", country: "Egypt" },
  { name: "Badr University in Assiut", arabicName: "جامعة بدر بأسيوط", country: "Egypt" },
  { name: "Sphinx University", arabicName: "جامعة سفنكس", country: "Egypt" },
  { name: "Future University in Egypt", arabicName: "جامعة المستقبل بمصر", country: "Egypt" },
  { name: "Lotus University in Minya", arabicName: "جامعة لوتس بالمنيا", country: "Egypt" },
  { name: "Misr International University", arabicName: "جامعة مصرالدولية", country: "Egypt" },
  { name: "Delta University of Science and Technology", arabicName: "جامعة الدلتا للعلوم و التكنولوجيا", country: "Egypt" },
  { name: "Horus University - Egypt", arabicName: "جامعة حورس - مصر", country: "Egypt" },
  { name: "Sinai University", arabicName: "جامعة سيناء", country: "Egypt" },
  { name: "Egypt University of Science and Technology", arabicName: "جامعة مصر للعلوم والتكنولوجيا", country: "Egypt" },
  { name: "Heliopolis University", arabicName: "جامعة هليوبوليس", country: "Egypt" },
  { name: "Al Ryada University for Science and Technology", arabicName: "جامعة الريادة للعلوم والتكنولوجيا", country: "Egypt" },
  { name: "October University for Modern Sciences and Arts", arabicName: "جامعة أكتوبر للعلوم الحديثة والآداب", country: "Egypt" },
  { name: "Egypt University of Informatics", arabicName: "جامعة مصر للمعلوماتية", country: "Egypt" },
  { name: "Egyptian-Russian University", arabicName: "الجامعة المصرية الروسية", country: "Egypt" },
  { name: "Nahda University", arabicName: "جامعة النهضة", country: "Egypt" },
  { name: "Badr University in Cairo", arabicName: "جامعة بدر بالقاهرة", country: "Egypt" },
  { name: "Egyptian Chinese University", arabicName: "الجامعة المصرية الصينية", country: "Egypt" },
  { name: "Pharos University", arabicName: "جامعة فاروس", country: "Egypt" },
  { name: "Badia University", arabicName: "جامعة باديا", country: "Egypt" },
  { name: "Al-Ahram Canadian University", arabicName: "جامعة الأهرام الكندية", country: "Egypt" },
  { name: "South Valley National University", arabicName: "جامعة جنوب الوادي الأهلية", country: "Egypt" },
  { name: "Alexandria National University", arabicName: "جامعة الإسكندرية الأهلية", country: "Egypt" },
  { name: "Minya National University", arabicName: "جامعة المنيا الأهلية", country: "Egypt" },
  { name: "Zagazig Private University", arabicName: "جامعة الزقازيق الأهلية", country: "Egypt" },
  { name: "Mansoura Private University", arabicName: "جامعة المنصورة الأهلية", country: "Egypt" },
  { name: "Assiut Private University", arabicName: "جامعة اسيوط الأهلية", country: "Egypt" },
  { name: "Benha Private University", arabicName: "جامعة بنها الأهلية", country: "Egypt" },
  { name: "Egyptian National E-Learning University", arabicName: "الجامعة المصرية للتعليم الإلكتروني الأهلية", country: "Egypt" },
  { name: "French University in Egypt", arabicName: "الجامعة الفرنسية بمصر", country: "Egypt" },
  { name: "Nile University", arabicName: "جامعة النيل", country: "Egypt" },
  { name: "Menoufia Private University", arabicName: "جامعة المنوفية الأهلية", country: "Egypt" },
  { name: "Helwan national University", arabicName: "جامعة حلوان الأهلية", country: "Egypt" },
  { name: "New Ismailia University - Egypt", arabicName: "الإسماعيلية الجديدة - مصر", country: "Egypt" },
  { name: "New Mansoura University", arabicName: "جامعة المنصورة الجديدة", country: "Egypt" },
  { name: "Alamein International University", arabicName: "جامعه العلمين الدولية", country: "Egypt" },
  { name: "King Salman International University", arabicName: "الملك سليمان الدوليه", country: "Egypt" },
  { name: "Al-Jalala University", arabicName: "الجلالة", country: "Egypt" },
  { name: "New Giza University", arabicName: "جامعة الجيزة الجديدة", country: "Egypt" },
  { name: "Modern University for Information Technology", arabicName: "الجامعة الحديثة لتكنولوجيا المعلومات", country: "Egypt" },
  { name: "German University in Cairo", arabicName: "الجامعة الألمانية بالقاهرة", country: "Egypt" },
  { name: "6th of October University", arabicName: "جامعة 6 أكتوبر", country: "Egypt" },
  { name: "Luxor University", arabicName: "جامعة الأقصر", country: "Egypt" },
  { name: "Sohag University", arabicName: "جامعة سوهاج", country: "Egypt" },
  { name: "Suez Canal University", arabicName: "جامعة قناة السويس", country: "Egypt" },
  { name: "Suez University", arabicName: "جامعة السويس", country: "Egypt" },
  { name: "South Valley University", arabicName: "جامعة جنوب الوادى", country: "Egypt" },
  { name: "Benha University", arabicName: "جامعة بنها", country: "Egypt" },
  { name: "Alexandria University", arabicName: "جامعة الإسكندرية", country: "Egypt" },
  { name: "Mansoura University", arabicName: "جامعة المنصورة", country: "Egypt" },
  { name: "Aswan University", arabicName: "جامعه اسوان", country: "Egypt" },
  { name: "Menoufia University", arabicName: "جامعة المنوفية", country: "Egypt" },
  { name: "Beni Suef University", arabicName: "جامعه بنى سويف", country: "Egypt" },
  { name: "Fayoum University", arabicName: "جامعة الفيوم", country: "Egypt" },
  { name: "Kafrelsheikh University", arabicName: "جامعة كفر الشيخ", country: "Egypt" },
  { name: "New Valley University", arabicName: "جامعة الوادى الجديد", country: "Egypt" },
  { name: "Port Said University", arabicName: "جامعة بورسعيد", country: "Egypt" },
  { name: "Arish University", arabicName: "جامعة العريش", country: "Egypt" },
  { name: "University of sadat city", arabicName: "جامعة مدينة السادات", country: "Egypt" },
  { name: "Damietta University", arabicName: "جامعة دمياط", country: "Egypt" },
  { name: "Damanhour University", arabicName: "جامعة دمنهور", country: "Egypt" }
];

async function seedUniversities() {
  console.log('🔗 Connecting to MongoDB...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const universitiesCollection = db.collection('universities');
    
    console.log(`📊 Processing ${universities.length} universities...\n`);
    
    // Get unique countries
    const countries = [...new Set(universities.map(u => u.country))].sort();
    console.log('🌍 Countries found:', countries.join(', '), '\n');
    
    // Count by country
    const countByCountry = {};
    universities.forEach(u => {
      countByCountry[u.country] = (countByCountry[u.country] || 0) + 1;
    });
    
    console.log('📈 Universities per country:');
    Object.entries(countByCountry).forEach(([country, count]) => {
      console.log(`   ${country}: ${count} universities`);
    });
    console.log();
    
    // Clear existing universities
    console.log('🗑️  Clearing existing universities...');
    const deleteResult = await universitiesCollection.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing records\n`);
    
    // Insert new universities
    console.log('💾 Inserting new universities...');
    const insertResult = await universitiesCollection.insertMany(
      universities.map(u => ({
        ...u,
        colleges: [], // Empty colleges array, can be populated later
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    console.log(`✅ Inserted ${insertResult.insertedCount} universities\n`);
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await universitiesCollection.createIndex({ country: 1 });
    await universitiesCollection.createIndex({ name: 1 });
    await universitiesCollection.createIndex({ arabicName: 1 });
    await universitiesCollection.createIndex({ 
      name: 'text', 
      arabicName: 'text' 
    });
    console.log('✅ Indexes created\n');
    
    // Verify data
    console.log('🔍 Verifying data...');
    const totalCount = await universitiesCollection.countDocuments();
    console.log(`   Total universities in database: ${totalCount}\n`);
    
    // Sample universities from each country
    console.log('📚 Sample universities:');
    for (const country of countries) {
      const sample = await universitiesCollection
        .find({ country })
        .limit(2)
        .toArray();
      
      console.log(`\n   ${country}:`);
      sample.forEach(u => {
        console.log(`   - ${u.name} (${u.arabicName})`);
      });
    }
    
    console.log('\n✅ Universities seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Total Universities: ${totalCount}`);
    console.log(`   Countries: ${countries.length}`);
    console.log(`   Countries List: ${countries.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

// Run
seedUniversities();
