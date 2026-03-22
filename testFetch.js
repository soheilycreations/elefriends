const fs = require('fs');
const https = require('https');

const envFile = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
envFile.forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/['"]/g, '');
});

const url = new URL(env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1/destinations?select=*');
const options = {
    headers: {
        'apikey': env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
        'Authorization': 'Bearer ' + env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    }
};

https.get(url, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
}).on('error', err => console.error(err));
