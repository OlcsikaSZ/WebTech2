# Tech Nyilvántartó API (Webtech2)

## Indítás
1) `npm install`
2) `.env` létrehozása a `.env.example` alapján
3) MongoDB fusson lokálisan
4) `npm run dev`

## Végpontok
- POST `/api/auth/register` (opcionális, dev)
- POST `/api/auth/login`
- GET  `/api/tech` (auth)
- POST `/api/tech` (auth, duplikáció + validálás)
