// client/generate-sitemap.mjs

import fs from 'fs';
import { globby } from 'globby';

// URL utama website Anda
const siteUrl = 'https://arteryproject.me';

async function generateSitemap() {
  console.log('Generating sitemap...');

  // 1. Dapatkan semua halaman dari folder `pages`
  const pages = await globby([
    'src/pages/**/*.js', // Ambil semua file .js di dalam src/pages
    '!src/pages/_*.js', // Abaikan file seperti _app.js dan _document.js
    '!src/pages/api', // Abaikan folder API
  ]);

  // 2. Format URL halaman statis
  const staticPageUrls = pages.map((page) => {
    const path = page
      .replace('src/pages', '')
      .replace('.js', '')
      .replace('/index', ''); // Hapus '/index' agar menjadi URL root
    
    // Untuk halaman utama, path akan menjadi string kosong.
    // Jika path-nya '/index', akan menjadi ''
    const route = path === '/index' ? '' : path;
    
    return `${siteUrl}${route}`;
  });

  // 3. (Opsional) Tambahkan halaman dinamis jika ada
  // Contoh: Ambil semua ID pin dari backend Anda
  // Anda perlu menyesuaikan URL API ini dengan URL backend Anda yang sebenarnya
  const dynamicPageUrls = [];
  try {
    const pinsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/pins?limit=1000`);
    if (pinsResponse.ok) {
        const pinsData = await pinsResponse.json();
        const pins = pinsData.data || [];
        pins.forEach(pin => {
            dynamicPageUrls.push(`${siteUrl}/pins/${pin.id}`);
        });
        console.log(`Found ${pins.length} dynamic pin pages.`);
    } else {
        console.warn('Could not fetch pins for sitemap, server responded with:', pinsResponse.status);
    }

    // Lakukan hal yang sama untuk profil pengguna
    // (Ini hanya contoh, API untuk mengambil semua user mungkin tidak ada)

  } catch (error) {
    console.warn('Could not fetch dynamic pages for sitemap:', error.message);
  }


  // Gabungkan semua URL
  const allUrls = [...staticPageUrls, ...dynamicPageUrls];
  const uniqueUrls = [...new Set(allUrls)]; // Pastikan tidak ada URL duplikat

  // 4. Buat konten XML untuk sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniqueUrls
    .map((url) => {
      return `
    <url>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `;
    })
    .join('')}
</urlset>`;

  // 5. Tulis file sitemap.xml ke folder public
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();