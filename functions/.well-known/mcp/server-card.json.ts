interface Env {
  DB?: any;
  SITE_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const requestUrl = new URL(context.request.url);
  const siteUrl = (env.SITE_URL || requestUrl.origin).replace(/\/$/, '');

  let siteName = requestUrl.hostname.replace('www.', '') || 'Content & Interaction Server';
  let siteDescription = 'Model Context Protocol (MCP) server providing context discovery, article retrieval, and interactive tools for AI agents.';

  if (env.DB) {
    try {
      const results = await env.DB.prepare(
        "SELECT key, value FROM configs WHERE key IN ('site_name', 'site_description', 'seo_meta_title', 'seo_meta_description')"
      ).all();
      const configMap: Record<string, string> = {};
      if (results && results.results) {
        for (const row of results.results) {
          try {
            configMap[row.key] = JSON.parse(row.value);
          } catch {
            configMap[row.key] = row.value;
          }
        }
      }
      siteName = configMap.site_name || configMap.seo_meta_title || siteName;
      siteDescription = configMap.site_description || configMap.seo_meta_description || siteDescription;
    } catch {
      // Fallback
    }
  }

  const serverCard = {
    "$schema": "https://modelcontextprotocol.io/schemas/server-card-v1.json",
    "serverInfo": {
      "name": `${siteName} MCP Server`,
      "version": "1.0.0",
      "description": siteDescription
    },
    "name": `${siteName} MCP Server`,
    "version": "1.0.0",
    "description": siteDescription,
    "endpoint": "/mcp",
    "transport": {
      "type": "streamable-http",
      "endpoint": "/mcp"
    },
    "transports": [
      {
        "type": "streamable-http",
        "endpoint": "/mcp"
      },
      {
        "type": "sse",
        "endpoint": "/api/mcp/sse"
      }
    ],
    "capabilities": {
      "tools": {
        "listChanged": true
      },
      "resources": {
        "subscribe": false,
        "listChanged": true
      },
      "prompts": {
        "listChanged": true
      }
    },
    "tools": [
      {
        "name": "query_posts",
        "description": "Search published articles, news, and posts by keyword or category",
        "inputSchema": {
          "type": "object",
          "properties": {
            "search": { "type": "string", "description": "Search keyword" },
            "category": { "type": "string", "description": "Category filter" },
            "limit": { "type": "number", "description": "Maximum number of results (default: 10)" }
          }
        }
      },
      {
        "name": "get_post",
        "description": "Retrieve full article content and metadata by slug identifier",
        "inputSchema": {
          "type": "object",
          "required": ["slug"],
          "properties": {
            "slug": { "type": "string", "description": "Article slug" }
          }
        }
      },
      {
        "name": "submit_surat_pembaca",
        "description": "Submit a guest reader letter or public opinion piece",
        "inputSchema": {
          "type": "object",
          "required": ["nama", "phone", "judul", "isi"],
          "properties": {
            "nama": { "type": "string", "description": "Sender full name" },
            "phone": { "type": "string", "description": "Sender phone number or WhatsApp" },
            "judul": { "type": "string", "description": "Headline or subject" },
            "isi": { "type": "string", "description": "Full letter text" }
          }
        }
      },
      {
        "name": "submit_iklan_baris",
        "description": "Post a classified ad listing",
        "inputSchema": {
          "type": "object",
          "required": ["nama", "phone", "kategori", "keteranganBarang", "harga"],
          "properties": {
            "nama": { "type": "string", "description": "Advertiser full name" },
            "phone": { "type": "string", "description": "Contact phone or WhatsApp" },
            "kategori": { "type": "string", "description": "Category" },
            "keteranganBarang": { "type": "string", "description": "Ad description" },
            "harga": { "type": "string", "description": "Price specification" }
          }
        }
      }
    ],
    "resources": [
      {
        "uri": `${siteUrl}/llms.txt`,
        "name": "Site Documentation Summary",
        "description": "Concise LLM-friendly documentation and content directory",
        "mimeType": "text/plain"
      },
      {
        "uri": `${siteUrl}/llms-full.txt`,
        "name": "Full Site Documentation",
        "description": "Exhaustive text documentation and full article corpus",
        "mimeType": "text/plain"
      },
      {
        "uri": `${siteUrl}/feed.xml`,
        "name": "RSS Feed",
        "description": "Latest published articles in RSS 2.0 format",
        "mimeType": "application/rss+xml"
      },
      {
        "uri": `${siteUrl}/sitemap.xml`,
        "name": "XML Sitemap",
        "description": "Complete site URL index for crawlers and bots",
        "mimeType": "application/xml"
      }
    ],
    "prompts": [
      {
        "name": "summarize_latest_posts",
        "description": "Summarize the latest published articles and updates from the site",
        "arguments": [
          {
            "name": "limit",
            "description": "Number of articles to include (default: 5)",
            "required": false
          }
        ]
      }
    ]
  };

  return new Response(JSON.stringify(serverCard, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Link': `</mcp>; rel="mcp-endpoint", </.well-known/mcp.json>; rel="alternate"`
    },
  });
};
