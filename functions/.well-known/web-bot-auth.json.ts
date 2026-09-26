interface Env {
  [key: string]: any;
}

export const onRequest: PagesFunction<Env> = async () => {
  const botAuthData = {
    "version": "1.0.0",
    "auth_types_supported": ["bearer", "oauth2", "api_key"],
    "outbound_bots": [
      {
        "bot_id": "site-content-sync-bot",
        "name": "Site Content Indexer & Agent Sync Bot",
        "user_agent": "SitePublishingAgent/1.0",
        "ip_ranges": ["0.0.0.0/0"],
        "verification_method": "http-header-signature"
      }
    ],
    "verification_method": "dns-txt-and-http-signature",
    "policy_url": "/auth.md"
  };

  return new Response(JSON.stringify(botAuthData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
