# Sistema de Conversas (Chat) - Implementação

## 📋 Visão Geral

Sistema de chat não-real-time entre **Healthcare Providers** e **Customers**, com suporte a:
- ✅ Mensagens de texto
- ✅ Upload de arquivos (Cloudflare R2)
- ✅ Conversas por relacionamento (Provider ↔ Customer)
- ✅ Mensagens vinculadas a appointments específicos
- ✅ Histórico completo e centralizado

## 🎯 Decisão de Arquitetura

### Por que Chat por Relacionamento e não por Appointment?

**Escolhemos:** Uma conversa única por relacionamento Provider-Customer

**Vantagens:**
- ✅ Histórico contínuo e centralizado
- ✅ UX similar a WhatsApp/Messenger
- ✅ Fácil encontrar conversas antigas
- ✅ Constrói relacionamento de longo prazo
- ✅ Customer não precisa lembrar "em qual appointment falei sobre X"

**Flexibilidade:**
- Campo opcional `relatedAppointmentId` permite referenciar appointments específicos
- Permite filtrar mensagens de um appointment específico quando necessário

## 🗄️ Schema do Banco de Dados

### Tabela: `conversations`

```prisma
model conversation {
  id                   String                 @id @default(cuid())
  customerId           String                 @map("customer_id")
  customer             customer               @relation(fields: [customerId], references: [id], onDelete: Cascade)
  healthcareProviderId String                 @map("healthcare_provider_id")
  healthcareProvider   healthcare_provider    @relation(fields: [healthcareProviderId], references: [id], onDelete: Cascade)
  lastMessageAt        DateTime?              @map("last_message_at")
  createdAt            DateTime               @default(now()) @map("created_at")
  updatedAt            DateTime               @updatedAt @map("updated_at")

  messages             conversation_message[]

  @@unique([customerId, healthcareProviderId])
  @@index([customerId])
  @@index([healthcareProviderId])
  @@index([lastMessageAt])
  @@map("conversations")
}
```

**Características:**
- Constraint único: Um par (customerId, healthcareProviderId) = Uma conversa
- `lastMessageAt`: Ordenação de conversas por atividade recente
- Cascade delete: Remove conversas quando customer ou provider são deletados

### Tabela: `conversation_messages`

```prisma
model conversation_message {
  id                   String            @id @default(cuid())
  conversationId       String            @map("conversation_id")
  conversation         conversation      @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId             String            @map("sender_id")
  sender               user              @relation(fields: [senderId], references: [id])
  senderType           MessageSenderType @map("sender_type")
  messageType          MessageType       @map("message_type")
  content              String?
  relatedAppointmentId String?           @map("related_appointment_id")
  relatedAppointment   appointment?      @relation(fields: [relatedAppointmentId], references: [id], onDelete: SetNull)
  fileUrl              String?           @map("file_url")
  fileName             String?           @map("file_name")
  fileSize             Int?              @map("file_size")
  fileMimeType         String?           @map("file_mime_type")
  createdAt            DateTime          @default(now()) @map("created_at")
  updatedAt            DateTime          @updatedAt @map("updated_at")

  @@index([conversationId])
  @@index([senderId])
  @@index([relatedAppointmentId])
  @@index([createdAt])
  @@map("conversation_messages")
}
```

**Características:**
- `senderType`: Determina se é CUSTOMER ou HEALTHCARE_PROVIDER
- `messageType`: TEXT ou FILE
- `content`: Mensagem de texto (obrigatório para TEXT, opcional para FILE)
- Campos de arquivo: `fileUrl`, `fileName`, `fileSize`, `fileMimeType`
- `relatedAppointmentId`: Opcional, vincula mensagem a um appointment específico
- SetNull on delete: Se appointment for deletado, mensagem permanece mas perde vínculo

### Enums

```prisma
enum MessageSenderType {
  CUSTOMER
  HEALTHCARE_PROVIDER
}

enum MessageType {
  TEXT
  FILE
}
```

## 🚀 Endpoints Disponíveis

### 1. Criar/Buscar Conversa

```
POST /conversations
```

**Request Body:**
```json
{
  "participantId": "clxxx123" // ID do customer OU provider
}
```

**Response:** `201 Created`
```json
{
  "conversation": {
    "id": "clxxx456",
    "customerId": "clxxx789",
    "healthcareProviderId": "clxxx012",
    "lastMessageAt": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Lógica:**
- Determina automaticamente quem é customer e quem é provider
- Se conversa já existe, retorna a existente
- Se não existe, cria uma nova

---

### 2. Listar Conversas do Usuário

```
GET /conversations?limit=20&offset=0
```

**Query Params:**
- `limit` (opcional): Default 20, max 100
- `offset` (opcional): Default 0

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "id": "clxxx456",
      "customerId": "clxxx789",
      "healthcareProviderId": "clxxx012",
      "lastMessageAt": "2024-01-15T14:30:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z",
      "customer": {
        "id": "clxxx789",
        "user": {
          "id": "user123",
          "name": "João Silva",
          "firstName": "João",
          "lastName": "Silva",
          "image": "https://..."
        }
      },
      "healthcareProvider": {
        "id": "clxxx012",
        "user": {
          "id": "user456",
          "name": "Dra. Maria Santos",
          "firstName": "Maria",
          "lastName": "Santos",
          "image": "https://..."
        }
      },
      "lastMessage": {
        "id": "msg123",
        "messageType": "TEXT",
        "content": "Olá, tudo bem?",
        "fileUrl": null,
        "fileName": null,
        "createdAt": "2024-01-15T14:30:00Z"
      }
    }
  ]
}
```

**Lógica:**
- Retorna conversas do usuário autenticado
- Ordenadas por `lastMessageAt` (mais recente primeiro)
- Inclui última mensagem de cada conversa
- Inclui dados dos participantes

---

### 3. Enviar Mensagem de Texto

```
POST /conversations/messages/text
```

**Request Body:**
```json
{
  "conversationId": "clxxx456", // Opcional
  "recipientId": "clxxx012",
  "content": "Olá, tudo bem?",
  "relatedAppointmentId": "appt123" // Opcional
}
```

**Response:** `201 Created`
```json
{
  "message": {
    "id": "msg123",
    "conversationId": "clxxx456",
    "senderId": "user123",
    "senderType": "CUSTOMER",
    "messageType": "TEXT",
    "content": "Olá, tudo bem?",
    "fileUrl": null,
    "fileName": null,
    "fileSize": null,
    "fileMimeType": null,
    "relatedAppointmentId": "appt123",
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "sender": {
      "id": "user123",
      "name": "João Silva",
      "firstName": "João",
      "lastName": "Silva",
      "image": "https://..."
    },
    "relatedAppointment": {
      "id": "appt123",
      "scheduledAt": "2024-01-20T15:00:00Z",
      "status": "SCHEDULED"
    }
  }
}
```

**Lógica:**
- Se `conversationId` não for fornecido, cria/busca conversa automaticamente
- Atualiza `lastMessageAt` da conversa
- `content` obrigatório (min 1, max 5000 caracteres)

---

### 4. Enviar Arquivo

```
POST /conversations/messages/file
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): Arquivo (max 10MB)
- `conversationId` (optional): String
- `recipientId` (required): String
- `relatedAppointmentId` (optional): String

**Response:** `201 Created`
```json
{
  "message": {
    "id": "msg456",
    "conversationId": "clxxx456",
    "senderId": "user456",
    "senderType": "HEALTHCARE_PROVIDER",
    "messageType": "FILE",
    "content": null,
    "fileUrl": "https://pub-xxx.r2.dev/messages/1234567890-abc123-documento.pdf",
    "fileName": "documento.pdf",
    "fileSize": 524288,
    "fileMimeType": "application/pdf",
    "relatedAppointmentId": null,
    "createdAt": "2024-01-15T15:00:00Z",
    "updatedAt": "2024-01-15T15:00:00Z",
    "sender": {
      "id": "user456",
      "name": "Dra. Maria Santos",
      "firstName": "Maria",
      "lastName": "Santos",
      "image": "https://..."
    },
    "relatedAppointment": null
  }
}
```

**Lógica:**
- Upload para Cloudflare R2
- Nome do arquivo sanitizado
- Key gerada: `messages/{timestamp}-{random}-{filename}`
- Limite de 10MB por arquivo

---

### 5. Listar Mensagens da Conversa

```
GET /conversations/{conversationId}/messages?limit=50&offset=0&relatedAppointmentId=appt123
```

**Path Params:**
- `conversationId` (required): ID da conversa

**Query Params:**
- `limit` (optional): Default 50, max 100
- `offset` (optional): Default 0
- `relatedAppointmentId` (optional): Filtrar por appointment específico

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg789",
      "conversationId": "clxxx456",
      "senderId": "user123",
      "senderType": "CUSTOMER",
      "messageType": "TEXT",
      "content": "Quando é minha próxima consulta?",
      "fileUrl": null,
      "fileName": null,
      "fileSize": null,
      "fileMimeType": null,
      "relatedAppointmentId": "appt123",
      "createdAt": "2024-01-15T16:00:00Z",
      "updatedAt": "2024-01-15T16:00:00Z",
      "sender": {
        "id": "user123",
        "name": "João Silva",
        "firstName": "João",
        "lastName": "Silva",
        "image": "https://..."
      },
      "relatedAppointment": {
        "id": "appt123",
        "scheduledAt": "2024-01-20T15:00:00Z",
        "status": "SCHEDULED"
      }
    }
  ]
}
```

**Lógica:**
- Ordenadas por `createdAt` DESC (mais recente primeiro)
- Paginação via `limit` e `offset`
- Filtro opcional por `relatedAppointmentId`

---

### 6. Deletar Mensagem

```
DELETE /conversations/messages/{messageId}
```

**Path Params:**
- `messageId` (required): ID da mensagem

**Response:** `204 No Content`

**Lógica:**
- Apenas o sender pode deletar a própria mensagem
- Se mensagem tem arquivo, deleta do R2 também
- Mensagem é removida permanentemente

## 🔧 Configuração Necessária

### Variáveis de Ambiente (.env)

```env
# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

### Como obter credenciais Cloudflare R2:

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **R2 Object Storage**
3. Crie um bucket (ex: `localiza-saude-files`)
4. Vá em **Manage R2 API Tokens**
5. Crie um token com permissões de leitura e escrita
6. Copie:
   - Account ID
   - Access Key ID
   - Secret Access Key
7. Configure domínio público do bucket:
   - Vá em bucket → Settings → Public Access
   - Configure custom domain ou use o padrão `pub-xxxx.r2.dev`

### Migration

```bash
# Gerar Prisma Client
bun run generate

# Criar tabelas no banco
bun run migrate
```

## 📁 Estrutura de Arquivos Criados

```
src/
├── http/
│   ├── controllers/
│   │   └── conversations/
│   │       ├── send-text-message-controller.ts
│   │       ├── send-file-message-controller.ts
│   │       ├── get-conversation-messages-controller.ts
│   │       ├── get-conversations-controller.ts
│   │       ├── delete-message-controller.ts
│   │       └── get-or-create-conversation-controller.ts
│   ├── repositories/
│   │   └── conversations/
│   │       ├── conversation-repository-contract.ts
│   │       └── conversation-repository-implementation.ts
│   ├── useCases/
│   │   └── conversations/
│   │       ├── send-text-message-use-case.ts
│   │       ├── send-file-message-use-case.ts
│   │       ├── get-conversation-messages-use-case.ts
│   │       ├── get-conversations-use-case.ts
│   │       ├── delete-message-use-case.ts
│   │       └── get-or-create-conversation-use-case.ts
│   ├── routes/
│   │   └── conversations/
│   │       ├── send-text-message.ts
│   │       ├── send-file-message.ts
│   │       ├── get-conversation-messages.ts
│   │       ├── get-conversations.ts
│   │       ├── delete-message.ts
│   │       └── get-or-create-conversation.ts
│   ├── presenters/
│   │   └── conversation-presenter.ts
│   └── services/
│       └── storage.service.ts
├── schemas/
│   ├── conversations.ts
│   └── routes/
│       └── conversations/
│           ├── send-text-message.ts
│           ├── send-file-message.ts
│           ├── get-conversation-messages.ts
│           ├── get-conversations.ts
│           ├── delete-message.ts
│           └── get-or-create-conversation.ts
└── env.ts (updated)

prisma/
└── schema/
    ├── messages.prisma (new)
    ├── customers.prisma (updated)
    ├── healthcare_providers.prisma (updated)
    ├── appointments.prisma (updated)
    └── users.prisma (updated)
```

**Total: ~30 arquivos criados/modificados**

## 🔄 Fluxos de Uso

### Fluxo 1: Customer inicia conversa pela primeira vez

```
1. Customer acessa detalhes do appointment
2. Clica em "Enviar mensagem ao provider"
3. Frontend chama: POST /conversations/messages/text
   Body: {
     recipientId: "provider-id",
     content: "Olá, preciso reagendar",
     relatedAppointmentId: "appt-id"
   }
4. Backend:
   - Identifica que customer é remetente (via JWT)
   - Busca/cria conversa automaticamente
   - Cria mensagem TEXT
   - Atualiza lastMessageAt
5. Retorna mensagem criada
```

### Fluxo 2: Provider envia arquivo

```
1. Provider acessa lista de conversas
2. Seleciona conversa com customer
3. Clica em "Anexar arquivo"
4. Frontend chama: POST /conversations/messages/file
   FormData: {
     file: File,
     conversationId: "conv-id"
   }
5. Backend:
   - Valida arquivo (max 10MB)
   - Upload para R2
   - Cria mensagem FILE com URL
   - Atualiza lastMessageAt
6. Retorna mensagem com fileUrl
```

### Fluxo 3: Listar conversas ativas

```
1. User (customer ou provider) acessa aba "Mensagens"
2. Frontend chama: GET /conversations?limit=20
3. Backend:
   - Identifica role do user
   - Busca conversas (customer ou provider)
   - Ordena por lastMessageAt DESC
   - Inclui última mensagem
   - Inclui dados dos participantes
4. Frontend renderiza lista de conversas
```

### Fluxo 4: Filtrar mensagens de um appointment

```
1. User está na tela de appointment details
2. Clica em "Ver mensagens deste appointment"
3. Frontend chama: 
   GET /conversations/{conversationId}/messages?relatedAppointmentId=appt-id
4. Backend retorna apenas mensagens vinculadas àquele appointment
5. Frontend mostra histórico contextual
```

## 🔐 Segurança

- ✅ Todas as rotas protegidas com autenticação (JWT)
- ✅ User só pode enviar mensagens em conversas onde participa
- ✅ User só pode deletar próprias mensagens
- ✅ Upload limitado a 10MB
- ✅ Nomes de arquivos sanitizados
- ✅ Validação completa com Zod

## 📊 Storage (Cloudflare R2)

### Estrutura de Pastas

```
bucket-name/
└── messages/
    ├── 1705324800000-abc123-documento.pdf
    ├── 1705324900000-def456-exame.jpg
    └── 1705325000000-ghi789-receita.png
```

### Nome do Arquivo

Formato: `{timestamp}-{random}-{sanitized-filename}`

- `timestamp`: Date.now()
- `random`: String aleatória
- `sanitized-filename`: Nome original sem caracteres especiais

### Bun S3Client Nativo

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

// Presign URL (futuro)
const url = client.file(key).presign({ expiresIn: 3600 });
```

## 🎨 Apresentação (Presenters)

### conversationPresenter

Transforma dados do banco em formato otimizado para frontend:
- Remove campos desnecessários
- Inclui dados dos participantes
- Formata última mensagem
- Limpa estrutura aninhada

### messagePresenter

Formata mensagens individuais:
- Inclui dados do sender
- Inclui appointment relacionado (se houver)
- Padroniza response

## 🧪 Testes (TODO)

```bash
# Criar testes unitários
src/http/useCases/conversations/__tests__/
├── send-text-message-use-case.test.ts
├── send-file-message-use-case.test.ts
└── get-conversations-use-case.test.ts

# Padrão existente do projeto
- Mock apenas Prisma
- Testar lógica real dos use cases
- Usar Bun Test Runner
```

## 📱 Integração com Frontend (Exemplo React Native)

```typescript
// Enviar mensagem de texto
const sendTextMessage = async (recipientId: string, content: string, appointmentId?: string) => {
  const response = await fetch(`${API_URL}/conversations/messages/text`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientId,
      content,
      relatedAppointmentId: appointmentId,
    }),
  });
  
  return response.json();
};

// Enviar arquivo
const sendFile = async (recipientId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('recipientId', recipientId);
  
  const response = await fetch(`${API_URL}/conversations/messages/file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
};

// Listar conversas
const getConversations = async () => {
  const response = await fetch(`${API_URL}/conversations?limit=20`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// Listar mensagens
const getMessages = async (conversationId: string, appointmentId?: string) => {
  const url = new URL(`${API_URL}/conversations/${conversationId}/messages`);
  if (appointmentId) {
    url.searchParams.append('relatedAppointmentId', appointmentId);
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};
```

## 🚀 Próximos Passos (Melhorias Futuras)

### Curto Prazo
- [ ] Criar coleção Bruno para testes
- [ ] Adicionar testes unitários
- [ ] Documentar no Swagger/OpenAPI

### Médio Prazo
- [ ] Notificações push quando receber mensagem
- [ ] Indicador de "não lida" (unread count)
- [ ] Suporte a mais tipos de arquivo (imagens, vídeos)
- [ ] Preview de imagens
- [ ] Compressão de imagens antes do upload

### Longo Prazo
- [ ] WebSocket para chat em tempo real (opcional)
- [ ] Mensagens de áudio
- [ ] Reações em mensagens (👍, ❤️, etc)
- [ ] Busca em mensagens
- [ ] Exportar conversa em PDF

## 📝 Observações Importantes

1. **Chat Não é Real-Time**: 
   - Usuários precisam atualizar/fazer polling
   - Para real-time, implementar WebSocket no futuro

2. **Conversas são Permanentes**:
   - Conversas não podem ser deletadas
   - Apenas mensagens individuais podem ser removidas

3. **Arquivos no R2**:
   - Arquivos deletados não são recuperáveis
   - Backup do bucket R2 é responsabilidade da infraestrutura

4. **Paginação**:
   - Sempre usar paginação para performance
   - Limite máximo: 100 itens por página

5. **Appointment Vinculado**:
   - É opcional vincular mensagem a appointment
   - Se appointment for deletado, mensagem permanece

## 🎉 Conclusão

Sistema completo de chat implementado com:
- ✅ 6 endpoints funcionais
- ✅ Upload de arquivos (R2)
- ✅ Arquitetura limpa e escalável
- ✅ Validação completa
- ✅ Segurança (JWT + validações)
- ✅ Paginação
- ✅ Presenters para dados limpos
- ✅ Seguindo 100% o padrão do projeto

**Total de arquivos criados/modificados: ~30**

A implementação está pronta para uso! 🚀