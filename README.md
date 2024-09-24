# AMČR GIS konvertor
[![DOI](https://zenodo.org/badge/832128788.svg)](https://zenodo.org/doi/10.5281/zenodo.13791113)

Tento projekt poskytuje webový nástroj pro převod vybraných formátů geoprostorových dat do formátu WKT (Well-Known Text), a to zejména pro účely využítí v systému [Archeologická mapa České republiky (AMČR)](https://amcr-info.aiscr.cz/).

## Adresa produkční verze

https://amcr-convert.aiscr.cz/

## Funkce

* Nahrávání a zpracování shapefile souborů (.shp, .dbf, .prj, .cpg) a AutoCAD DXF (Drawing Exchange Format)
* Převod geometrie z shapefile a DXF do WKT formátu
* Podpora pro souřadnicové systémy S-JTSK (EPSG:5514) a WGS 84 (EPSG:4326)
* Zobrazení atributových dat spojených s geometrií
* Uživatelsky přívětivé rozhraní postavené na React.js
* Robustní backend API využívající Express.js

## Technologie

* Frontend: React.js, Bootstrap
* Backend: Node.js, Express.js
* Zpracování shapefile: shapefile, dbffile
* Další klíčové knihovny: multer (pro upload souborů), terraformer-wkt-parser (pro konverzi do WKT)
 
