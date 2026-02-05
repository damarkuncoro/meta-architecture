# 🏛️ **@damarkuncoro/meta-architecture**

> **The Constitutional Layer for Digital Systems.**
>
> **Contracts are law. Everything must obey.**
>
> Enterprise-grade Contract-Driven Meta Design (CDMD) kernel. Not a UI framework. Not a config manager. This is the **Constitutional Layer** for your software ecosystem.

[![Version](https://img.shields.io/npm/v/@damarkuncoro/meta-architecture?color=blue)](https://www.npmjs.com/package/@damarkuncoro/meta-architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/damarkuncoro/contract-architecture/ci.yml?branch=main)](https://github.com/damarkuncoro/contract-architecture/actions)

## 📋 **Table of Contents**

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Runtime Transaction Validation](#-runtime-transaction-validation)
- [Ecosystem](#-ecosystem)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 **Overview**

### 🏛️ **What is this?**

This is a **Contract Governance Engine**.

It sits above your frameworks (React, Vue, Node.js) and below your business requirements. It acts as the **single source of truth** for what is "legal" in your system.

-   **For GovTech**: It acts as the digital regulation engine.
-   **For AI Platforms**: It acts as the safety guardrail (AI generates content, CDMD validates it).
-   **For Enterprise**: It acts as the architectural compliance layer.

### ⚖️ **Contract as Law (Non-Negotiable)**

In this architecture, a **Contract** is not a suggestion, a configuration file, or a hint. **It is the law.**

-   **Contract != Config**: Configuration can be changed at runtime; Contracts are immutable laws that govern the system.
-   **No Bypass**: The Runtime Engine, UI Renderers, and AI Agents **MUST NOT** bypass contract constraints under any circumstances.
-   **Universal Subjection**: User input, API responses, and AI-generated content are all **subject to the contract**. If they violate the contract, they are rejected immediately.

`@damarkuncoro/meta-architecture` is an enterprise-grade TypeScript package that implements Clean Architecture principles for contract management. It provides a robust foundation for building scalable, maintainable, and secure contract-based systems with domain-driven design.

## 🧠 **Why Not X?**

Understanding what `@damarkuncoro/meta-architecture` is NOT helps clarify what it IS.

### Why Not JSON Schema?

| Aspect | JSON Schema | Meta-Architecture |
|--------|-------------|-------------------|
| **Purpose** | Validates data shape | Governs behavior & legality |
| **Scope** | Local (data structure) | Global & systemic (entire system) |
| **Enforcement** | Optional/Manual | Mandatory/Automatic |
| **Lifecycle** | No lifecycle awareness | Contract lifecycle (draft → active → deprecated → archived) |
| **Governance** | None | Constitutional layer |
| **Audit Trail** | None | Complete traceability |

**Key Difference:**
- **JSON Schema** validates that data has the right shape (e.g., "email is a string")
- **Meta-Architecture** governs what is legal in the system (e.g., "email must be validated, encrypted, and logged")

### Why Not Policy Engines (OPA, Cedar)?

| Aspect | Policy Engines | Meta-Architecture |
|--------|---------------|-------------------|
| **Purpose** | Decide yes/no for specific requests | Define what is legal to exist |
| **Scope** | Request-level decisions | System-level governance |
| **Focus** | Authorization & access control | Constitutional constraints |
| **Definition** | Policies (rules) | Contracts (laws) |
| **Enforcement** | Per-request | System-wide |
| **Lifecycle** | Policy versioning | Contract lifecycle with formal approval |

**Key Difference:**
- **Policy Engines** decide whether a specific request is allowed (e.g., "Can user X access resource Y?")
- **Meta-Architecture** defines what is legal to exist in the system (e.g., "What properties MUST a user have?")

### Why Not Clean Architecture Only?

| Aspect | Clean Architecture | Meta-Architecture |
|--------|-------------------|-------------------|
| **Purpose** | Define structure and dependencies | Define constitutional constraints |
| **Scope** | Code organization | System governance |
| **Focus** | Layer separation (Domain, Application, Infrastructure) | Contract enforcement |
| **Validation** | Compile-time (TypeScript) | Compile-time + Runtime |
| **Governance** | None | Constitutional layer |
| **Compliance** | Manual | Automated |

**Key Difference:**
- **Clean Architecture** defines how code should be organized (e.g., "Domain layer shouldn't depend on Infrastructure")
- **Meta-Architecture** defines what is legal in the system (e.g., "All user data must be encrypted")

### Summary: The Constitutional Layer

| Approach | What It Does | What It Doesn't Do |
|-----------|---------------|---------------------|
| **JSON Schema** | Validates data shape | Governs behavior, enforces laws |
| **Policy Engines** | Decides authorization | Defines what can exist |
| **Clean Architecture** | Organizes code structure | Enforces constitutional constraints |
| **Meta-Architecture** | **Governs system behavior** | **Replaces all of the above** |

**Meta-Architecture IS:**
- ✅ A **Constitutional Layer** that sits above all of these
- ✅ Defines **what is legal** in the system
- ✅ Enforces **governance** across all layers
- ✅ Provides **audit trails** for compliance
- ✅ Ensures **AI safety** through guardrails

## 🚀 **Key Features**

### Core Architecture
- 🏛️ **Clean Architecture** with proper layer separation
- 🎯 **Domain-Driven Design** with entities, value objects, and aggregates
- 📦 **SOLID Principles** implemented throughout
- 🔄 **Dependency Injection** for testability and flexibility

### Enterprise Features
- 📊 **Contract Registry** with centralized management and discovery
- ✅ **Validation Pipeline** with modular architecture (Security, Performance, Rules)
- 🧩 **Plugin System** for extensible validation (Fraud Detection, Balance Checks)
- 🛡️ **Complex Validation** support (Regex, Range, Enum, Custom Rules)
- 📜 **Spec v1.1 Compliance** ensuring strict adherence to the Formal Contract Specification
- 🚀 **High-Performance Caching** with LRU eviction and intelligent invalidation
- 🔒 **Security Sandboxing** with code execution safety and input sanitization
- 🌐 **Browser/Edge Compatible** (ESM & CJS Dual Build)

### 🧬 **Contract-Driven Meta Architecture (CDMA)**

This project fully implements the CDMA specification, ensuring contracts are the single source of truth for all system behavior.

- **Formal Specification**: Contracts are validated against a strict grammar.
- **Runtime Validation**: Validate runtime data securely against contracts.
- **Safe Sandboxing**: Custom validation logic is executed in a secure, isolated sandbox.

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  (React/Vue/Angular Components, CLI, HTTP Controllers)     │
└─────────────────────┬───────────────────────────────────────┘
                       │
┌─────────────────────▼───────────────────────────────────────┐
│                 APPLICATION LAYER                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ContractRegistry     │ ValidationPipeline         │    │
│  │ CachedContractRegistry │ SecuritySandbox          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                       │
┌─────────────────────▼───────────────────────────────────────┐
│                  DOMAIN LAYER                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ContractEntity     │ ContractName VO              │    │
│  │ ContractVariant    │ ContractCategory VO          │    │
│  │ ContractProp       │ ContractStatus VO            │    │
│  │ Domain Events      │ Domain Errors                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                       │
┌─────────────────────▼───────────────────────────────────────┐
│               INFRASTRUCTURE LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ InMemoryContractRepository │ LruCache             │    │
│  │ InMemoryDomainEventPublisher │ SafeSandbox        │    │
│  │ ContractDefinitionValidator │ InputSanitizer     │    │
│  │ HealthChecker              │ SecurityPolicies    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🏃 **Quick Start**

### Installation

**Node.js (NPM/Yarn/PNPM):**

```bash
npm install @damarkuncoro/meta-architecture
# or
yarn add @damarkuncoro/meta-architecture
# or
pnpm add @damarkuncoro/meta-architecture
```

### Basic Usage

```typescript
import {
  ContractEntity,
  ContractRegistry,
  InMemoryContractRepository,
  InMemoryDomainEventPublisher,
  ValidationPipeline,
  ContractCategory
} from '@damarkuncoro/meta-architecture';

// 1. Define a Contract (The Law)
const buttonContract = ContractEntity.create({
  name: 'Button Component',
  category: ContractCategory.COMPONENT,
  variants: [
    {
      name: 'variant',
      type: 'string',
      values: ['primary', 'secondary'],
      defaultValue: 'primary'
    }
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      required: true
    }
  ]
});

// 2. Set up the Registry
const repository = new InMemoryContractRepository();
const eventPublisher = new InMemoryDomainEventPublisher();
const registry = ContractRegistry.getInstance(repository, eventPublisher);

// 3. Validate & Register
const validationPipeline = new ValidationPipeline();
const validationResult = await validationPipeline.validateContract(buttonContract, {
  existingContracts: [],
  environment: 'production',
  userPermissions: ['admin']
});

if (validationResult.isSuccess) {
  await registry.register(buttonContract);
  console.log('✅ Contract registered successfully!');
} else {
  console.error('❌ Validation failed:', validationResult.error.message);
}
```

### Advanced Usage with Plugins & Monitoring

```typescript
import {
  ValidationPipeline,
  ValidationPluginRegistry,
  ValidationLogger,
  ContractEntity,
  ContractCategory
} from '@damarkuncoro/meta-architecture';

// Custom validation plugin
const customPlugin = {
  metadata: {
    name: 'enterprise-security-plugin',
    version: '1.0.0',
    description: 'Enterprise security validation rules',
    author: 'Your Company',
    dependencies: {}
  },
  rules: [
    {
      name: 'enterprise-security-check',
      description: 'Check enterprise security compliance',
      category: 'security',
      severity: 'error',
      validate: async (contract, context) => {
        // Custom security validation logic
        if (contract.category.value === 'COMPONENT' && !contract.accessibility.supported) {
          return {
             valid: false,
             message: 'Enterprise components must have accessibility support',
             code: 'ENTERPRISE_SECURITY_VIOLATION'
          };
        }
        return null;
      }
    }
  ],
  initialize: async (config) => {
    console.log('Enterprise security plugin initialized');
  },
  destroy: async () => {
    console.log('Enterprise security plugin destroyed');
  },
  getHealth: async () => ({ status: 'healthy' })
};

// Monitoring hooks
const monitoringHooks = {
  onValidationStart: (context) => {
    console.log(`Starting validation: ${context.operation}`);
  },
  onValidationComplete: (context) => {
    console.log(`Validation completed in ${context.duration}ms`);
  },
  onPerformanceThresholdExceeded: (context) => {
    console.warn(`Performance threshold exceeded: ${context.metric} = ${context.value}`);
  }
};

// Set up enhanced pipeline
const logger = new ValidationLogger();
const pluginRegistry = new ValidationPluginRegistry();

const pipeline = new ValidationPipeline({
  logger,
  pluginRegistry,
  monitoringHooks
});

// Register plugin
await pipeline.registerPlugin(customPlugin, {
  enabled: true,
  priority: 10
});
```

## 🛡️ **Runtime Transaction Validation**

Beyond validating contract definitions, this package provides a robust engine for validating **runtime transactions** against those contracts.

### Complex Property Validation

Define strict rules for your contract properties directly in the definition:

```typescript
const transferContract = ContractEntity.create({
  name: 'Fund Transfer',
  category: ContractCategory.TRANSACTION,
  variants: [{ name: 'type', type: 'string', values: ['internal', 'external'] }],
  props: [
    {
      name: 'amount',
      type: 'number',
      required: true,
      validation: {
        min: 1000,
        max: 5000000,
        message: 'Amount must be between 1,000 and 5,000,000'
      }
    },
    {
      name: 'currency',
      type: 'string',
      required: true,
      validation: {
        enum: ['IDR', 'USD', 'SGD']
      }
    },
    {
      name: 'notes',
      type: 'string',
      required: false,
      validation: {
        pattern: '^[a-zA-Z0-9 ]+$', // Alphanumeric only
        message: 'Notes contains invalid characters'
      }
    }
  ]
});
```

### Transaction Plugins

Inject external logic (e.g., Fraud Detection, Balance Checks) into the validation pipeline without modifying core code.

**1. Create a Plugin**

```typescript
import { ITransactionPlugin, Result, TransactionContext } from '@damarkuncoro/meta-architecture';

export class FraudDetectionPlugin implements ITransactionPlugin {
  readonly name = 'fraud-detection';
  readonly version = '1.0.0';

  async validate(context: TransactionContext): Promise<Result<void, string>> {
    // Access runtime context (User IP, ID, etc.)
    if (context.userContext?.ip === '1.2.3.4') {
      return Result.failure('Suspicious IP Address detected');
    }
    return Result.success(undefined);
  }
}
```

**2. Load Plugins Dynamically (Factory Pattern)**

Use the `PluginLoaderService` to load plugins from configuration (JSON/Env):

```typescript
import { 
  TransactionPluginFactory, 
  PluginLoaderService, 
  TransactionPluginRegistry,
  ValidateTransactionUseCase
} from '@damarkuncoro/meta-architecture';

// 1. Register Plugin Type (Auto-registration supported)
TransactionPluginFactory.registerPluginType('fraud-detection', FraudDetectionPlugin);

// 2. Load from Config
const registry = new TransactionPluginRegistry();
const loader = new PluginLoaderService(registry);

await loader.loadPlugins([
  { type: 'fraud-detection', config: { strictMode: true } },
  { type: 'external-balance-check' }
]);

// 3. Execute Validation
const useCase = new ValidateTransactionUseCase(contractRepository, registry);
const result = await useCase.execute({
  contractId: 'fund-transfer-01',
  payload: { amount: 50000, currency: 'IDR' },
  userContext: { ip: '10.0.0.1', userId: 'user-123' }
});
```

## 🌍 **Ecosystem**

This package is the kernel of the **Satu Raya Integrasi** ecosystem. It powers the following packages:

| Package | Description |
|---------|-------------|
| **`@damarkuncoro/meta-architecture`** | **The Core Kernel.** Governance, Validation, and Registry logic. |
| **`@damarkuncoro/ui-core`** | **Contract Definitions.** Reusable atomic/molecule contracts and types. |
| **`@damarkuncoro/ui-components`** | **Headless UI.** Framework-agnostic implementations. |
| **`@damarkuncoro/ui-renderers`** | **React/Vue Renderers.** Maps contracts to visual components. |

## 🏗️ **Project Structure**

This project follows strict architectural guidelines:

- **1 File 1 Class**: Strict file separation.
- **Barrel Exports**: Clean `index.ts` APIs.
- **Strict Layering**: Infrastructure → Application → Domain.

```
src/
├── domain/           # Pure business logic & interfaces
├── application/      # Use cases & application services
├── schemas/          # Contract schemas & definitions
├── infrastructure/   # External implementations
└── shared/           # Shared utilities
```

## 🔒 **Security & Performance**

- **Sandboxing**: Uses Node.js `vm` or browser-compatible safe evaluation for custom logic.
- **Input Sanitization**: Automatic stripping of dangerous characters.
- **LRU Caching**: Built-in caching for high-throughput registry access.

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) (coming soon) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
