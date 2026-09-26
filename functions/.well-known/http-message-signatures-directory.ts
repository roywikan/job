interface Env {
  [key: string]: any;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const origin = (context.env?.SITE_URL || new URL(context.request.url).origin).replace(/\/$/, '');

  const jwks = {
    "keys": [
      {
        "kty": "OKP",
        "crv": "Ed25519",
        "kid": "bot-key-ed25519-01",
        "use": "sig",
        "alg": "EdDSA",
        "x": "0OlAWjnTRonKtRjt8868NLvuJsc94uyqowcmGhPFp0U"
      },
      {
        "kty": "EC",
        "crv": "P-256",
        "kid": "bot-key-ecdsa-01",
        "use": "sig",
        "alg": "ES256",
        "x": "Qw6ZbS3hhwmKq2yVI3JGG6FWMO_3NwDMVDlpCR8Ccek",
        "y": "-Brfbz24cGlwl5CIGVVX42lXQtWy6IXkpvLopW-67JQ"
      },
      {
        "kty": "RSA",
        "kid": "bot-key-rsa-01",
        "use": "sig",
        "alg": "RS256",
        "n": "v-5IMb7XuAPGaEkGYg61bldgloBvqALykAXlvgX9lok0ZHFxQHm1PNndfxStlVxPuuzlIrX6_DkQXosqgmSCVfK6VFVyGoTSMjDze75p062UaNIyx-m8FpemWF9gHZ8PjCPYoYwjyV1gsZVcblilZRfihDXu1ubCiouvOv7HKJKXpXQQuQ73kvQpTVN3nwjVFD4CCs2fvPsBgUUk7EWsGGE4yTULy0xRu2Qj1oZNKcPzKw57NS1NUsvGkvTtjPjVvHj_6cPpwALmg8cJulN1qEluigkLVb55oM8gAeSYseDBX4I2lVFXbVTDB6w9Gfxu2a1uufbeqGhHyN8FsoBF-w",
        "e": "AQAB"
      }
    ]
  };

  const accept = context.request.headers.get('Accept') || '';
  const contentType = accept.includes('application/json') && !accept.includes('application/http-message-signatures-directory+json')
    ? 'application/json; charset=utf-8'
    : 'application/http-message-signatures-directory+json; charset=utf-8';

  return new Response(JSON.stringify(jwks, null, 2), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Signature-Agent': `<${origin}/.well-known/http-message-signatures-directory>`,
      'Link': `<${origin}/.well-known/http-message-signatures-directory>; rel="http-message-signatures-directory", </auth.md>; rel="describedby"; type="text/markdown"`
    },
  });
};
