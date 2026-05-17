# API Solid

API para gerenciamento de check-ins em academias (gyms), construída com Node.js, Fastify, Prisma e PostgreSQL seguindo os princípios do SOLID e Clean Architecture.

## 🎯 Propósito

Sistema que permite o cadastro de usuários e academias, realização de check-ins com validação de geolocalização (distância máxima de 100m), controle de limite de um check-in por dia, e validação por administradores com janela de 20 minutos.

## 📋 Regras de Negócio

- **Autenticação**: Login via email + senha com JWT (10 min) e refresh token (7 dias via cookie)
- **Registro**: Senha hash com bcryptjs (cost 6); email único por usuário
- **Perfis**: `ADMIN` e `MEMBER` — apenas `ADMIN` pode criar academias e validar check-ins
- **Check-in**: Usuário deve estar a no máximo **100 metros** da academia (fórmula de Haversine)
- **Limite**: Apenas **um check-in por dia** por usuário
- **Validação**: Admin deve validar o check-in em até **20 minutos** após a criação
- **Paginação**: Listagens retornam 20 itens por página
- **Busca**: Academias pesquisáveis por título (ILIKE)
- **Nearby**: Academias num raio de **10 km**

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com dependência invertida (Clean Architecture / SOLID):

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Layer (Controllers)                  │
│  routes → handlers → request/response                       │
├─────────────────────────────────────────────────────────────┤
│                  Use Cases (Business Logic)                  │
│  regras de negócio independentes de framework               │
├─────────────────────────────────────────────────────────────┤
│              Repository Interfaces (Contracts)               │
│  UsersRepository | GymsRepository | CheckInsRepository      │
├─────────────────────────────────────────────────────────────┤
│         Implementations (Prisma / In-Memory)                 │
│  Produção → PrismaRepository  |  Testes → InMemoryRepository │
└─────────────────────────────────────────────────────────────┘
```

### 🔁 Injeção de Dependência

Use cases recebem repositórios via construtor. Factories montam a cadeia de dependência. Em testes, repositórios em memória substituem o Prisma sem alterar a lógica de negócio.

## ✅ Boas Práticas Implementadas

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Architecture**: Domínio isolado de frameworks e banco de dados
- **Repository Pattern**: Contratos definidos por interfaces, implementações substituíveis
- **Dependency Injection**: Use cases acoplados a abstrações, não a implementações concretas
- **DRY / SRP**: Cada use case tem uma única responsabilidade; lógica duplicada extraída para funções
- **Testes**: Cobertura com Vitest — testes unitários (in-memory) + E2E (PostgreSQL real com schemas isolados)
- **Validação**: Zod para validação de entrada e variáveis de ambiente
- **Tratamento de erros**: Error classes customizadas para domínio; handler global no Fastify
- **JWT + Refresh Token**: Curta duração + cookie httpOnly para renovação segura
- **Role-Based Access Control**: Middleware de autorização por papel do usuário
- **CI/CD**: GitHub Actions com testes unitários e E2E em pull requests

## 📁 Estrutura de Pastas

```
.
├── .env.example                       # Variáveis de ambiente (template)
├── .eslintrc.json                     # ESLint (Rocketseat config)
├── docker-compose.yml                 # PostgreSQL via Docker
├── package.json                       # Scripts e dependências
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vitest config
├── prisma/
│   ├── schema.prisma                  # Schema do banco de dados
│   └── migrations/                    # Migrations (4)
└── src/
    ├── app.ts                         # Setup Fastify (plugins, rotas, error handler)
    ├── server.ts                      # Entry point
    ├── env/
    │   └── index.ts                   # Validação de env vars com Zod
    ├── lib/
    │   └── prisma.ts                  # Singleton PrismaClient
    ├── @types/
    │   └── fastify-jwt.d.ts           # Tipagem JWT + role
    ├── http/
    │   ├── controllers/
    │   │   ├── users/                 # register, authenticate, profile, refresh
    │   │   ├── gyms/                  # create, search, nearby
    │   │   └── check-ins/             # create, history, metrics, validate
    │   └── middlewares/
    │       ├── verify-jwt.ts          # Autenticação JWT
    │       └── verify-user-role.ts    # Autorização por role
    ├── repositories/
    │   ├── users-repository.ts        # Interface
    │   ├── gyms-repository.ts         # Interface
    │   ├── check-ins-repository.ts    # Interface
    │   ├── prisma/                    # Implementações Prisma (produção)
    │   └── in-memory/                 # Implementações em memória (testes)
    ├── use-cases/
    │   ├── register.ts                # + spec, factory
    │   ├── authenticate.ts            # + spec, factory
    │   ├── get-user-profile.ts        # + spec, factory
    │   ├── create-gym.ts              # + spec, factory
    │   ├── search-gyms.ts             # + spec, factory
    │   ├── fetch-nearby-gyms.ts       # + spec, factory
    │   ├── check-in.ts                # + spec, factory
    │   ├── fetch-user-check-ins-history.ts  # + spec, factory
    │   ├── get-user-metrics.ts        # + spec, factory
    │   ├── validate-check-in.ts       # + spec, factory
    │   ├── factories/                 # 10 factory functions
    │   └── errors/                    # 6 error classes customizadas
    └── utils/
        ├── get-distance-between-cordinates.ts  # Fórmula de Haversine
        └── test/
            └── create-and-authenticate-user.ts # Helper para E2E
```

## 🚀 Como Iniciar

### Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose

### Passo a passo

```bash
# 1. Clone o repositório
git clone <repo-url>
cd api-solid

# 2. Instale as dependências
npm install

# 3. Inicie o PostgreSQL via Docker
npm run docker:up

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações (ou use os defaults do docker-compose)

# 5. Execute as migrations
npx prisma migrate deploy

# 6. Inicie o servidor em modo dev
npm run start:dev

# O servidor estará disponível em http://localhost:3333
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Inicia servidor com hot reload |
| `npm run build` | Compila para produção (tsup) |
| `npm start` | Inicia servidor compilado |
| `npm run docker:up` | Sobe o PostgreSQL |
| `npm run docker:down` | Para o PostgreSQL |
| `npm test` | Testes unitários |
| `npm run test:e2e` | Testes E2E (requer banco rodando) |
| `npm run test:coverage` | Cobertura de testes |

### Docker

O arquivo `docker-compose.yml` expõe o PostgreSQL na porta **5433** do host:

```yaml
services:
  api-solid-pg:
    image: bitnami/postgresql:latest
    ports:
      - "5433:5432"
    environment:
      POSTGRESQL_USERNAME: docker
      POSTGRESQL_PASSWORD: docker
      POSTGRESQL_DATABASE: apisolid
    volumes:
      - postgres_data:/bitnami/postgresql
```

### 🧪 Executando Testes E2E

Os testes E2E criam schemas isolados no PostgreSQL (via `prisma migrate deploy` em schemas UUID únicos) e os destroem ao final. Certifique-se de que o Docker esteja rodando e crie um arquivo `.env.test`:

```bash
# .env.test
DATABASE_URL="postgresql://docker:docker@localhost:5433/apisolid"
JWT_SECRET=test_secret

npm run test:e2e
```

## 🛠️ Stack

| Tecnologia | Versão |
|-----------|--------|
| Node.js | >= 18 |
| TypeScript | 6 |
| Fastify | 5 |
| Prisma | 4 |
| PostgreSQL | 16 |
| Zod | 4 |
| Vitest | 4 |
| bcryptjs | 3 |
| dayjs | 1 |
| ESLint (Rocketseat) | 8 |
| tsup | 8 |
