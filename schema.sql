-- Schema Cloudflare D1 Database (SQLite) - Complete & Merged Version

CREATE TABLE IF NOT EXISTS _cf_KV (
  key TEXT PRIMARY KEY,
  value BLOB
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS autolinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  description TEXT,
  click_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  parent_id INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  config_json TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_markdown TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  read_time_minutes INTEGER DEFAULT 5,
  author_id INTEGER,
  co_author_ids TEXT,
  revisions TEXT,
  status TEXT DEFAULT 'draft',
  rejection_reason TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  post_type TEXT DEFAULT 'article',
  interactive_configurator TEXT,
  interactive_showcase TEXT,
  interactive_radar TEXT,
  interactive_quiz TEXT,
  interactive_timeline_slider TEXT,
  interactive_battle_card TEXT,
  interactive_quiz_router TEXT,
  interactive_habit_simulator TEXT,
  interactive_qa_column TEXT,
  interactive_event_listing TEXT,
  interactive_glossary_dictionary TEXT,
  disclaimer_type TEXT DEFAULT 'none',
  custom_disclaimer_text TEXT
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  last_attempt INTEGER,
  blocked_until INTEGER
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "name" TEXT,
  "role" TEXT CHECK(role IN ('admin', 'writer', 'editor')),
  "avatar" TEXT,
  "bio" TEXT,
  "created_at" TEXT,
  "password" TEXT,
  "title" TEXT,
  "social_instagram" TEXT,
  "social_linkedin" TEXT,
  "social_website" TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  image_url TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  qris_image_url TEXT,
  status TEXT DEFAULT 'available',
  created_at TEXT,
  updated_at TEXT,
  bank_info TEXT,
  payment_mode TEXT DEFAULT 'all',
  third_party_checkout_url TEXT
);

CREATE TABLE IF NOT EXISTS chat_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  customer_phone TEXT,
  department TEXT NOT NULL,
  assigned_operator_phone TEXT,
  initial_message TEXT,
  page_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_name TEXT,
  buyer_phone TEXT,
  buyer_notes TEXT,
  product_id INTEGER,
  product_title TEXT,
  product_slug TEXT,
  product_price REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surat_pembaca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kota TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  tahun_lahir INTEGER NOT NULL,
  phone TEXT NOT NULL,
  ip_address TEXT,
  judul TEXT NOT NULL,
  isi_surat TEXT NOT NULL,
  kategori TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iklan_baris (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kota TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  tahun_lahir INTEGER NOT NULL,
  phone TEXT NOT NULL,
  ip_address TEXT,
  kategori TEXT NOT NULL,
  keterangan_barang TEXT NOT NULL,
  harga TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'published' | 'rejected' | 'expired'
  rejection_reason TEXT,
  expires_at TEXT,
  image_url TEXT,
  is_admin_ad INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_autolinks_keyword ON autolinks(keyword);
CREATE INDEX IF NOT EXISTS idx_surat_pembaca_status ON surat_pembaca(status);
CREATE INDEX IF NOT EXISTS idx_iklan_baris_status ON iklan_baris(status);
CREATE INDEX IF NOT EXISTS idx_iklan_baris_kategori ON iklan_baris(kategori);
