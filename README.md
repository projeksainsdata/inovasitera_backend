# Backend

Backend adalah bagian dari aplikasi yang berjalan di server. Ini bertanggung jawab untuk mengelola data dan berkomunikasi dengan database. Backend menyediakan API yang digunakan oleh aplikasi frontend untuk berinteraksi dengan server.

# Teknologi

Berikut adalah teknologi yang digunakan dalam backend:

1. Node.js
2. Express.js
3. Mongodb
4. mongoose

## ERD

ERD (Entity Relationship Diagram) adalah diagram yang digunakan untuk merepresentasikan struktur database. ERD terdiri dari entitas, atribut, dan relasi antar entitas. ERD membantu kita memahami struktur database dan relasi antar tabel.

<!-- image erd ./ERD.png -->
<image src="ERD.png"/>

# Komunikasi dengan Frontend

Backend berkomunikasi dengan frontend melalui API. API ini memungkinkan frontend untuk mengirim permintaan ke server dan menerima respons. API ini dapat berupa RESTful API.

# Struktur File Backend

Berikut adalah struktur file yang direkomendasikan untuk backend:

```
backend
├── configs
├── logs
├── tests
├── docs
├── config
│   ├── ...
├── prisma
│   ├── schema.prisma
├── .env
├── src
│   ├── controllers
│   │   ├── ...
│   ├── applications
│   │   ├── ...
│   ├── middlewares
│   │   ├── ...
│   ├── responses
│   │   ├── ...
│   ├── routes
│   │   ├── ...
│   ├── services
│   │   ├── ...
│   ├── utils
│   │   ├── ...
│   ├── app.js

*catatan : Struktur ini adalah rekomendasi dan Anda dapat menyesuaikan sesuai kebutuhan proyek*

## Direktori
1. `configs` : berisi konfigurasi aplikasi seperti konfigurasi database, konfigurasi server, dll.
2. `logs` : berisi log aplikasi.

3. `tests` : berisi file tes untuk aplikasi.
4. `docs` : berisi dokumentasi aplikasi.

5. `prisma` : berisi file schema Prisma yang digunakan untuk mengelola database. Prisma adalah ORM yang digunakan untuk berinteraksi dengan database. Schema Prisma mendefinisikan struktur database seperti tabel, kolom, relasi, dll (model)
6. `.env` : berisi variabel lingkungan yang digunakan dalam aplikasi.
7. `src` : berisi kode sumber aplikasi.
8. `controllers` : berisi file controller yang digunakan untuk mengelola logika bisnis aplikasi.
9. `applications` : berisi file aplikasi yang digunakan untuk mengelola logika aplikasi.
10. `middlewares` : berisi file middleware yang digunakan untuk menangani permintaan.
11. `responses` : berisi file respons yang digunakan untuk mengelola respons.
12. `routes` : berisi file rute yang
13. `services` : berisi file service yang digunakan untuk berinteraksi dengan database.
14. `utils` : berisi file utilitas yang digunakan dalam aplikasi.
15. `app.js` : berisi kode untuk membuat server dan mengatur aplikasi.
```

## Getting Started

Berikut adalah langkah-langkah untuk menjalankan backend:

<!-- buka halaman  -->

### Membuat Credential OAuth2 Google

## Langkah-langkah untuk Membuat Proyek di Google Developer Console dan Mengaktifkan Google+ API

1. **Pergi ke Google Developer Console**:

   - Buka [Google Developer Console](https://console.developers.google.com/).

2. **Buat Proyek Baru**:

   - Klik tombol “Select a project” di bagian atas halaman.
   - Klik “New Project” di pojok kanan atas dialog yang muncul.
   - Masukkan nama proyek Anda dan klik “Create”.

3. **Aktifkan Google+ API untuk Proyek Anda**:

   - Pilih proyek yang baru Anda buat.
   - Di panel navigasi sebelah kiri, klik “Library”.
   - Cari “Google+ API” menggunakan kotak pencarian.
   - Klik “Google+ API” dan kemudian klik tombol “Enable”.

4. **Buat Kredensial OAuth 2.0**:
   - Di panel navigasi sebelah kiri, klik “Credentials”.
   - Klik “Create Credentials” dan pilih “OAuth 2.0 Client ID”.
   - Anda mungkin diminta untuk mengkonfigurasi layar persetujuan OAuth. Isi informasi yang diperlukan dan simpan.
   - Pilih “Web application” sebagai jenis aplikasi.
   - Masukkan “Name” untuk klien OAuth Anda.
   - Di bawah “Authorized redirect URIs”, masukkan `http://localhost:3000/auth/google/callback` (ubah port jika server Anda berjalan di port yang berbeda).
   - Klik “Create”.

Setelah mengikuti langkah-langkah ini, Anda akan mendapatkan Client ID dan Client Secret yang dapat Anda gunakan untuk mengautentikasi pengguna menggunakan OAuth 2.0.

### copy the `.env.example` file to `.env`

```bash
cp .env.example .env
```

- copy Client ID dan Client Secret ke file .env

Install dependencies

```bash
npm install
```

Migrate Database with Prisma

```
npx prisma migrate dev
```

Generate the Prisma Client

```
npx prisma generate
```

Start the server

```bash
npm start
```

The server will start at `http://localhost:3000`
