# 💬 Sistema de Conversas (Chat)

> Sistema de chat não-real-time entre Healthcare Providers e Customers com suporte a mensagens de texto e upload de arquivos.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Decisão de Arquitetura](#-decisão-de-arquitetura)
- [Quick Start](#-quick-start)
- [Endpoints](#-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)
- [Como Testar](#-como-testar)

## 🎯 Visão Geral

Sistema completo de chat integrado ao backend Localiza Saúde com as seguintes funcionalidades:

✅ **Mensagens de Texto**
- Limite de 5000 caracteres
- Validação completa com Zod
- Suporte a múltiplas conversas

✅ **Upload de Arquivos**
- Armazenamento no Cloudflare R2
- Limite de 10MB por arquivo
- Nomes sanitizados automaticamente
- URLs públicas geradas

✅ **Conversas por Relacionamento**
- Uma conversa única por par (Provider ↔ Customer)
- Histórico centralizado e contínuo
- Campo opcional para vincular mensagens a appointments específicos

✅ **Segurança**
- Autenticação JWT obrigatória
- Validação de ownership
- Sanitização de inputs

## 🏗️ Decisão de Arquitetura

### Por que Chat por Relacionamento?

**Escolhemos:** Uma conversa única por relacionamento Provider-Customer (ao invés de uma conversa por appointment)

**Vantagens:**
- ✅ Histórico contínuo e centralizado
- ✅ UX similar a WhatsApp/Messenger
- ✅ Fácil encontrar conversas antigas
- ✅ Constrói relacionamento de longo prazo
- ✅ Customer não precisa lembrar "em qual appointment falei sobre X"

**Flexibilidade:**
- Campo opcional `relatedAppointmentId` permite referenciar appointments específicos
- Pode filtrar mensagens de um appointment quando necessário

## ⚡ Quick Start

### 1. Configurar Variáveis de Ambiente

Adicione ao `.env`:

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=localiza-saude-files
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

[Como obter credenciais Cloudflare R2 →](CONVERSATIONS_QUICK_START.md#1-variáveis-de-ambiente)

### 2. Rodar Migrations

```bash
bun run generate
bun run migrate
```

### 3. Iniciar Servidor

```bash
bun run dev
```

### 4. Testar

Use a coleção Bruno em `bruno-collection/Conversations/` ou veja [exemplos com cURL](CONVERSATIONS_QUICK_START.md#-teste-rápido-5-minutos)

## 🚀 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/conversations` | Criar/buscar conversa com participante |
| GET | `/conversations` | Listar conversas do usuário autenticado |
| POST | `/conversations/messages/text` | Enviar mensagem de texto |
| POST | `/conversations/messages/file` | Enviar arquivo (multipart/form-data) |
| GET | `/conversations/:id/messages` | Listar mensagens de uma conversa |
| DELETE | `/conversations/messages/:id` | Deletar mensagem (e arquivo se houver) |

**Todos os endpoints requerem autenticação JWT.**

### Exemplo: Enviar Mensagem de Texto

```bash
curl -X POST http://localhost:3333/conversations/messages/text \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "provider-or-customer-id",
    "content": "Olá, tudo bem?"
  }'
```

### Exemplo: Enviar Arquivo

```bash
curl -X POST http://localhost:3333/conversations/messages/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "recipientId=provider-or-customer-id"
```

[Ver todos os exemplos →](CONVERSATIONS_IMPLEMENTATION.md#-endpoints-disponíveis)

## 📁 Estrutura do Projeto

```
src/http/
├── controllers/conversations/      # 6 controllers
├── useCases/conversations/         # 6 use cases
├── routes/conversations/           # 6 routes
├── repositories/conversations/     # Repository pattern
├── presenters/                     # Data transformation
│   └── conversation-presenter.ts
└── services/
    └── storage.service.ts          # Cloudflare R2 integration

prisma/schema/
└── messages.prisma                 # Database schema

bruno-collection/Conversations/     # 6 Bruno requests
```

**Total: ~30 arquivos criados/modificados**

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [CONVERSATIONS_IMPLEMENTATION.md](CONVERSATIONS_IMPLEMENTATION.md) | Documentação técnica completa (755 linhas) |
| [CONVERSATIONS_QUICK_START.md](CONVERSATIONS_QUICK_START.md) | Guia rápido de configuração e testes |
| [CONVERSATIONS_SUMMARY.md](CONVERSATIONS_SUMMARY.md) | Resumo executivo |
| `bruno-collection/Conversations/` | 6 requests prontas para teste |

## 🧪 Como Testar

### Opção 1: Bruno (Recomendado)

1. Abra Bruno
2. Importe a coleção `bruno-collection/`
3. Configure variáveis de ambiente
4. Execute requests em `Conversations/`

### Opção 2: cURL

[Ver exemplos completos →](CONVERSATIONS_QUICK_START.md#-teste-rápido-5-minutos)

### Opção 3: Integração Frontend

```typescript
// React Native / Expo exemplo
const sendMessage = async (recipientId: string, content: string) => {
  const response = await fetch(`${API_URL}/conversations/messages/text`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipientId, content }),
  });
  return response.json();
};
```

[Ver mais exemplos →](CONVERSATIONS_IMPLEMENTATION.md#-integração-com-frontend-exemplo-react-native)

## 🗄️ Schema do Banco

### Tabelas

**conversations**
- Relacionamento único por par (customer, provider)
- `lastMessageAt` para ordenação
- Cascade delete

**conversation_messages**
- Tipo: TEXT ou FILE
- Sender: CUSTOMER ou HEALTHCARE_PROVIDER
- Opcional: `relatedAppointmentId`
- Campos de arquivo: url, name, size, mimeType

[Ver schema completo →](CONVERSATIONS_IMPLEMENTATION.md#️-schema-do-banco-de-dados)

## ☁️ Cloudflare R2

### Estrutura de Storage

```
bucket-name/
└── messages/
    ├── 1705324800000-abc123-documento.pdf
    ├── 1705324900000-def456-exame.jpg
    └── 1705325000000-ghi789-receita.png
```

### Integração

Usando S3Client nativo do Bun (sem dependências AWS SDK):

```typescript
import { S3Client } from "bun";

const client = new S3Client({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  bucket: env.R2_BUCKET_NAME,
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

// Upload
await client.write(key, file, { type: file.type });

// Delete
await client.delete(key);
```

## 🔐 Segurança

- ✅ JWT obrigatório em todas as rotas
- ✅ User só acessa conversas onde participa
- ✅ User só deleta próprias mensagens
- ✅ Limite de 10MB por arquivo
- ✅ Sanitização de nomes de arquivo
- ✅ Validação completa com Zod

## 📊 Arquitetura

```
Request
  ↓
Route (Zod validation)
  ↓
Controller (request/response handling)
  ↓
Use Case (business logic)
  ↓
Repository (database access)
  ↓
Presenter (data transformation)
  ↓
Response
```

**Seguindo 100% o padrão do projeto existente.**

## ✨ Funcionalidades

### Implementadas

- [x] Chat por relacionamento Provider-Customer
- [x] Mensagens de texto (max 5000 caracteres)
- [x] Upload de arquivos (max 10MB)
- [x] Vincular mensagem a appointment (opcional)
- [x] Listar conversas ordenadas por atividade
- [x] Paginação (limit/offset)
- [x] Filtrar mensagens por appointment
- [x] Deletar mensagens
- [x] Última mensagem em cada conversa
- [x] Criação automática de conversa

### Futuras (Opcional)

- [ ] Notificações push
- [ ] Indicador "não lida"
- [ ] WebSocket (real-time)
- [ ] Mensagens de áudio
- [ ] Preview de imagens
- [ ] Busca em mensagens
- [ ] Exportar conversa PDF

## ⚠️ Troubleshooting

### Erro: "R2 configuration is incomplete"

Verifique se todas as variáveis R2 estão no `.env`:

```bash
cat .env | grep R2
```

### Erro: Tipos não encontrados

Regenere o Prisma Client:

```bash
bun run generate
```

### Erro 401 Unauthorized

Token inválido ou expirado. Faça login novamente.

[Ver mais problemas →](CONVERSATIONS_QUICK_START.md#️-troubleshooting)

## 🎉 Status

**✅ Implementação Completa e Pronta para Uso**

- 30 arquivos criados/modificados
- 6 endpoints REST completos
- 2 tabelas no banco de dados
- Storage Cloudflare R2 configurado
- Validação completa com Zod
- Documentação completa
- Testes prontos via Bruno

**Pronto para integração com frontend!** 🚀

## 📞 Suporte

Para dúvidas técnicas, consulte:
1. [CONVERSATIONS_IMPLEMENTATION.md](CONVERSATIONS_IMPLEMENTATION.md) - Documentação técnica completa
2. [CONVERSATIONS_QUICK_START.md](CONVERSATIONS_QUICK_START.md) - Guia rápido
3. [CONVERSATIONS_SUMMARY.md](CONVERSATIONS_SUMMARY.md) - Resumo executivo

---

**Desenvolvido seguindo o padrão de arquitetura do Localiza Saúde Backend** 
