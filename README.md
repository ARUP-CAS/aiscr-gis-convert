# AMČR GIS konvertor

Tento projekt poskytuje webový nástroj pro převod souborů SHP (shapefile) do WKT (Well-Known Text) formátu, zejména pro účely využítí v systému [Archeologická mapa České republiky (AMČR)](https://amcr-info.aiscr.cz/).

## Adresa předprodukční verze

https://shptowkt.geogrep.cz/

## Funkce

* Nahrávání a zpracování shapefile souborů (.shp, .dbf, .prj, .cpg)
* Převod geometrie z shapefile do WKT formátu
* Podpora pro souřadnicové systémy S-JTSK (EPSG:5514) a WGS 84 (EPSG:4326)
* Zobrazení atributových dat spojených s geometrií
* Uživatelsky přívětivé rozhraní postavené na React.js
* Robustní backend API využívající Express.js

## Technologie

* Frontend: React.js, Bootstrap
* Backend: Node.js, Express.js
* Zpracování shapefile: shapefile, dbffile
* Další klíčové knihovny: multer (pro upload souborů), terraformer-wkt-parser (pro konverzi do WKT)
 
