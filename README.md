# Pik ’n Patat

Een Nederlandstalige arcadegame voor telefoon en computer. Steel friet als meeuw en ontwijk koelboxen en parasols terwijl de snackbarhouder je achtervolgt.

## Spelen

- Spring: spatie, pijl omhoog of de knop SPRING.
- Buk: houd pijl omlaag of BUK ingedrukt.
- Fladder: F of FLADDER. Kost één frietje.
- Je record wordt alleen in je eigen browser bewaard.

## Ontwikkelen en controleren

De game gebruikt gewone HTML, CSS en JavaScript en heeft geen externe dependencies. Publiceer de inhoud van `dist/` met een statische webserver. Open de game via HTTP(S), zodat JavaScript-modules goed laden.

Voer de tests uit met Node.js 24:

```sh
npm test
```

## Vercel

Importeer deze repository als project met framework **Other**. `vercel.json` laat de tests uitvoeren en publiceert daarna `dist/`. De game heeft geen database, accounts of geheime omgevingsvariabelen nodig.

Iedere bezoeker speelt een eigen ronde. Er is nog geen gedeelde ranglijst of realtime multiplayer.
