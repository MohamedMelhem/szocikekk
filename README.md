# Wikipedia-szócikkek

NestJS- és EJS-alapú webalkalmazás heti Wikipedia-nézettségi adatok böngészéséhez, szűréséhez és új szócikk felvételéhez.

## Indítás

```bash
npm install
npm run start:dev
```

Az alkalmazás alapértelmezés szerint a `http://localhost:3000` címen érhető el.

## Oldalak

- `/` – szócikkek listája ABC-sorrendben; a címsorokra kattintva rendezhető
- `/filter?minViews=1000` – szócikkek szűrése minimum látogatottság szerint
- `/new` – új szócikk felvétele szerveroldali validációval

Az adatokat a `src/article-views.json` fájl tárolja. Sikeres felvételkor a fájl frissül.

## Ellenőrzések

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```
