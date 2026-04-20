# Conversations API Documentation

Sistema de chat/conversas entre pacientes (customers) e profissionais de saúde (healthcare providers).

## Visão Geral

O sistema de conversas permite a comunicação em tempo real através de mensagens de texto e arquivos entre pacientes e profissionais de saúde. Todas as rotas são protegidas por autenticação.

## Autenticação

Todas as rotas requerem autenticação via Bearer Token no header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Criar/Buscar Conversa

Cria uma nova conversa ou retorna uma existente com um participante específico.

**Endpoint:** `POST /conversations`

**Request Body:**
```json
{
  "participantId": "cm123abc456def" // CUID do participante
}
```

**Response (200):**
```json
{
  "conversation": {
    "id": "cm789ghi012jkl",
    "customerId": "cm123abc456def",
    "healthcareProviderId": "cm456def789ghi",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "customer": {
      "id": "cm123abc456def",
      "name": "João Silva",
      "email": "joao@example.com",
      "image": "https://..."
    },
    "healthcareProvider": {
      "id": "cm456def789ghi",
      "name": "Dra. Maria Santos",
      "email": "maria@example.com",
      "image": "https://..."
    }
  }
}
```

---

### 2. Listar Conversas do Usuário

Lista todas as conversas do usuário autenticado.

**Endpoint:** `GET /conversations`

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados (1-100, padrão: 20)
- `offset` (opcional): Número de registros para pular (padrão: 0)

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "cm789ghi012jkl",
      "customerId": "cm123abc456def",
      "healthcareProviderId": "cm456def789ghi",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z",
      "customer": {
        "id": "cm123abc456def",
        "name": "João Silva",
        "email": "joao@example.com",
        "image": "https://..."
      },
      "healthcareProvider": {
        "id": "cm456def789ghi",
        "name": "Dra. Maria Santos",
        "email": "maria@example.com",
        "image": "https://..."
      },
      "lastMessage": {
        "id": "cm999xyz123abc",
        "content": "Olá, como posso ajudar?",
        "messageType": "TEXT",
        "createdAt": "2024-01-15T14:20:00Z",
        "senderId": "cm456def789ghi",
        "senderType": "HEALTHCARE_PROVIDER"
      },
      "unreadCount": 2
    }
  ]
}
```

---

### 3. Enviar Mensagem de Texto

Envia uma mensagem de texto em uma conversa.

**Endpoint:** `POST /conversations/messages/text`

**Request Body:**
```json
{
  "conversationId": "cm789ghi012jkl", // Opcional - cria nova conversa se não fornecido
  "recipientId": "cm456def789ghi",    // CUID do destinatário
  "content": "Olá! Gostaria de agendar uma consulta.",
  "relatedAppointmentId": "cm111aaa222bbb" // Opcional
}
```

**Response (201):**
```json
{
  "message": {
    "id": "cm999xyz123abc",
    "conversationId": "cm789ghi012jkl",
    "senderId": "cm123abc456def",
    "senderType": "CUSTOMER",
    "messageType": "TEXT",
    "content": "Olá! Gostaria de agendar uma consulta.",
    "fileUrl": null,
    "fileName": null,
    "fileSize": null,
    "fileMimeType": null,
    "relatedAppointmentId": "cm111aaa222bbb",
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

---

### 4. Enviar Mensagem com Arquivo

Envia uma mensagem com arquivo anexado.

**Endpoint:** `POST /conversations/messages/file`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: Arquivo (máximo 10MB)
- `recipientId`: CUID do destinatário
- `conversationId` (opcional): CUID da conversa
- `relatedAppointmentId` (opcional): CUID do agendamento relacionado

**Response (201):**
```json
{
  "message": {
    "id": "cm999xyz123abc",
    "conversationId": "cm789ghi012jkl",
    "senderId": "cm123abc456def",
    "senderType": "CUSTOMER",
    "messageType": "FILE",
    "content": null,
    "fileUrl": "https://storage.example.com/messages/123-abc-documento.pdf",
    "fileName": "documento.pdf",
    "fileSize": 245678,
    "fileMimeType": "application/pdf",
    "relatedAppointmentId": null,
    "createdAt": "2024-01-15T14:35:00Z",
    "updatedAt": "2024-01-15T14:35:00Z"
  }
}
```

---

### 5. Listar Mensagens de uma Conversa

Lista as mensagens de uma conversa específica.

**Endpoint:** `GET /conversations/:conversationId/messages`

**Path Parameters:**
- `conversationId`: CUID da conversa

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados (1-100, padrão: 50)
- `offset` (opcional): Número de registros para pular (padrão: 0)
- `relatedAppointmentId` (opcional): Filtrar por agendamento específico

**Response (200):**
```json
{
  "messages": [
    {
      "id": "cm999xyz123abc",
      "conversationId": "cm789ghi012jkl",
      "senderId": "cm123abc456def",
      "senderType": "CUSTOMER",
      "messageType": "TEXT",
      "content": "Olá! Gostaria de agendar uma consulta.",
      "fileUrl": null,
      "fileName": null,
      "fileSize": null,
      "fileMimeType": null,
      "relatedAppointmentId": null,
      "createdAt": "2024-01-15T14:30:00Z",
      "updatedAt": "2024-01-15T14:30:00Z",
      "sender": {
        "id": "cm123abc456def",
        "name": "João Silva",
        "email": "joao@example.com",
        "image": "https://..."
      }
    }
  ]
}
```

---

### 6. Deletar Mensagem

Deleta uma mensagem específica. Se a mensagem contém arquivo, o arquivo também é removido do storage.

**Endpoint:** `DELETE /conversations/messages/:messageId`

**Path Parameters:**
- `messageId`: CUID da mensagem

**Response (200):**
```json
{
  "message": "Message deleted successfully"
}
```

---

## Tipos de Dados

### MessageSenderType
- `CUSTOMER`: Paciente
- `HEALTHCARE_PROVIDER`: Profissional de saúde

### MessageType
- `TEXT`: Mensagem de texto
- `FILE`: Mensagem com arquivo

---

## Regras de Negócio

1. **Criação Automática de Conversa**: Se `conversationId` não for fornecido ao enviar mensagem, uma nova conversa é criada automaticamente
2. **Determinação de Participantes**: O sistema identifica automaticamente se o usuário é CUSTOMER ou HEALTHCARE_PROVIDER baseado no role
3. **Upload de Arquivos**: Máximo de 10MB por arquivo
4. **Paginação**: Todas as listagens suportam paginação via `limit` e `offset`
5. **Ordenação**: 
   - Conversas: ordenadas por `lastMessageAt` (mais recente primeiro)
   - Mensagens: ordenadas por `createdAt` (mais recente primeiro)

---

## Códigos de Erro

- `400 Bad Request`: Dados inválidos ou ausentes
- `401 Unauthorized`: Token inválido ou ausente
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

---

## Notas Técnicas

- Todas as rotas usam o middleware `authMiddleware`
- O usuário autenticado é obtido via `request.getCurrentUser()`
- Validação de schemas via Zod
- Suporte a multipart/form-data via `@fastify/multipart`
- Storage de arquivos via Cloudflare R2