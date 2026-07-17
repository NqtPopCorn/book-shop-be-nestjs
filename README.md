# Book Shop Backend

Backend mới được migrate sang **NestJS + TypeScript + Prisma + PostgreSQL**.

## Chạy local

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`

Migration từ repository cũ sẽ được thực hiện theo từng module, giữ tương thích API và không sao chép secrets.
