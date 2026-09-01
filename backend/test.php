APP_NAME=DigitalMarketplace
APP_ENV=local
APP_KEY=base64:aiLQSdtGgKgtl7iG5MLHyXbTmY3eOwmNPeRuyJMgoNw=
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# ---------------------------------------------------------------------------
# Database (MySQL)
# ---------------------------------------------------------------------------
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=digital_store
DB_USERNAME=root
DB_PASSWORD=123456

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# ---------------------------------------------------------------------------
# Frontend / CORS / Sanctum
# ---------------------------------------------------------------------------
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_SECURE_COOKIE=false

# ---------------------------------------------------------------------------
# Default admin (used by DatabaseSeeder — change before deploying)
# ---------------------------------------------------------------------------
ADMIN_NAME="Super Admin"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345

# ---------------------------------------------------------------------------
# Crypto payments — Coinbase Commerce
# CRYPTO_PAYMENT_PROVIDER selects the CryptoPaymentServiceInterface binding.
# Get API key + webhook shared secret from https://beta.commerce.coinbase.com/settings/security
# ---------------------------------------------------------------------------
CRYPTO_PAYMENT_PROVIDER=coinbase_commerce
CRYPTO_API_KEY=b0601e82-afa5-4cea-a7cf-6be43b493813
CRYPTO_API_SECRET=tq7OQJqcri1c4NEOhte67reqihG6TBo2OOMSBF2qKi1eKawfVy45TIhSn6TjG/lyTnMvy+BlHiCgyxupdO02SA==
CRYPTO_WEBHOOK_SECRET=
CRYPTO_PAYMENT_EXPIRY_MINUTES=15

VITE_APP_NAME="${APP_NAME}"
