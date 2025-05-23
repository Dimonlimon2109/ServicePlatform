#!/bin/sh

echo "Содержимое /app/dist:"
ls -R /app/dist

echo "Содержимое /app/dist:"
ls -la /app/dist

npx prisma migrate deploy
npx prisma db seed
exec node dist/src/main.js
