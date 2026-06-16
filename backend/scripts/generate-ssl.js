const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const sslDir = path.join(__dirname, '..', 'ssl');
if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir, { recursive: true });

const keyPath = path.join(sslDir, 'server.key');
const certPath = path.join(sslDir, 'server.cert');

console.log('Generating SSL certificates...');

/* Try OpenSSL first */
try {
  execSync('openssl version', { stdio: 'pipe' });
  console.log('OpenSSL found, generating certificates...');
  execSync(
    `openssl req -x509 -nodes -days 365 -newkey rsa:2048 ` +
    `-keyout "${keyPath}" -out "${certPath}" ` +
    `-subj "/C=GH/ST=Accra/L=Accra/O=PaintMarket/CN=localhost" ` +
    `-addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
    { stdio: 'pipe', cwd: sslDir }
  );
  console.log('SSL certificates generated with OpenSSL');
  process.exit(0);
} catch {
  console.log('OpenSSL not available, using Node.js...');
}

/* Selfsigned fallback (v5 async API) */
(async () => {
  const { private: keyPem, cert: certPem } = await selfsigned.generate([
    { name: 'commonName', value: 'localhost' }
  ], {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      { name: 'subjectAltName', altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' }
      ]}
    ]
  });

  fs.writeFileSync(keyPath, keyPem);
  fs.writeFileSync(certPath, certPem);

  console.log('SSL certificates generated successfully');
  console.log(`  Key:  ${keyPath}`);
  console.log(`  Cert: ${certPath}`);
})().catch(err => {
  console.error('Failed to generate SSL certificates:', err.message);
  process.exit(1);
});
