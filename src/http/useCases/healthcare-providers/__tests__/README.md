# Dashboard Use Case Tests

## Princípio

**Testamos o código REAL, não criamos duplicatas!**

- ✅ Mockamos APENAS o Prisma (dependência externa)
- ✅ Testamos a lógica REAL de cálculos
- ❌ Não duplicamos funções de cálculo

## Rodando os Testes

```bash
# Rodar testes do dashboard
bun test get-dashboard-use-case.test.ts

# Modo watch
bun test --watch
```

## O Que É Testado

### 1. Today's Appointments
- Contagem total
- Separação por status (scheduled, completed, cancelled)

### 2. Monthly Revenue  
- Soma de valores
- Cálculo de crescimento %
- Edge case: divisão por zero

### 3. Cancellation Rate
- Cálculo de taxa %
- Formatação 2 casas decimais

### 4. Popular Procedures
- Agregação por procedimento
- Ordenação por quantidade
- Exclusão de cancelados na receita

### 5. Week Trend
- Geração de 7 dias
- Formato correto

## Estrutura do Teste

```typescript
test("should calculate revenue growth", async () => {
  // 1. ARRANGE: Mock dados do Prisma
  mockPrisma.appointment.findMany
    .mockResolvedValueOnce([{ totalPriceCents: 150 }])
    .mockResolvedValueOnce([{ totalPriceCents: 100 }]);

  // 2. ACT: Executa o código REAL
  const result = await getDashboardUseCase.execute("id");

  // 3. ASSERT: Verifica cálculo REAL
  expect(result.monthlyRevenue.growthPercentage).toBe(50.0);
});
```

## Por Que Não Usamos Helpers

❌ **ERRADO**:
```typescript
// helpers.ts - DUPLICA LÓGICA!
export const calculateGrowth = (current, last) => 
  ((current - last) / last) * 100;

// test - testa a função duplicada, não o código real
expect(calculateGrowth(150, 100)).toBe(50);
```

✅ **CERTO**:
```typescript
// test - testa o use case REAL
mockPrisma.appointment.findMany
  .mockResolvedValueOnce([{ totalPriceCents: 150 }])
  .mockResolvedValueOnce([{ totalPriceCents: 100 }]);

const result = await getDashboardUseCase.execute("id");
expect(result.monthlyRevenue.growthPercentage).toBe(50.0);
```

## Benefícios

✅ Sem duplicação de código
✅ Testa a lógica real de produção  
✅ Se mudarmos a lógica, o teste pega
✅ Código mais limpo e manutenível
