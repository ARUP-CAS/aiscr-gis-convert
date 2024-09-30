# AMČR GIS konvertor
[![DOI](https://zenodo.org/badge/832128788.svg)](https://zenodo.org/doi/10.5281/zenodo.13791113)

Tento projekt poskytuje webový nástroj pro převod vybraných formátů geoprostorových dat do formátu WKT (Well-Known Text), a to zejména pro účely využítí v systému [Archeologická mapa České republiky (AMČR)](https://amcr-info.aiscr.cz/).

## Adresa produkční verze

https://amcr-convert.aiscr.cz/

## Funkce

* Nahrávání a zpracování shapefile souborů (.shp, .dbf, .prj, .cpg) a AutoCAD DXF (Drawing Exchange Format)
* Převod geometrie z shapefile do WKT formátu
* Podpora pro varianty souřadnicové systémy S-JTSK a WGS 84 (EPSG:4326)
* Varianty S-JTSK:
| EPSG Code | Search Text                      |
|-----------|----------------------------------|
| 2065      | S-JTSK_Ferro_Krovak              |
| 5221      | S-JTSK_Ferro_Krovak_East_North   |
| 8352      | S-JTSK_JTSK03_Krovak             |
| 8353      | S-JTSK_JTSK03_Krovak_East_North  |
| 5513      | S-JTSK_Krovak                    |
| 5514      | S-JTSK_Krovak_East_North         |
| 102066    | S-JTSK_Ferro_Krovak_East_North   |
| 102065    | S-JTSK_Krovak                    |
| 102067    | S-JTSK_Krovak_East_North         |

* Zobrazení atributových dat spojených s geometrií
* Uživatelsky přívětivé rozhraní postavené na React.js
* Robustní backend API využívající Express.js

## Technologie

### Serverová část
- **Technologie:** Node.js, Express, Multer
- **Hlavní funkce:**
  - Zpracování SHP souborů nahraných uživatelem.
  - Extrakce geometrií, atributů a reprojekce souřadnic do EPSG:5514.
  - Detekce EPSG kódu z prj souboru a reprojekce pomocí MapTiler API.
- **Struktura:**
  - `routes/upload.js`: Definice endpointu pro nahrání a zpracování SHP souborů.
  - `services/shapefileProcessor.js`: Hlavní logika pro zpracování a konverzi SHP do GeoJSON.
  - `utils/reprojectionHelper.js`: Helper pro reprojekci souřadnic pomocí MapTiler API.
  - **Poznámka:** Momentálně je zakomentovaná logika pro zpracování DXF souborů.

### Klientská část
- **Technologie:** React, Bootstrap
- **Hlavní funkce:**
  - Zobrazení nahraných SHP souborů a jejich atributů.
  - Výběr EPSG kódu uživatelem, pokud nebyl zjištěn automaticky.
  - Zobrazení upozornění na případné chybějící nebo volitelné soubory.
- **Struktura:**
  - `components/ShapefileInfo.js`: Komponenta zobrazuje informace o nahraném SHP souboru, umožňuje nastavení atributů a EPSG.
