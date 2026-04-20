const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(`${url}/rest/v1/articles?select=title,youtube_id&order=created_at.desc&limit=5`, {
    headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
    }
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2)));
