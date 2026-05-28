# StreamShield

Player alternativo do YouTube com bloqueio inteligente de anúncios, SponsorBlock integrado e interface premium.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** — tema dark premium
- **Zustand** — estado global
- **youtubei.js** — API Innertube (sem chave de API)
- **Prisma + SQLite** — dados locais
- **hls.js** — streaming HLS
- **SponsorBlock** — pular patrocínios
- **Docker + Docker Compose**

---

## Funcionalidades

| Feature | Status |
|---------|--------|
| Busca de vídeos | ✅ |
| Player customizado | ✅ |
| Anti-anúncios (stream direto) | ✅ |
| SponsorBlock auto-skip | ✅ |
| Picture-in-Picture | ✅ |
| Velocidade de reprodução | ✅ |
| Tela cheia | ✅ |
| Legendas | ✅ |
| Contas locais | ✅ |
| Histórico | ✅ |
| Favoritos | ✅ |
| Playlists | ✅ |
| PWA instalável | ✅ |
| Dark mode | ✅ |

---

## Início rápido

### Desenvolvimento local

```bash
# 1. Clone e instale
git clone <repo>
cd streamshield
npm install

# 2. Configure variáveis
cp .env.example .env.local
# Edite .env.local com seus valores

# 3. Configure banco de dados
npm run db:generate
npm run db:push

# 4. Inicie
npm run dev
```

Acesse: http://localhost:3000

### Com Docker Compose

```bash
# 1. Configure
cp .env.example .env
# Edite JWT_SECRET e NEXT_PUBLIC_APP_URL

# 2. Build e start
docker compose up -d

# 3. Logs
docker compose logs -f streamshield
```

---

## Deploy em VPS

### Requisitos

- VPS com 1GB+ RAM (2GB recomendado)
- Ubuntu 22.04 ou Debian 12
- Docker + Docker Compose instalados

### Passos

```bash
# 1. Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clonar o projeto
git clone <seu-repo> /opt/streamshield
cd /opt/streamshield

# 3. Configurar ambiente
cp .env.example .env
nano .env
# Defina:
# JWT_SECRET=<string aleatória longa>
# NEXT_PUBLIC_APP_URL=https://seudominio.com

# 4. Build e start
docker compose up -d --build

# 5. (Opcional) Com Nginx para HTTPS
# Instale certbot e configure SSL
docker compose --profile production up -d
```

### Variáveis de ambiente obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Path do SQLite | `file:/data/streamshield.db` |
| `JWT_SECRET` | Chave JWT (mín. 32 chars) | `sua-chave-super-secreta-aqui` |
| `NEXT_PUBLIC_APP_URL` | URL pública da app | `https://seudominio.com` |

---

## Arquitetura

```
Cliente (Browser)
    │
    ├── GET /api/search        → youtubei.js → YouTube Innertube
    ├── GET /api/video/[id]    → youtubei.js → metadados
    ├── GET /api/stream/[id]   → youtubei.js → URL do stream decifrada
    ├── GET /api/proxy?url=    → proxy transparente → stream YouTube
    ├── GET /api/sponsorblock/ → SponsorBlock API pública
    └── POST /api/auth/*       → Prisma → SQLite
```

### Como os anúncios são evitados

O StreamShield usa a biblioteca `youtubei.js` que implementa o protocolo **Innertube** do YouTube — a mesma API usada pelo app móvel do YouTube. Ao obter streams diretamente via Innertube (e não via embed/player web), os anúncios injetados pelo player web simplesmente não existem no fluxo de dados.

O parâmetro `n` de throttling é decifrado automaticamente pelo `youtubei.js`.

O stream é proxiado pelo backend para:
1. Reescrever headers (evitar CORS)
2. Suportar range requests (seeking funcional)
3. Não expor URLs internas ao cliente

---

## Estrutura do projeto

```
streamshield/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (backend)
│   │   ├── watch/[id]/         # Página do player
│   │   ├── search/             # Página de busca
│   │   └── (auth)/             # Login/Register
│   ├── components/
│   │   ├── player/             # VideoPlayer + controles
│   │   ├── layout/             # Header, Sidebar
│   │   ├── search/             # VideoCard, VideoGrid
│   │   └── ui/                 # Button, Input, etc.
│   ├── lib/
│   │   ├── youtube/            # Innertube, search, stream
│   │   └── sponsorblock/       # SponsorBlock client
│   ├── store/                  # Zustand stores
│   ├── hooks/                  # Custom hooks
│   └── types/                  # TypeScript types
├── prisma/schema.prisma
├── Dockerfile
└── docker-compose.yml
```

---

## Atalhos do player

| Tecla | Ação |
|-------|------|
| `Space` | Play/Pause |
| `←` | -5 segundos |
| `→` | +5 segundos |
| `↑` | Volume +10% |
| `↓` | Volume -10% |
| `M` | Mute/Unmute |
| `F` | Tela cheia |

---

## Limitações e aviso legal

> **Aviso importante:** Este software é para fins **educacionais e pessoais**.

- Viola os Termos de Serviço do YouTube (`youtube.com/t/terms`)
- Não deve ser usado para fins comerciais
- Não deve ser hospedado publicamente sem consentimento
- O YouTube pode bloquear requests a qualquer momento
- Streams têm duração limitada (URLs expiram em ~6h)
- Qualidade máxima com stream combinado: ~1080p (depende do vídeo)
- Não há suporte a vídeos com verificação de idade sem cookie

Este projeto é similar ao [FreeTube](https://freetubeapp.io/), [Invidious](https://invidious.io/) e [Piped](https://piped.video/) — alternativas open source ao YouTube.

---

## Desenvolvimento

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Format
npm run format

# DB Studio
npm run db:studio
```

---

## Licença

MIT — uso pessoal e educacional apenas.
