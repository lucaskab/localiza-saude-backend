# Conversas - Guia Rápido de Início

## ✅ Checklist de Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=localiza-saude-files
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**Como obter as credenciais:**
1. Acesse https://dash.cloudflare.com/
2. Navegue até **R2 Object Storage**
3. Clique em **Create bucket** → Nome: `localiza-saude-files`
4. Vá em **Manage R2 API Tokens** → **Create API Token**
5. Permissões: **Object Read & Write**
6. Copie: Account ID, Access Key ID, Secret Access Key
7. Em **Settings do bucket** → **Public Access** → Configure domínio ou use o padrão

### 2. Database

```bash
# Se ainda não rodou
bun run generate
bun run migrate
```

### 3. Servidor

```bash
bun run dev
```

Você verá:
```
✓ Loading: send-text-message.ts
✓ Loading: send-file-message.ts
...
✅ Server running on http://localhost:3333
```

## 🚀 Teste Rápido (5 minutos)

### Passo 1: Obter Token de Autenticação

```bash
# Faça login via Google (ou método configurado)
# Endpoint: POST /api/auth/...
# Copie o token retornado
```

### Passo 2: Criar uma Conversa

```bash
curl -X POST http://localhost:3333/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "RECIPIENT_ID_HERE"
  }'
```

**Resposta esperada:**
```json
{
  "conversation": {
    "id": "clxxx123",
    "customerId": "...",
    "healthcareProviderId": "...",
    "lastMessageAt": null,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Passo 3: Enviar Mensagem de Texto

```bash
curl -X POST http://localhost:3333/conversations/messages/text \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_ID_HERE",
    "content": "Olá! Esta é uma mensagem de teste."
  }'
```

### Passo 4: Listar Conversas

```bash
curl -X GET http://localhost:3333/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Passo 5: Enviar Arquivo (Opcional)

```bash
curl -X POST http://localhost:3333/conversations/messages/file \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/document.pdf" \
  -F "recipientId=RECIPIENT_ID_HERE"
```

## 📱 Teste via Bruno (Recomendado)

1. Abra **Bruno**
2. Importe a coleção: `bruno-collection/`
3. Configure **Environment Variables**:
   - `baseUrl`: `http://localhost:3333`
   - `authToken`: Seu JWT token
   - `recipientId`: ID de um customer ou provider
   - `customerId`: ID de um customer
   - `healthcareProviderId`: ID de um provider
4. Vá em **Conversations/** e execute os requests

## 🔍 Verificação de Funcionamento

### Database

```sql
-- Verificar conversas criadas
SELECT * FROM conversations;

-- Verificar mensagens
SELECT * FROM conversation_messages;
```

### Logs do Servidor

Você deve ver:
```
✓ Loading: send-text-message.ts
✓ Loading: send-file-message.ts
✓ Loading: get-conversation-messages.ts
✓ Loading: get-conversations.ts
✓ Loading: delete-message.ts
✓ Loading: get-or-create-conversation.ts
```

### Cloudflare R2

1. Acesse seu bucket no dashboard
2. Após upload, verá: `messages/1234567890-abc123-filename.pdf`

## ⚠️ Troubleshooting

### Erro: "R2 configuration is incomplete"

**Solução:** Verifique se todas as variáveis R2 estão no `.env`

```bash
# Verifique
cat .env | grep R2
```

### Erro: "Module '@prisma/client' has no exported member 'conversation'"

**Solução:** Regenere o Prisma Client

```bash
bun run generate
```

### Erro: "File size exceeds limit"

**Solução:** Arquivo maior que 10MB. Ajuste em `src/http/server.ts`:

```typescript
fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});
```

### Erro 401 Unauthorized

**Solução:** Token inválido ou expirado. Faça login novamente.

### Arquivos não aparecem no R2

**Checklist:**
- [ ] Credenciais corretas no `.env`
- [ ] Bucket criado
- [ ] API Token tem permissões de write
- [ ] Endpoint correto (inclui account ID)

## 📖 IDs Necessários para Testes

### Como obter IDs

```bash
# Listar customers
curl http://localhost:3333/customers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Listar healthcare providers
curl http://localhost:3333/healthcare-providers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Listar appointments
curl http://localhost:3333/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Fluxo Completo de Teste

```bash
# 1. Obter token (via login)
TOKEN="your-jwt-token-here"

# 2. Definir IDs
CUSTOMER_ID="clxxx123"
PROVIDER_ID="clxxx456"

# 3. Criar conversa (como customer)
CONVERSATION=$(curl -X POST http://localhost:3333/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"participantId\": \"$PROVIDER_ID\"}" \
  | jq -r '.conversation.id')

echo "Conversa criada: $CONVERSATION"

# 4. Enviar mensagem
curl -X POST http://localhost:3333/conversations/messages/text \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONVERSATION\",
    \"recipientId\": \"$PROVIDER_ID\",
    \"content\": \"Olá doutor, tudo bem?\"
  }"

# 5. Listar mensagens
curl -X GET "http://localhost:3333/conversations/$CONVERSATION/messages" \
  -H "Authorization: Bearer $TOKEN"

# 6. Enviar arquivo
curl -X POST http://localhost:3333/conversations/messages/file \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "conversationId=$CONVERSATION" \
  -F "recipientId=$PROVIDER_ID"

# 7. Listar conversas
curl -X GET http://localhost:3333/conversations \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Endpoints Disponíveis

| Método | Endpoint | Auth | Body/Params |
|--------|----------|------|-------------|
| POST | `/conversations` | ✅ | `{ participantId }` |
| GET | `/conversations` | ✅ | `?limit&offset` |
| POST | `/conversations/messages/text` | ✅ | `{ recipientId, content, ... }` |
| POST | `/conversations/messages/file` | ✅ | `FormData: file, recipientId, ...` |
| GET | `/conversations/:id/messages` | ✅ | `?limit&offset&relatedAppointmentId` |
| DELETE | `/conversations/messages/:id` | ✅ | - |

## ✅ Pronto!

Sistema funcionando! Próximos passos:

1. ✅ Testar todos endpoints via Bruno
2. ✅ Verificar uploads no Cloudflare R2 Dashboard
3. ✅ Integrar com frontend (React Native/Expo)
4. ⏭️ Implementar notificações push (futuro)
5. ⏭️ Adicionar testes unitários (opcional)

Para mais detalhes, consulte `CONVERSATIONS_IMPLEMENTATION.md`.