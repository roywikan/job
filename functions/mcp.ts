interface Env {
  DB?: any;
  SITE_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const siteUrl = (env.SITE_URL || requestUrl.origin).replace(/\/$/, '');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, mcp-session-id',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let siteName = requestUrl.hostname.replace('www.', '') || 'Content & Interaction Server';
  let siteDescription = 'Model Context Protocol (MCP) server providing context discovery, article retrieval, and interactive tools for AI agents.';

  if (env.DB) {
    try {
      const results = await env.DB.prepare(
        "SELECT key, value FROM configs WHERE key IN ('site_name', 'site_description', 'seo_meta_title', 'seo_meta_description')"
      ).all();
      if (results && results.results) {
        for (const row of results.results) {
          try {
            const parsed = JSON.parse(row.value);
            if (row.key === 'site_name' || row.key === 'seo_meta_title') siteName = parsed || siteName;
            if (row.key === 'site_description' || row.key === 'seo_meta_description') siteDescription = parsed || siteDescription;
          } catch {
            if (row.key === 'site_name' || row.key === 'seo_meta_title') siteName = row.value || siteName;
            if (row.key === 'site_description' || row.key === 'seo_meta_description') siteDescription = row.value || siteDescription;
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  const tools = [
    {
      name: 'query_posts',
      description: 'Search published articles, news, and posts by keyword or category',
      inputSchema: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Search keyword' },
          category: { type: 'string', description: 'Category filter' },
          limit: { type: 'number', description: 'Maximum number of results (default: 10)' }
        }
      }
    },
    {
      name: 'get_post',
      description: 'Retrieve full article content and metadata by slug identifier',
      inputSchema: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string', description: 'Article slug' }
        }
      }
    },
    {
      name: 'submit_surat_pembaca',
      description: 'Submit a guest reader letter or public opinion piece',
      inputSchema: {
        type: 'object',
        required: ['nama', 'phone', 'judul', 'isi'],
        properties: {
          nama: { type: 'string', description: 'Sender full name' },
          phone: { type: 'string', description: 'Sender phone number or WhatsApp' },
          judul: { type: 'string', description: 'Headline or subject' },
          isi: { type: 'string', description: 'Full letter text' }
        }
      }
    },
    {
      name: 'submit_iklan_baris',
      description: 'Post a classified ad listing',
      inputSchema: {
        type: 'object',
        required: ['nama', 'phone', 'kategori', 'keteranganBarang', 'harga'],
        properties: {
          nama: { type: 'string', description: 'Advertiser full name' },
          phone: { type: 'string', description: 'Contact phone or WhatsApp' },
          kategori: { type: 'string', description: 'Category' },
          keteranganBarang: { type: 'string', description: 'Ad description' },
          harga: { type: 'string', description: 'Price specification' }
        }
      }
    }
  ];

  const resources = [
    {
      uri: `${siteUrl}/llms.txt`,
      name: 'Site Documentation Summary',
      mimeType: 'text/plain'
    },
    {
      uri: `${siteUrl}/llms-full.txt`,
      name: 'Full Site Documentation',
      mimeType: 'text/plain'
    },
    {
      uri: `${siteUrl}/feed.xml`,
      name: 'RSS Feed',
      mimeType: 'application/rss+xml'
    },
    {
      uri: `${siteUrl}/sitemap.xml`,
      name: 'XML Sitemap',
      mimeType: 'application/xml'
    }
  ];

  const prompts = [
    {
      name: 'summarize_latest_posts',
      description: 'Summarize the latest published articles and updates from the site',
      arguments: [
        {
          name: 'limit',
          description: 'Number of articles to include (default: 5)',
          required: false
        }
      ]
    }
  ];

  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      protocol: 'mcp-streamable-http',
      serverInfo: {
        name: `${siteName} MCP Server`,
        version: '1.0.0',
        description: siteDescription
      },
      endpoint: `${siteUrl}/mcp`,
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: false, listChanged: true },
        prompts: { listChanged: true }
      },
      tools,
      resources,
      prompts
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        ...corsHeaders
      }
    });
  }

  if (request.method === 'POST') {
    try {
      const body: any = await request.json();
      const id = body.id !== undefined ? body.id : null;
      const method = body.method;

      if (!method) {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32600, message: 'Invalid Request: missing method' }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'initialize') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: `${siteName} MCP Server`,
              version: '1.0.0'
            },
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: false, listChanged: true },
              prompts: { listChanged: true }
            }
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'notifications/initialized') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id, result: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'ping') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id, result: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'tools/list') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { tools }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'resources/list') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { resources }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'prompts/list') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { prompts }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      if (method === 'tools/call') {
        const toolName = body.params?.name;
        const toolArgs = body.params?.arguments || {};

        if (toolName === 'query_posts') {
          let posts: any[] = [];
          if (env.DB) {
            try {
              let query = "SELECT id, title, slug, excerpt, category, created_at FROM posts WHERE status = 'published'";
              const params: any[] = [];
              if (toolArgs.search) {
                query += " AND (title LIKE ? OR excerpt LIKE ?)";
                params.push(`%${toolArgs.search}%`, `%${toolArgs.search}%`);
              }
              if (toolArgs.category) {
                query += " AND category = ?";
                params.push(toolArgs.category);
              }
              query += " ORDER BY id DESC LIMIT ?";
              params.push(Number(toolArgs.limit) || 10);

              const { results } = await env.DB.prepare(query).bind(...params).all();
              posts = results || [];
            } catch {
              posts = [];
            }
          }
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ count: posts.length, posts }, null, 2)
                }
              ]
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
          });
        }

        if (toolName === 'get_post') {
          let post: any = null;
          if (env.DB && toolArgs.slug) {
            try {
              const res = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?").bind(toolArgs.slug).first();
              post = res;
            } catch {
              post = null;
            }
          }
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: post ? JSON.stringify(post, null, 2) : `Article '${toolArgs.slug}' not found.`
                }
              ]
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
          });
        }

        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${toolName}` }
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not implemented: ${method}` }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
      });
    } catch {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
};
