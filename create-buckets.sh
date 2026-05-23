#!/bin/sh

echo "Czekam na start MinIO..."
# Czekamy aż admin (z .env) zadziała
until /usr/bin/mc alias set myminio http://minio:9000 "${S3_USER}" "${S3_PASSWORD}"; do
  echo "MinIO niedostępne... próba za 1s"
  sleep 1
done

echo "✅ MinIO połączone jako ADMIN. Rozpoczynam konfigurację..."

# 1. Tworzenie Bucketa
BUCKET_NAME="${S3_BUCKET_NAME:-warehouse}"
/usr/bin/mc mb --ignore-existing "myminio/${BUCKET_NAME}"
/usr/bin/mc anonymous set public "myminio/${BUCKET_NAME}"
echo "✅ Bucket '${BUCKET_NAME}' gotowy i publiczny."

# 2. Tworzenie usera
APP_USER="${S3_ACCESS_KEY:-app-user}"
APP_PASS="${S3_SECRET_KEY:-app-password-123}"

echo "Tworzenie użytkownika: $APP_USER"
/usr/bin/mc admin user add myminio "$APP_USER" "$APP_PASS"

# 3. Nadawanie uprawnień
/usr/bin/mc admin policy attach myminio readwrite --user "$APP_USER"

echo "✅ Użytkownik aplikacji utworzony!"
echo "✅ Gotowe! Wszystko skonfigurowane."
exit 0
