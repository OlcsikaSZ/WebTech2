# Tech nyilvántartó rendszer

Ez egy Angular, Node.js és MongoDB alapú webalkalmazás, amely technikai eszközök / termékek nyilvántartására szolgál.  
A rendszer tartalmaz bejelentkezést, listázást, új elem hozzáadását és adatellenőrzést.

## Használt technológiák

- Angular
- Angular Material
- Node.js
- Express
- MongoDB
- Mongoose
- JWT autentikáció

## Funkciók

- Bejelentkezés névvel és jelszóval
- Termékek / eszközök listázása
- Új termék hozzáadása
- Adatellenőrzés hibás input ellen
- Védett oldalak autentikációval

## Jelenlegi állapot

A projekt jelenleg fejlesztés alatt áll.

### Már elkészült:

- backend API alapstruktúra
- felhasználókezelés és bejelentkezés
- JWT alapú védelem
- technikai elemek listázása
- új elem hozzáadása
- Angular frontend alap oldalak
- űrlapok és validáció

### Fejlesztés / finomítás alatt:

- megjelenés további csiszolása
- hibakezelések bővítése
- végső UI javítások
- opcionális szerkesztés/törlés funkciók

## Indítás

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd tech-nyilvantarto-frontend
npm install
npm start
```

### Szükséges

- Node.js
- MongoDB

## .env példa

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tech_nyilvantarto
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=2h
```
