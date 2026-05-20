# Deploy sulla VPS (nginx + Node)

## Cosa significa «Bad Gateway» (502)

Il reverse proxy (nginx, Caddy, ecc.) **non riceve risposta** dall’app upstream. Di solito:

1. **Node non è in esecuzione** (crash all’avvio, servizio non avviato).
2. **Porta sbagliata** in `proxy_pass` (es. nginx punta a `3000` ma l’app è su `5001`).
3. **Build mancante**: senza cartella `dist/` il server parte comunque, ma in produzione serve sempre `pnpm run build` / `npm run build` prima di `node server.js`.
4. **Firewall** che blocca la porta (meno comune se nginx e Node sono sulla stessa macchina).

---

## Checklist sulla VPS

Nella directory del progetto:

```bash
pnpm install --frozen-lockfile   # oppure: npm ci
pnpm run build                   # genera dist/
PORT=5001 HOST=0.0.0.0 node server.js
```

Verifica da SSH (sulla VPS):

```bash
curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:5001/
```

Deve rispondere **200** (o 304). Se `Connection refused`, Node non è in ascolto su quella porta.

Nei log di avvio comparirà:

- `Listening on http://0.0.0.0:5001`
- `Static (dist): yes` — se vedi **NO**, esegui di nuovo il build.

Variabili d’ambiente:

| Variabile | Default | Ruolo |
|-----------|---------|--------|
| `PORT`    | `5001`  | Porta HTTP del server Express |
| `HOST`    | `0.0.0.0` | Interfaccia di ascolto (tutta la macchina; ok dietro nginx) |

---

## Esempio nginx

Assicurati che `proxy_pass` usi **la stessa porta** del processo Node.

```nginx
server {
    listen 80;
    server_name tuodominio.it;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Poi:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Tenere Node attivo (consigliato: pm2)

```bash
npm install -g pm2
cd /percorso/del/portfolio
pnpm run build
pm2 start server.js --name portfolio --interpreter node
pm2 save
pm2 startup   # segui le istruzioni per systemd
```

---

## Debug rapido

| Sintomo | Cosa controllare |
|---------|------------------|
| 502 subito | `pm2 status` / `journalctl -u tuo-servizio`; log Node per errori |
| 502 dopo reboot | `pm2 startup` non configurato o servizio systemd disabilitato |
| 502 solo su HTTPS | nginx SSL ok ma `proxy_pass` ancora su porta sbagliata |
| Pagina bianca ma non 502 | Apri DevTools → Network; spesso asset 404 (path/base diversi) |

Se dopo questi passi il 502 resta, incolla (senza segreti) il blocco `server { }` di nginx e l’output di `curl -v http://127.0.0.1:PORT/`.
