# 🧪 Testing Guide - Localiza Saúde Backend

## Overview

Este projeto usa o **Bun Test Runner** nativo para testes unitários.

**Princípio importante**: Testamos o código REAL, não duplicamos lógica!

## Rodando os Testes

```bash
# Rodar todos os testes
bun test

# Rodar testes específicos
bun test get-dashboard-use-case.test.ts

# Rodar com watch mode
bun test --watch
```

## Filosofia de Testes

### ✅ O Que Fazemos

- **Mockamos APENAS dependências externas** (Prisma, APIs, etc)
- **Testamos a lógica REAL** do código
- Evitamos duplicação de código

### ❌ O Que NÃO Fazemos

- ❌ Não criamos funções auxiliares que duplicam lógica de produção
- ❌ Não testamos mocks (isso não testa nada!)
- ❌ Não copiamos código só para testar

## Exemplo Correto

```typescript
// ❌ ERRADO - Duplica lógica
// helpers.ts
export const calculateGrowth = (current, last) => {
  return ((current - last) / last) * 100;
};

// ✅ CERTO - Testa o código real
test("should calculate growth", async () => {
  // Mock apenas a dependência (Prisma)
  mockPrisma.appointment.findMany
    .mockResolvedValueOnce([{ totalPriceCents: 150 }])
    .mockResolvedValueOnce([{ totalPriceCents: 100 }]);

  // Executa o código REAL
  const result = await getDashboardUseCase.execute("id");

  // Verifica o resultado REAL
  expect(result.monthlyRevenue.growthPercentage).toBe(50.0);
});
```

## Estrutura dos Testes

```
src/
├── test/
│   └── setup.ts              # Setup global
└── http/
    └── useCases/
        └── healthcare-providers/
            └── __tests__/
                ├── README.md
                └── get-dashboard-use-case.test.ts
```

## Testes Implementados

### Dashboard Use Case

**O que é mockado**: Apenas o Prisma (dependência externa)
**O que é testado**: Toda a lógica real de cálculos

- ✅ Contagem de appointments por status
- ✅ Cálculo de receita mensal
- ✅ Cálculo de crescimento percentual
- ✅ Divisão por zero (edge case)
- ✅ Crescimento negativo
- ✅ Taxa de cancelamento
- ✅ Agregação de procedimentos
- ✅ Filtro de appointments cancelados
- ✅ Formatação de números
- ✅ Geração de trend semanal

## Comandos Úteis

```bash
# Rodar testes
bun test

# Rodar em modo watch
bun test --watch

# Rodar com mais detalhes
bun test --verbose

# Rodar teste específico
bun test --test-name-pattern="revenue"
```

## Como Escrever Testes

### 1. Mock Apenas Dependências Externas

```typescript
const mockPrisma = {
  appointment: {
    findMany: mock(() => Promise.resolve([])),
  },
};

mock.module("@/database/prisma", () => ({
  prisma: mockPrisma,
}));
```

### 2. Configure os Dados de Teste

```typescript
mockPrisma.appointment.findMany.mockResolvedValueOnce([
  { totalPriceCents: 10000 },
  { totalPriceCents: 15000 },
]);
```

### 3. Execute o Código Real

```typescript
const result = await getDashboardUseCase.execute("provider-id");
```

### 4. Verifique o Resultado Real

```typescript
expect(result.monthlyRevenue.currentMonth).toBe(25000);
```

## Best Practices

✅ **DO**
- Mock apenas dependências externas
- Teste a lógica real do código
- Teste edge cases (divisão por zero, listas vazias)
- Use nomes descritivos nos testes

❌ **DON'T**
- Não duplique lógica de produção em helpers
- Não teste a implementação, teste o comportamento
- Não faça testes dependerem uns dos outros

## Recursos

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Bun Mocking](https://bun.sh/docs/test/mocks)

---

**Lembre-se**: Se você está copiando código para os testes, está fazendo errado! ⚠️
