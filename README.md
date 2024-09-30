# AMČR GIS Konvertor
[![DOI](https://zenodo.org/badge/832128788.svg)](https://zenodo.org/doi/10.5281/zenodo.13791113)

Tento projekt poskytuje webový nástroj pro převod vybraných formátů geoprostorových dat do formátu WKT (Well-Known Text), zejména pro využití v systému [Archeologická mapa České republiky (AMČR)](https://amcr-info.aiscr.cz/).

## Adresa produkční verze

- [AMČR GIS Konvertor](https://amcr-convert.aiscr.cz/)

## Funkce

- Nahrávání a zpracování souborů ve formátu Shapefile (.shp, .dbf, .prj, .cpg) a AutoCAD DXF (Drawing Exchange Format)
- Převod geometrie ze Shapefile do WKT formátu
- Podpora pro varianty souřadnicových systémů S-JTSK a WGS 84 (EPSG:4326)
  
**Varianty S-JTSK:**

| EPSG Code | Popis                                   |
|-----------|----------------------------------------|
| 2065      | S-JTSK (Ferro) / Křovák                |
| 5221      | S-JTSK (Ferro) / Křovák (East-North)   |
| 8352      | S-JTSK [JTSK03] / Křovák               |
| 8353      | S-JTSK [JTSK03] / Křovák (East-North)  |
| 5513      | S-JTSK / Křovák                        |
| 5514      | S-JTSK / Křovák (East-North)           |
| 102066    | S-JTSK (Ferro) / Křovák (East-North)   |
| 102065    | S-JTSK / Křovák (Greenwich)            |
| 102067    | S-JTSK / Křovák (East-North, Greenwich)|

- Zobrazení atributových dat spojených s geometrií
- Uživatelsky přívětivé rozhraní postavené na React.js
- Robustní backend API využívající Express.js

## Technologie

### Serverová část
- **Technologie:** Node.js, Express, Multer
- **Hlavní funkce:**
  - Zpracování SHP souborů nahraných uživatelem
  - Extrakce geometrie, atributů a reprojekce souřadnic do EPSG:5514
  - Detekce EPSG kódu z PRJ souboru a reprojekce pomocí MapTiler API
- **Struktura:**
  - `routes/upload.js`: Definice endpointu pro nahrávání a zpracování SHP souborů
  - `services/shapefileProcessor.js`: Hlavní logika pro zpracování a konverzi SHP do GeoJSON
  - `utils/reprojectionHelper.js`: Helper pro reprojekci souřadnic pomocí MapTiler API
  - **Poznámka:** Momentálně je zakomentovaná logika pro zpracování DXF souborů

### Klientská část
- **Technologie:** React, Bootstrap
- **Hlavní funkce:**
  - Zobrazení nahraných SHP souborů a jejich atributů
  - Výběr EPSG kódu uživatelem, pokud nebyl automaticky zjištěn
  - Zobrazení upozornění na případné chybějící nebo volitelné soubory
- **Struktura:**
  - `components/ShapefileInfo.js`: Komponenta zobrazuje informace o nahraném SHP souboru, umožňuje nastavení atributů a EPSG

## Spuštění na lokálním serveru

### Předpoklady
- Node.js: [Stáhněte a nainstalujte Node.js](https://nodejs.org/)
- Globálně nainstalovaný `nodemon` pro automatický restart serveru při změnách kódu

### Postup spuštění

```bash
# 1. Naklonujte repozitář do svého lokálního počítače
git clone https://github.com/ARUP-CAS/aiscr-gis-convert.git

# 2. Přejděte do složky projektu
cd cesta/k/projektu

# 3. Nainstalujte závislosti pomocí npm
npm install

# 4. Spusťte server pomocí nodemon
nodemon server.js
