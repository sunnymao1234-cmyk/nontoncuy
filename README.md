# Nontoncuy

Webapp streaming film berbasis React, Vite, dan Express proxy.

Sumber yang terpasang:

- Indocast Filmbox untuk katalog film/series utama.
- Dramaku API untuk katalog Dramabox berbasis kategori.
- Hafizh DramaBox API untuk katalog DramaBox Indonesia.
- Sansekai API untuk kategori app seperti DramaBox, PineDrama, ReelShort, ShortMax, GoodShort, FreeReels, DramaNova, Anime, dan MovieBox.

## Menjalankan

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`  
Proxy API: `http://127.0.0.1:8787`

## Konfigurasi

API key dibaca server dari `.env`:

```bash
INDOCAST_API_KEY=...
PORT=8787
```

Frontend selalu memanggil endpoint lokal `/api/...`, jadi key tidak ikut dibundle ke browser. Sansekai tidak memakai key di demo publiknya, tetapi upstream dapat mengembalikan `Forbidden` saat bandwidth/rate limit mereka sedang ditutup. Hafizh dan Dramaku saat dicek dapat memuat katalog/list, tetapi endpoint video kadang mengembalikan error upstream.
