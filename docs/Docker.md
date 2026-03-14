# Nasazení pomocí Dockeru

## Předpoklady

- [Docker](https://docs.docker.com/get-docker/)
- [docker-compose](https://docs.docker.com/compose/install/) (v2.x)
- Git

## Rychlý start

### 1. Naklonuj repozitář

```bash
git clone git@github.com:ARUP-CAS/aiscr-gis-convert.git
cd aiscr-gis-convert
```

### 2. Nastav URL API

V souboru `client/.env.production` nastav adresu, na které bude aplikace dostupná:

```
REACT_APP_API_URL=https://tvoje-domena.cz
```

### 3. Spusť kontejnery

```bash
docker-compose up --build -d
```

Tím se sestaví a spustí dva kontejnery:

| Kontejner | Popis | Port |
|---|---|---|
| `server` | Express API | 3006 |
| `client` | React aplikace (nginx) | 8081 |

### 4. Ověř běh

```bash
docker-compose ps
```

---

## Aktualizace aplikace

Při každé změně kódu nebo URL je potřeba znovu sestavit image:

```bash
git pull
docker-compose up --build -d
```

Pokud se mění pouze klientská URL (`REACT_APP_API_URL`), stačí přebuildit jen klienta:

```bash
docker-compose up --build -d client
```

---

## Zastavení

```bash
docker-compose down
```

---

## Nasazení na server s Apache proxy

Aplikace předpokládá Apache jako reverzní proxy před Docker kontejnery.

### Apache vhost konfigurace

Vzorová konfigurace je v souboru `stageshptowkt.geogrep.conf` v kořeni projektu.
Zkopíruj ji na server a uprav `ServerName` a cesty k SSL certifikátům:

```bash
cp stageshptowkt.geogrep.conf /etc/apache2/sites-available/tvoje-domena.conf
# uprav ServerName a SSL cesty
a2ensite tvoje-domena.conf
```

### SSL certifikát (Let's Encrypt)

```bash
# Nejdřív aktivuj dočasný HTTP vhost bez SSL bloku, pak:
certbot --apache -d tvoje-domena.cz
```

### Reload Apache

```bash
systemctl reload apache2
```

---

## Struktura Docker souborů

```
├── docker-compose.yml        # definice služeb
├── server/
│   └── Dockerfile            # Node.js server
└── client/
    ├── Dockerfile            # React build + nginx
    └── nginx.conf            # nginx konfigurace pro SPA
```
