# Lexicon

Aplicativo de dicionário de inglês desenvolvido em **React Native e TypeScript**, com listagem paginada de palavras, consulta de definições, favoritos e histórico vinculados à conta do usuário.

> This is a challenge by [Coodesh](https://coodesh.com/).

## Funcionalidades

- Listagem de palavras em inglês com rolagem infinita e busca.
- Consulta de palavras, definições, exemplos e representação fonética pela [Free Dictionary API](https://dictionaryapi.dev/).
- Adição e remoção de palavras dos favoritos.
- Histórico de palavras visualizadas.
- Cadastro e autenticação de usuários com Firebase Authentication.
- Persistência de favoritos e histórico por usuário no Cloud Firestore.
- Cache de consultas com TanStack Query.
- Vocabulário local em SQLite, com aproximadamente **370.100 palavras**.

**Escopo atual:** a aplicação foi desenvolvida e testada no **Android**. A versão iOS ainda não foi validada. A reprodução de áudio não foi implementada (recurso opcional do desafio).

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Aplicação | React Native 0.88.1, React 19.3.0, TypeScript |
| Navegação | React Navigation (Native Stack e Bottom Tabs) |
| Estado | Redux Toolkit, React Redux |
| Requisições e cache | Axios, TanStack Query |
| Autenticação | Firebase Authentication |
| Persistência remota | Cloud Firestore |
| Persistência local | React Native Nitro SQLite, Nitro Modules |
| Interface | Lucide React Native, React Native SVG |
| Testes | Jest, React Native Testing Library |

## Arquitetura

O projeto organiza responsabilidades em camadas inspiradas na **Clean Architecture**:

```text
src/
├── application/          # Casos de uso e regras de aplicação
├── domain/               # Entidades e conceitos do domínio
├── infrastructure/       # API, banco de dados e repositórios
├── presentation/         # Telas, componentes e navegação
├── shared/               # Constantes e utilitários compartilhados
├── types/                # Tipos TypeScript
└── dependency-injection/ # Composição e injeção de dependências
```

Nas telas, a lógica de estado, consultas, eventos e navegação fica concentrada em `builder.ts`; o `index.tsx` é responsável pela composição visual.

## Investigação e decisões técnicas

### 1. Origem do vocabulário

**Problema:** a Free Dictionary API permite consultar palavras individualmente, mas não fornece um endpoint para listar todo o vocabulário.

**Alternativas avaliadas:** carregar um arquivo JSON em memória, hospedar as palavras no Firebase ou utilizar um banco de dados local.

**Decisão:** utilizar uma base SQLite pré-populada a partir do conjunto público [dwyl/english-words](https://github.com/dwyl/english-words), com cerca de 370.100 palavras. Isso permite consultas locais e paginação sem transferir todo o vocabulário de um serviço remoto a cada uso.

### 2. Definições e fonética

**Decisão:** consultar a [Free Dictionary API](https://dictionaryapi.dev/) somente quando for necessário obter os detalhes de uma palavra. A API fornece significados, exemplos e, quando disponíveis, dados fonéticos.

### 3. Cache das requisições

**Problema:** consultas repetidas à mesma palavra poderiam gerar chamadas desnecessárias.

**Decisão:** utilizar TanStack Query, com chaves de consulta específicas por palavra. O cache reduz solicitações redundantes e permite controlar quando os dados devem ser considerados desatualizados.

### 4. Dados associados ao usuário

**Problema:** favoritos e histórico precisam pertencer à conta autenticada.

**Decisão:** utilizar Firebase Authentication para autenticação e Cloud Firestore para persistência dos dados associados ao identificador do usuário.

### 5. Separação de responsabilidades

**Decisão:** separar apresentação, casos de uso, domínio e infraestrutura, com composição de dependências centralizada. Os *builders* encapsulam a lógica das telas para reduzir o acoplamento entre interface e comportamento.

## Pré-requisitos

Para executar a versão Android, configure:

- **Node.js 22.11.0 ou superior** e npm.
- **JDK** compatível com a versão do Android Gradle Plugin utilizada no projeto.
- **Android Studio**, Android SDK e um emulador Android ou dispositivo físico com depuração USB habilitada.
- Variáveis de ambiente do Android SDK (`ANDROID_HOME` e caminhos de ferramentas, conforme seu sistema).
- Um projeto Firebase com **Authentication** e **Cloud Firestore** configurados.

Consulte a documentação oficial de [configuração do ambiente React Native](https://reactnative.dev/docs/set-up-your-environment) para instalar e validar as ferramentas do Android.

## Instalação e configuração

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd lexicon-mobile
```

Substitua `<URL_DO_REPOSITORIO>` pelo endereço real do projeto no GitHub.

### 2. Instalar as dependências

```bash
npm install
```

Se o repositório incluir `package-lock.json`, prefira `npm ci` para reproduzir as versões registradas no arquivo de lock.

### 3. Configurar o Firebase no Android

1. Crie ou selecione um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Registre um aplicativo Android usando o **applicationId** configurado no projeto.
3. Baixe o arquivo `google-services.json` do aplicativo Android registrado.
4. Coloque o arquivo em `android/app/google-services.json`.
5. Habilite o método de autenticação por **e-mail e senha** no Firebase Authentication.
6. Crie o banco Cloud Firestore e configure as regras de segurança adequadas para os dados dos usuários.

> **Atenção:** o arquivo `google-services.json` deve corresponder ao `applicationId` real do aplicativo. Verifique também se o projeto Android já possui a configuração necessária do plugin Google Services. Não use regras abertas do Firestore em produção.

### 4. Verificar o banco local

O aplicativo utiliza uma base SQLite pré-populada para a listagem de palavras. Confirme que o arquivo de banco utilizado pela inicialização do aplicativo está presente no local esperado pelo código e foi incluído no repositório ou disponibilizado por um procedimento de geração documentado.

## Como executar o projeto no Android

**1.** Abra um emulador pelo Android Studio ou conecte um dispositivo Android com depuração USB ativada.

**2.** Na raiz do projeto, inicie o Metro Bundler:

```bash
npm start
```

**3.** Mantenha o Metro em execução e, em **outro terminal**, instale e abra o aplicativo:

```bash
npm run android
```

Na primeira execução, o Gradle poderá baixar dependências e a compilação poderá levar alguns minutos. Nas execuções seguintes, basta iniciar o emulador/dispositivo, o Metro e o aplicativo novamente.

Se houver problemas de ambiente, execute:

```bash
npx react-native doctor
```

## Testes

Executar os testes automatizados:

```bash
npm test -- --runInBand
```

Gerar o relatório de cobertura:

```bash
npm test -- --coverage --runInBand
```

**Resultado registrado durante o desenvolvimento:** 40 suítes aprovadas, 391 testes aprovados e 100% de cobertura nas métricas exibidas pelo relatório Jest (instruções, ramificações, funções e linhas). A cobertura se refere aos arquivos incluídos na coleta de cobertura configurada no projeto; não substitui testes manuais em dispositivo.

## Requisitos e limitações

| Recurso | Situação |
| --- | --- |
| Listagem com rolagem infinita | Implementado |
| Detalhes, significados e fonética | Implementado |
| Favoritos | Implementado |
| Histórico de visualizações | Implementado |
| Cache de requisições | Implementado |
| Autenticação | Implementado |
| Persistência vinculada ao usuário | Implementado |
| Injeção de dependências | Implementado |
| Testes automatizados | Implementado |
| Reprodução de áudio | Não implementado (opcional) |
| Validação no iOS | Pendente |

O layout foi adaptado a partir do wireframe fornecido, preservando as funcionalidades principais, com navegação por abas e apresentação em lista.

## Referências

- [Free Dictionary API](https://dictionaryapi.dev/)
- [dwyl/english-words](https://github.com/dwyl/english-words)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Coodesh](https://coodesh.com/)

---

**Desafio técnico:** This is a challenge by [Coodesh](https://coodesh.com/).
