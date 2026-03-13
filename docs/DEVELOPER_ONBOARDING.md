# Developer Onboarding

Tama ohje maarittelee peruskaytannot uusille kehittajille OSSI-frontendiin.

## 1. Tyokalut

Tarvitset:

- Git (2.40+ suositus)
- Node.js 22.x
- npm
- Docker / Docker Desktop (valinnainen, jos ajat frontendia containerissa)
- Kaynnissa olevan `ossi-api`-backendiin paikallisesti osoitteessa `http://localhost:3000`

## 2. Git-asetukset (cross-platform)

Aja nama kerran:

```bash
git config --global user.name "Etunimi Sukunimi"
git config --global user.email "sinun.sposti@esedu.fi"
git config --global pull.rebase true
git config --global fetch.prune true
git config --global core.editor "nano"
```

### Windows-kehittajat (Git Bash / PowerShell)

```bash
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf warn
```

### macOS/Linux-kehittajat

```bash
git config --global core.autocrlf input
git config --global core.eol lf
git config --global core.safecrlf warn
```

## 3. Branch-kaytanto

- `main`: tuotantolaheinen ja julkaistu koodi
- `dev`: integraatiohaara aktiiviselle kehitykselle
- ominaisuudet ja korjaukset tehdaan omista brancheista, jotka luodaan `dev`-haarasta

Suositeltu branch-nimeaminen:

- `feature/<ticket-id>-<lyhyt-kuvaus>`
- `fix/<ticket-id>-<lyhyt-kuvaus>`
- `chore/<lyhyt-kuvaus>`

Esimerkki:

```bash
git switch dev
git pull origin dev
git switch -c feature/1234-add-student-view
```

## 4. Ensimmainen kaynnistys paikallisesti

1. Asenna riippuvuudet:

```bash
npm install
```

2. Luo projektin juureen `.env`:

```env
VITE_CLIENT_ID=your-azure-app-client-id
VITE_TENANT_ID=your-azure-tenant-id
VITE_REDIRECT_URI=http://localhost:5174/
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5174/
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

3. Varmista, etta `ossi-api` on kaynnissa paikallisesti.

4. Kaynnista frontend:

```bash
npm run dev
```

5. Avaa selain osoitteeseen `http://localhost:5174`

## 5. Frontendin dev-erityispiirteet

- Auth hoidetaan MSAL:lla (`authConfig.ts`, `src/components/auth-provider.tsx`)
- Frontend tekee GraphQL-kutsut Apollo Clientilla
- Oletuksena tuotannossa GraphQL endpoint on `/graphql`, mutta lokaalisti voi kayttaa `http://localhost:3000/graphql`
- Kehitysymparistossa roolia voi vaihtaa avatar-menusta, koska `UserProfile` nayttaa `Vaihda roolia` -vaihtoehdon kun `import.meta.env.DEV` on tosi

## 6. Yleisimmat komennot

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Tarkoitus:

- `npm run dev`: kaynnistaa Viten kehityspalvelimen
- `npm run lint`: tarkistaa lint-virheet
- `npm run build`: ajaa TypeScript-buildin ja tuotantobundlen
- `npm run preview`: ajaa rakennettua frontendia paikallisesti

## 7. Uuden tehtavan aloitus

1. Paivita `dev`:
   - `git switch dev`
   - `git pull origin dev`
2. Luo uusi branch `dev`-haarasta.
3. Tee muutos pienissa, loogisissa commit-erissa.
4. Aja vahintaan:
   - `npm run lint`
   - `npm run build`
5. Testaa relevantti kayttotapa selaimessa.
6. Tee PR `dev`-haaraan.

## 8. Commit-kaytannot

Suositus:

- lyhyt ja kuvaava otsikko
- yksi looginen muutos per commit
- valta epamaaraisia viesteja kuten `misc fixes`

Esimerkkeja:

- `fix: use env based graphql endpoint in apollo client`
- `docs: add frontend developer onboarding`

## 9. Ennen PR:aa

- `git status` on siisti
- `npm run lint` ja `npm run build` menevat lapi
- selain-smoke test tehty
- dokumentaatio paivitetty, jos kayttaytyminen muuttui
- PR-kuvaus sisaltaa:
  - mita muutettiin
  - miksi muutettiin
  - miten testattiin

## 10. Yleisimmat ongelmat

### `Missing environment variables for MSAL configuration`

Tarkista, etta kaikki vaaditut `VITE_*`-muuttujat ovat `.env`-tiedostossa.

### Login onnistuu, mutta data ei lataudu

Tarkista:

- `ossi-api` on kaynnissa portissa `3000`
- `VITE_GRAPHQL_URL` osoittaa oikeaan endpointiin
- selaimen `sessionStorage` ei sisalla vanhentunutta tokenia

### Suora selaimen refresh suojatulle reitille ei toimi tuotannossa

Nginx tarvitsee SPA-fallbackin:

```nginx
try_files $uri $uri/ /index.html;
```

## 11. Yleisimmat Git-tilanteet

Jos `git pull` antaa `divergent branches`:

```bash
git fetch origin
git rebase origin/dev
```

Konfliktin jalkeen:

```bash
git add <tiedostot>
git rebase --continue
```

Jos haluat perua rebasen:

```bash
git rebase --abort
```
