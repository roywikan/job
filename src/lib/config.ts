import { SiteConfig } from '../types';
import { getAuthHeaders } from './auth';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  site_name: 'Job Web ID',
  site_tagline: 'Lowongan Kerja & Tips Karir',
  site_description: 'Portal lowongan kerja, tips karir, dan informasi pekerjaan untuk profesional Indonesia.',
  site_logo_url: '',
  site_logo_icon: 'Briefcase',
  site_favicon_url: '/favicon.ico',
  homepage_display_mode: 'default',

  header_nav_links: [
    { label: 'Lowongan', url: '/kategori/lowongan' },
    { label: 'Tips Karir', url: '/tips-karir' },
    { label: 'Negara', url: '/country' },
    { label: 'Indonesia', url: '/id' },
    { label: 'Sitemap', url: '/sitemap.xml' },
    { label: 'RSS Feed', url: '/feed.xml' }
  ],
  hamburger_nav_links: [
    { label: 'Beranda', url: '/' },
    { label: 'Lowongan', url: '/kategori/lowongan' },
    { label: 'Tips Karir', url: '/tips-karir' },
    { label: 'Negara', url: '/country' },
    { label: 'Indonesia', url: '/id' },
    { label: 'Sitemap XML', url: '/sitemap.xml' },
    { label: 'RSS Feed', url: '/feed.xml' }
  ],

  enable_search_bar: true,
  enable_theme_toggle: true,

  seo_meta_title: 'Job Web ID - Lowongan Kerja & Tips Karir',
  seo_meta_description: 'Temukan lowongan kerja, tips wawancara, dan panduan karir terbaru di Job Web ID.',
  seo_default_og_image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=15&w=400&auto=format&fit=crop',

  show_hero_section: true,
  hero_title: 'Temukan Peluang Karir Terbaik',
  hero_subtitle: 'Lowongan kerja, tips karir, dan panduan profesional untuk pasar kerja Indonesia dan luar negeri.',
  hero_cta_text: 'Jelajahi Lowongan',
  hero_cta_link: '#artikel-terbaru',
  hero_affiliate_widget_enable: false,
  hero_affiliate_widget_position: 'right',
  hero_affiliate_widget_code: `<!-- Widget affiliate (opsional) -->
<div id="tp-hero-search" style="text-align: center; padding: 10px; color: #fff;">
  <p style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">Cari peluang & bandingkan opsi</p>
</div>`,

  posts_per_page: 9,
  enable_featured_post: true,
  pagination_type: 'load_more',
  show_sidebar: true,
  popular_posts_count: 5,
  categories_widget_limit: 8,
  sidebar_banner_code: '',

  footer_about_text: 'Job Web ID menghadirkan lowongan kerja, tips karir, dan informasi pekerjaan yang relevan untuk profesional Indonesia.',
  footer_copyright_text: '© 2026 Job Web ID. Hak Cipta Dilindungi Undang-Undang.',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  social_twitter: 'https://x.com',

  footer_menu_links: [
    { label: 'Kebijakan Privasi', url: '/privacy' },
    { label: 'Tentang Kami', url: '/about' },
    { label: 'Hubungi Kami', url: '/contactus' },
    { label: 'Disclaimer', url: '/disclaimer' },
    { label: 'Sitemap XML', url: '/sitemap.xml' },
    { label: 'RSS Feed', url: '/feed.xml' }
  ],
  footer_category_links: [
    { label: 'Lowongan', url: '/kategori/lowongan' },
    { label: 'Tips Karir', url: '/tips-karir' },
    { label: 'Negara', url: '/country' },
    { label: 'Indonesia', url: '/id' }
  ],

  comment_engine_mode: 'both',
  admin_login_title: 'Portal Admin Job Web ID',
  admin_login_subtitle: 'Sistem Otentikasi Cloudflare D1',
  admin_login_btn_text: 'Masuk Portal CMS',
  admin_url_suffix: '9999',
  mobile_admin_btn_label: 'Portal Admin & Editor',
  mobile_show_logged_username: false,

  active_theme_preset: 'corp-blue',
  font_override_mode: 'system',
  site_domain: 'job.web.id',
  default_theme_mode: 'auto',
  font_density_scale: 'standard',
  font_size_scale: 'normal',
  age_accessibility_preset: '29-38',
  header_badge_text: 'Cloudflare D1 Edge Engine',
  show_header_badge: true,
  show_edge_badge: true,
  hero_badge_text: 'Portal Karir',
  autolink_ticker_label: 'Topik Trending:',
  footer_autolink_label: 'Tautan Populer',
  reference_heading_label: 'Referensi',
  footer_badge_1: 'Aman & Terpercaya',
  footer_badge_2: 'Diperbarui Rutin',
  footer_badge_3: 'Gratis Diakses',

  // 8 GUI Manageable Component Defaults
  enable_top_announcement: false,
  top_announcement_text: 'Gunakan pencarian & kategori untuk menemukan lowongan dan tips karir lebih cepat.',
  top_announcement_bg: 'bg-rose-600',
  top_announcement_text_color: 'text-white',
  enable_whatsapp_widget: true,
  whatsapp_number: '6281234567890',
  whatsapp_default_message: 'Halo, saya ingin bertanya seputar lowongan / karir di Job Web ID...',
  whatsapp_position: 'bottom-right',
  enable_custom_ad_slots: false,
  custom_ad_leaderboard_html: '',
  custom_ad_rectangle_html: '',
  custom_ad_slot_size: '728x90',
  enable_habit_simulator: false,
  habit_simulator_title: 'Simulasi Kebiasaan',
  habit_simulator_subtitle: 'Fitur interaktif (opsional)',
  enable_interactive_quiz: false,
  quiz_builder_title: 'Kuis Karir',
  enable_interactive_timeline: false,
  cusdis_app_id: '',
  cusdis_host: 'https://cusdis.com',

  // Performance Metric Box Defaults
  show_performance_box: true,
  show_tech_badges: true,
  tech_badge_hero: 'Cloudflare D1 Edge Architecture',
  tech_badge_pages: 'Cloudflare Pages Edge',
  tech_badge_database: 'Cloudflare D1 SQLite',
  tech_badge_storage: 'GitHub REST Storage',
  metric_1_show: true,
  metric_2_show: true,
  metric_3_show: true,
  metric1_show: true,
  metric2_show: true,
  metric3_show: true,
  metric1_value: '99+',
  metric1_label: 'Kecepatan',
  metric1_anim_type: 'fixed',
  metric1_start_val: 0,
  metric1_end_val: 99,
  metric1_duration: 2000,
  metric1_unit: '+',
  metric2_value: '100',
  metric2_label: 'Kualitas',
  metric2_anim_type: 'fixed',
  metric2_start_val: 0,
  metric2_end_val: 100,
  metric2_duration: 2000,
  metric2_unit: '',
  metric3_value: '0ms',
  metric3_label: 'Respon Delay',
  metric3_anim_type: 'fixed',
  metric3_start_val: 100,
  metric3_end_val: 0,
  metric3_duration: 2000,
  metric3_unit: 'ms',

  // Cloudflare Turnstile — isi lewat Admin Config / D1 (jangan hardcode production key di sini)
  turnstile_site_key: '',
  enable_comment_turnstile: true,
  enable_turnstile_fallback: true,

  // Strategic AdSense Placements
  enable_adsense: true,
  adsense_client_id: '',
  adsense_header_top: '',
  adsense_article_top: '',
  adsense_article_middle: '',
  adsense_article_bottom: '',
  adsense_sidebar: '',
  adsense_sticky_footer: '',

  // Custom JS/CSS Snippets (Head & Body)
  custom_snippet_head_enable: false,
  custom_snippet_head_code: `<!-- Sample Google Analytics (gtag.js) & Custom CSS Snippet -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SAMPLE12345"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SAMPLE12345');
</script>
<style>
  .custom-accent-border { border-left: 4px solid #e11d48; padding-left: 12px; }
</style>`,
  custom_snippet_body_enable: false,
  custom_snippet_body_code: `<!-- Sample Custom JS Snippet -->
<script>
  console.log('Job Web ID custom body script');
</script>`,

  // Custom HTML Meta Tag Snippet
  custom_meta_tags_enable: false,
  custom_meta_tags_code: `<!-- Google Search Console / verifikasi lain -->
<meta name="google-site-verification" content="GANTI_TOKEN_ANDA" />`,

  // Custom Responsive Banner Ads — default OFF
  ad_banner_first_half_enable: false,
  ad_banner_first_half_code: '',
  ad_banner_sticky_footer_enable: false,
  ad_banner_sticky_footer_code: '',
  ad_banner_article_start_enable: false,
  ad_banner_article_start_code: '',
  ad_banner_article_end_enable: false,
  ad_banner_article_end_code: '',

  // --- Frontpage models (default netral / karir) ---
  default_hero_badge: 'Portal Karir',
  default_hero_title: 'Temukan Peluang Karir Terbaik',
  default_hero_subtitle: 'Lowongan kerja, tips karir, dan panduan profesional untuk pasar kerja modern.',
  default_newsletter_title: 'Update Lowongan & Tips Karir',
  default_newsletter_subtitle: 'Dapatkan ringkasan peluang kerja dan tips karir secara berkala.',

  event_badge_text: 'Event Karir',
  event_title: 'Job Fair & Career Summit',
  event_subtitle: 'Forum karir dan lowongan untuk profesional Indonesia.',
  event_date_location: 'Jadwal menyusul',
  event_cta_text: 'Daftar / Info',
  event_whatsapp: '6281234567890',

  campaign_badge_text: 'Inisiatif Karir',
  campaign_title: 'Buka Akses Informasi Lowongan untuk Semua',
  campaign_subtitle: 'Mendukung pencari kerja dengan informasi lowongan dan tips karir yang mudah diakses.',
  campaign_target_amount: '0',
  campaign_current_amount: '0',
  campaign_donor_count: '0',
  campaign_cta_text: 'Pelajari Lebih Lanjut',
  campaign_whatsapp: '6281234567890',

  microsite_title: 'Job Web ID Hub',
  microsite_bio: 'Pusat lowongan, tips karir, dan tautan penting.',
  microsite_wa_number: '6281234567890',
  microsite_wa_label: 'Hubungi (WhatsApp)',
  microsite_telegram_url: 'https://t.me',
  microsite_ebook_url: '#',
  microsite_podcast_url: 'https://spotify.com',
  microsite_shop_url: '#',

  portfolio_badge_text: 'Rekam Jejak',
  portfolio_title: 'Konten & Program Karir',
  portfolio_subtitle: 'Kumpulan artikel, panduan, dan inisiatif seputar dunia kerja.',
  portfolio_stat1_val: '—',
  portfolio_stat1_lbl: 'Artikel',
  portfolio_stat2_val: '—',
  portfolio_stat2_lbl: 'Kategori',
  portfolio_stat3_val: '—',
  portfolio_stat3_lbl: 'Pembaca',
  portfolio_whatsapp: '6281234567890',

  doctor_badge_text: 'Pakar',
  doctor_name: 'Tim Editorial',
  doctor_title: 'Editor Karir & Lowongan',
  doctor_bio: 'Tim yang mengelola konten lowongan dan tips karir di Job Web ID.',
  doctor_experience_years: '',
  doctor_consultation_rate: '',
  doctor_whatsapp: '6281234567890',
  doctor_avatar_url: '',

  corporate_badge_text: 'Solusi Korporasi',
  corporate_title: 'Partner Informasi Karir untuk Organisasi',
  corporate_subtitle: 'Kolaborasi konten dan informasi lowongan untuk kebutuhan HR dan employer branding.',
  corporate_stat1_val: '—',
  corporate_stat1_lbl: 'Mitra',
  corporate_stat2_val: '—',
  corporate_stat2_lbl: 'Program',
  corporate_whatsapp: '6281234567890',
  corporate_email: 'hr@job.web.id',

  product_badge_text: 'Layanan',
  product_title: 'Paket Informasi & Promosi Lowongan',
  product_subtitle: 'Opsi publikasi dan penawaran terkait lowongan (atur lewat Admin).',
  product_price: '',
  product_original_price: '',
  product_discount_tag: '',
  product_whatsapp: '6281234567890',
  product_cta_text: 'Hubungi Kami',
  product_mgmt_heading: 'Panel Manajemen Produk / Layanan',
  product_mgmt_desc: 'Kelola penawaran, jasa, atau paket yang dipasarkan melalui katalog.',

  newspaper_name: 'JOB WEB ID',
  newspaper_edition: 'EDISI DIGITAL',
  newspaper_motto: 'Informasi lowongan & karir',
  newspaper_ads_phone: '',
  newspaper_rate_text: '',

  kb_badge_text: 'Pusat Panduan',
  kb_title: 'Panduan Karir & Lowongan',
  kb_subtitle: 'Tips wawancara, CV, dan informasi pasar kerja.',
  kb_search_placeholder: 'Cari (contoh: tips wawancara, CV, lowongan luar negeri)...',
  kb_helpdesk_whatsapp: '6281234567890',

  products_nav_label: 'Layanan',
  products_nav_path: '/produk',
  seller_bank_accounts: '',
  products_hero_badge: 'Katalog Layanan',
  products_hero_title: 'Layanan & Paket',
  products_hero_subtitle: 'Kelola penawaran melalui panel admin.',
  products_hero_btn_text: 'Tambah Item',
  products_hero_image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
  products_hero_image_caption: 'Katalog',
  products_empty_title: 'Belum Ada Item',
  products_empty_subtitle: 'Belum ada item di katalog. Tambahkan melalui panel admin.',
};

const STORAGE_KEY = 'job_site_config';

export async function loadSiteConfig(): Promise<SiteConfig> {
  const ssrConfig = typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__?.siteConfig : undefined;
  if (ssrConfig && typeof ssrConfig === 'object' && Object.keys(ssrConfig).length > 0) {
    const merged = { ...DEFAULT_SITE_CONFIG, ...ssrConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  const cached = localStorage.getItem(STORAGE_KEY);
  let currentConfig: SiteConfig = cached ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cached) } : DEFAULT_SITE_CONFIG;

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        currentConfig = { ...DEFAULT_SITE_CONFIG, ...data };
        if (!Array.isArray(currentConfig.header_nav_links) || currentConfig.header_nav_links.length === 0) {
          currentConfig.header_nav_links = DEFAULT_SITE_CONFIG.header_nav_links;
        }
        if (!Array.isArray(currentConfig.hamburger_nav_links) || currentConfig.hamburger_nav_links.length === 0) {
          currentConfig.hamburger_nav_links = DEFAULT_SITE_CONFIG.hamburger_nav_links;
        }
        if (!Array.isArray(currentConfig.footer_menu_links) || currentConfig.footer_menu_links.length === 0) {
          currentConfig.footer_menu_links = DEFAULT_SITE_CONFIG.footer_menu_links;
        }
        if (!Array.isArray(currentConfig.footer_category_links) || currentConfig.footer_category_links.length === 0) {
          currentConfig.footer_category_links = DEFAULT_SITE_CONFIG.footer_category_links;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote config, using cached/default config:', err);
  }
  return currentConfig;
}

export const getSiteConfig = loadSiteConfig;

export async function saveSiteConfig(config: SiteConfig): Promise<boolean> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch (err) {
    console.error('Error saving site config to API:', err);
    return false;
  }
}
