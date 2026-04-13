# Tech nyilvántartó rendszer

Egy teljes stack webalkalmazás technikai eszközök és termékek nyilvántartására, rendelésére és felhasználókezelésére.  
A projekt Angular frontenddel, Node.js + Express backenddel és MongoDB adatbázissal készült.

A rendszer célja egy olyan modern, átlátható és biztonságos alkalmazás megvalósítása, amelyben a felhasználók regisztrálhatnak, bejelentkezhetnek, böngészhetik a termékeket, rendelést adhatnak le, az adminisztrátor pedig kezelheti a készletet és a felhasználói jogosultságokat.

---

## A projekt célja

A beadandó feladat célja egy nyilvántartó rendszer elkészítése volt, amely:

- rendelkezik bejelentkezési és regisztrációs felülettel,
- kezeli a felhasználói jogosultságokat,
- lehetővé teszi a nyilvántartott elemek listázását,
- biztosítja új elemek hozzáadását adminisztrátori jogosultsággal,
- ellenőrzi a bevitt adatokat,
- modern, igényes és reszponzív felhasználói felületet biztosít.

A megvalósítás során a félév során tanult technológiák kerültek felhasználásra, különös hangsúllyal az Angular, Node.js és MongoDB együttműködésére.

---

## Használt technológiák

### Frontend
- Angular 21
- Angular Router
- Angular Forms / Reactive szemléletű űrlapkezelés
- Angular Material
- SCSS

### Backend
- Node.js
- Express
- Mongoose
- JWT autentikáció
- bcrypt jelszóhashelés
- express-validator szerveroldali validáció
- CORS
- dotenv

### Adatbázis
- MongoDB

---

## Fő funkciók

### 1. Felhasználókezelés
- Regisztráció felhasználónévvel és jelszóval
- Bejelentkezés JWT token alapú hitelesítéssel
- Saját profiladatok lekérdezése
- Szerepkör alapú jogosultságkezelés (`admin`, `buyer`)

### 2. Jogosultsági rendszer
- **Buyer** felhasználó:
  - bejelentkezés
  - termékek megtekintése
  - rendelés leadása
  - saját rendelések megtekintése
- **Admin** felhasználó:
  - minden buyer jogosultsága
  - termékek kezelése
  - új technikai termék hozzáadása
  - felhasználók listázása
  - felhasználói szerepkör módosítása
  - felhasználó törlése
  - rendelések teljes listájának megtekintése

### 3. Terméknyilvántartás
- Technikai eszközök / termékek listázása
- Termékadatok részletes tárolása, például:
  - név
  - kategória
  - SKU
  - bruttó és nettó ár
  - ÁFA
  - készletmennyiség
  - márka
  - szín
  - leírás
  - helyszín
  - állapot
  - státusz
  - garancia
  - újrarendelési szint
  - kép URL
- Duplikált SKU tiltása
- Készletinformációk kezelése

### 4. Rendelési folyamat
- Kosár / rendelési nézet
- Szállítási és fizetési adatok megadása
- Rendelés létrehozása
- Automatikus rendelési azonosító generálása
- Készletellenőrzés rendelés előtt
- Készlet csökkentése rendelés leadásakor
- Saját rendelési előzmények megtekintése
- Admin felhasználó számára az összes rendelés megtekintése

### 5. Validáció és hibakezelés
A rendszer kliens- és szerveroldalon is végez ellenőrzéseket, például:

- kötelező mezők ellenőrzése,
- minimális karakterszám figyelése,
- számmezők validálása,
- email cím ellenőrzése,
- telefonszám formátum ellenőrzése,
- SKU egyediség vizsgálata,
- ÁFA érték tartományának ellenőrzése,
- nettó és bruttó ár logikai ellenőrzése,
- készletellenőrzés rendeléskor,
- jogosulatlan hozzáférések tiltása.

---

## Biztonsági megoldások

- JWT token alapú hitelesítés
- Route védelem frontenden és backenden is
- Szerepkör alapú jogosultságkezelés
- Jelszavak hashelése `bcryptjs` segítségével
- Védett API végpontok
- Saját fiók törlésének tiltása admin felhasználó esetén

---

## Felhasználói felület

A frontend Angular és Angular Material felhasználásával készült.  
A cél egy modern, letisztult, könnyen kezelhető felület megvalósítása volt.

A rendszer fő nézetei:
- kezdőoldal,
- bejelentkezés,
- regisztráció,
- fiókom oldal,
- technikai terméklista,
- új termék hozzáadása,
- rendelési oldal.

A felület reszponzív szemlélettel készült, így különböző képernyőméreteken is használható.

---

## Projektstruktúra

```text
WebTech2/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   └── features/
│   │   ├── environments/
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
└── README.md
```

### Backend fő részei
- **models/**
  - `User.js`
  - `TechItem.js`
  - `Order.js`
- **routes/**
  - `auth.js`
  - `tech.js`
  - `orders.js`
- **middleware/**
  - JWT ellenőrzés
  - szerepkör alapú védelem

### Frontend fő részei
- **core/**
  - auth guard
  - admin guard
  - interceptorok
  - szolgáltatások
  - resolver
- **features/**
  - auth
  - home
  - account
  - tech
  - order

---

## Adatmodellek röviden

### User
A felhasználó adatai:
- username
- passwordHash
- role
- createdAt
- updatedAt

### TechItem
A technikai termék adatai:
- name
- category
- sku
- priceGross
- priceNet
- vat
- quantity
- imageUrl
- color
- date
- tags
- brand
- description
- location
- condition
- status
- reorder
- warrantyMonths

### Order
A rendelés adatai:
- userId
- orderNumber
- customerName
- email
- phone
- address
- shippingMethod
- paymentMethod
- note
- items
- subtotal
- shippingCost
- grandTotal
- createdAt

---

## API végpontok áttekintése

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users` *(admin)*
- `PATCH /api/auth/users/:id/role` *(admin)*
- `DELETE /api/auth/users/:id` *(admin)*

### Technikai termékek
- `GET /api/tech`
- `POST /api/tech` *(admin)*

### Rendelések
- `POST /api/orders`
- `GET /api/orders/mine`
- `GET /api/orders/stats/dashboard`
- `GET /api/orders/:id`

---

## Telepítés és futtatás

### Szükséges szoftverek
- Node.js
- npm
- MongoDB

### 1. A projekt klónozása
```bash
git clone <repository-url>
cd WebTech2
```

### 2. MongoDB indítása
A backend helyi MongoDB-re csatlakozik.  
Alapértelmezett kapcsolat:

```env
MONGO_URI=mongodb://127.0.0.1:27017/tech-nyilvantarto
```

Ha a MongoDB nincs szolgáltatásként telepítve, kézzel is elindítható például:

```bash
mongod --dbpath C:\data\db
```

vagy a saját `mongod.exe` útvonaladdal.

### 3. Backend telepítése és indítása
```bash
cd backend
npm install
npm start
```

Fejlesztői módban:
```bash
npm run dev
```

A backend alapértelmezetten itt fut:
```text
http://localhost:5000
```

### 4. Frontend telepítése és indítása
Új terminálban:

```bash
cd frontend
npm install
npm start
```

A frontend alapértelmezetten itt érhető el:
```text
http://localhost:4200
```

---

## Környezeti változók

A backend `.env` fájlja például így néz ki:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tech-nyilvantarto
JWT_SECRET=please-change-me
JWT_EXPIRES_IN=2h
```

### Ajánlott `.env.example`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tech-nyilvantarto
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=2h
```

> Fontos: a valódi `.env` fájlt nem érdemes publikus repóba feltölteni.

---

## Az első admin felhasználó létrehozása

A rendszerben a regisztráció alapértelmezés szerint `buyer` szerepkörrel hoz létre új felhasználót.  
Ez azt jelenti, hogy az első admin jogosultságot adatbázis oldalon kell beállítani.

Lehetséges megoldások:
- MongoDB Compass használata,
- Mongo shell használata,
- közvetlen adatbázis-frissítés a `users` kollekcióban.

A módosítandó mező:
```json
{
  "role": "admin"
}
```

Ezután az adott felhasználó már hozzáfér az adminisztrációs funkciókhoz is.

---

## Jelenlegi állapot

A projekt egy működőképes, teljes stack beadandó alkalmazás, amely lefedi a feladatkiírás fő követelményeit:

- bejelentkezés és regisztráció,
- jogosultságkezelés,
- listázás,
- új elem hozzáadása,
- adatellenőrzés,
- rendelési folyamat,
- igényes, modern megjelenés.

A rendszer továbbfejleszthető például az alábbi irányokba:
- termék szerkesztése,
- termék törlése,
- keresés és szűrés,
- statisztikák bővítése,
- seed script / demo adatfeltöltés,
- Docker támogatás,
- deploy felhős környezetbe.

---

## Összegzés

A projekt során egy korszerű, több rétegből álló webalkalmazás készült, amely jól szemlélteti az Angular frontend, a Node.js + Express backend és a MongoDB adatbázis együttműködését.

A rendszer nemcsak a beadandó alapkövetelményeit teljesíti, hanem funkcionálisan is továbbmutat egy egyszerű mintafeladaton, mivel valós üzleti logikát is tartalmaz:
- felhasználókezelést,
- jogosultságkezelést,
- készletellenőrzést,
- rendeléskezelést,
- strukturált adatmodellezést.

Ez a projekt jó alapot biztosít későbbi bővítéshez és további full stack fejlesztési tapasztalatok megszerzéséhez.
