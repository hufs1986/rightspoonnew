const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parse for .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  if (line && line.includes('=')) {
    const [key, ...rest] = line.split('=');
    envConfig[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, content, category, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log(`Total Articles in DB: ${data.length}`);
  console.log('-----------------------------------\n');

  data.forEach((article, index) => {
    // Remove HTML tags to count actual text length
    const plainText = article.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    const charCount = plainText.length;
    const wordCount = plainText.split(/\s+/).length;

    console.log(`[${index + 1}] ${article.title}`);
    console.log(`    카테고리: ${article.category}`);
    console.log(`    글자수: ${charCount}자 / 단어수: ${wordCount}개`);
    
    if (charCount < 500) {
      console.log(`    ⚠️ 상태: 길이 부족 (애드센스 통과 어려움)`);
    } else if (charCount < 1000) {
      console.log(`    ⚠️ 상태: 약간 부족 (좀 더 깊이 있는 내용 필요)`);
    } else {
      console.log(`    ✅ 상태: 통과 가능 (길이 양호)`);
    }
    
    console.log(`    미리보기: ${plainText.substring(0, 80).replace(/\n/g, ' ')}...`);
    console.log('\n-----------------------------------');
  });
}

checkContent();
