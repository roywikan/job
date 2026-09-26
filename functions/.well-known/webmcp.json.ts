interface Env {
  [key: string]: any;
}

export const onRequest: PagesFunction<Env> = async () => {
  const webmcpData = {
    "version": "1.0.0",
    "name": "In-Browser WebMCP Execution Manifest",
    "description": "Allows web-embedded or remote AI agents to execute in-browser tools and form submissions.",
    "enabled": true,
    "tools": [
      {
        "id": "search_articles_client",
        "name": "Client Article Search Engine",
        "description": "In-browser instant keyword search",
        "type": "client_script"
      },
      {
        "id": "surat_pembaca_form",
        "name": "Reader Letter Submission Handler",
        "description": "Client & API handler for guest reader submissions",
        "type": "api_proxy",
        "target": "/api/surat-pembaca"
      },
      {
        "id": "iklan_baris_form",
        "name": "Classified Ads Submission Handler",
        "description": "Client & API handler for classified ad submissions",
        "type": "api_proxy",
        "target": "/api/iklan-baris"
      }
    ]
  };

  return new Response(JSON.stringify(webmcpData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
