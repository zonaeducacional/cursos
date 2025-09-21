# 🎓 EduPlatform - Plataforma de Cursos Online

Uma plataforma completa para criação, gestão e distribuição de cursos online, desenvolvida com HTML, Tailwind CSS, JavaScript e Firebase.

## 🚀 Funcionalidades

### 👨‍💼 Painel Administrativo
- ✅ Gestão completa de cursos (criar, editar, excluir)
- ✅ Gestão de usuários e permissões
- ✅ Upload de arquivos integrado com Kekoweb.org
- ✅ Dashboard com métricas e analytics
- ✅ Biblioteca de mídia centralizada

### 👨‍🎓 Área do Estudante
- ✅ Dashboard personalizado com progresso
- ✅ Sistema de gamificação (conquistas, pontos)
- ✅ Player de vídeo integrado
- ✅ Acompanhamento de progresso em tempo real

### 🔐 Autenticação e Segurança
- ✅ Login exclusivo com Gmail/Google (Firebase Auth)
- ✅ Controle de permissões por função (admin, instrutor, estudante)
- ✅ Regras de segurança robustas no Firestore

## 🛠️ Stack Tecnológica

- **Frontend**: HTML + Tailwind CSS + JavaScript (Vanilla)
- **Backend**: Firebase Functions (Serverless)
- **Banco de Dados**: Firebase Firestore + Realtime Database
- **Autenticação**: Firebase Auth (Gmail/Google)
- **Storage**: Kekoweb.org para arquivos de mídia
- **Deploy**: Firebase Hosting

## 📁 Estrutura do Projeto

```
plataforma-cursos/
├── public/                 # Frontend
│   ├── index.html         # Landing page
│   ├── admin/             # Painel administrativo
│   ├── dashboard/         # Área do estudante
│   └── assets/            # CSS, JS, imagens
├── functions/             # Firebase Functions
├── firestore.rules        # Regras de segurança
├── firestore.indexes.json # Índices do Firestore
└── firebase.json          # Configuração do Firebase
```

## 🔧 Como Integrar o Firebase (Passo a Passo)

### 1️⃣ Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Digite o nome: `eduplatform-cursos`
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2️⃣ Configurar Autenticação

1. No painel do Firebase, vá em **Authentication**
2. Clique em "Vamos começar"
3. Na aba **Sign-in method**:
   - Clique em **Google**
   - Ative o provedor
   - Adicione seu email como administrador
   - Salve as configurações

### 3️⃣ Configurar Firestore Database

1. Vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha **Modo de produção**
4. Selecione a localização (preferencialmente `southamerica-east1`)
5. Clique em "Concluído"

### 4️⃣ Configurar Hosting

1. Vá em **Hosting**
2. Clique em "Vamos começar"
3. Siga os passos (não precisa executar os comandos ainda)

### 5️⃣ Obter Credenciais do Projeto

1. Vá em **Configurações do projeto** (ícone de engrenagem)
2. Na aba **Geral**, role até "Seus aplicativos"
3. Clique em **</> Web**
4. Digite o nome: `eduplatform-web`
5. Marque **Firebase Hosting**
6. Clique em "Registrar app"
7. **COPIE** as credenciais que aparecem

### 6️⃣ Configurar as Credenciais no Código

✅ **Credenciais já configuradas no código:**

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAnV0ROT-nQFJrCYpM0_3pLyJMd28arO-g",
    authDomain: "cursos-online-5aaac.firebaseapp.com",
    projectId: "cursos-online-5aaac",
    storageBucket: "cursos-online-5aaac.firebasestorage.app",
    messagingSenderId: "167313586400",
    appId: "1:167313586400:web:77c0482d9af1409a3ef885"
};
```

### 7️⃣ Instalar Firebase CLI

```bash
# Instalar Node.js (se não tiver)
# Depois instalar Firebase CLI
npm install -g firebase-tools

# Fazer login no Firebase
firebase login

# Inicializar projeto (na pasta do projeto)
firebase init
```

**Durante o `firebase init`:**
- Selecione: **Firestore**, **Functions**, **Hosting**
- Use projeto existente: escolha seu projeto
- Firestore rules: `firestore.rules` ✅
- Firestore indexes: `firestore.indexes.json` ✅
- Functions: JavaScript ✅
- Hosting public directory: `public` ✅
- Single-page app: **Não** ❌

### 8️⃣ Configurar Regras de Segurança

As regras já estão no arquivo `firestore.rules`. Para aplicá-las:

```bash
firebase deploy --only firestore:rules
```

### 9️⃣ Criar Primeiro Usuário Admin

1. Faça deploy da aplicação:
```bash
firebase deploy
```

2. Acesse sua aplicação no link fornecido
3. Faça login com sua conta Google
4. No Firebase Console, vá em **Firestore Database**
5. Encontre o documento do seu usuário em `users/[seu-uid]`
6. Edite o campo `role` para `"admin"`

### 🔟 Configurar Kekoweb.org (Storage)

1. Crie uma conta em [Kekoweb.org](https://kekoweb.org)
2. Obtenha sua API key
3. No painel admin da plataforma, use a área de upload
4. Os arquivos serão enviados para o Kekoweb.org automaticamente

## 🚀 Deploy e Execução

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Servir localmente
firebase serve

# Ou usar um servidor HTTP simples
python -m http.server 8000
```

### Deploy para Produção
```bash
# Deploy completo
firebase deploy

# Deploy apenas do hosting
firebase deploy --only hosting

# Deploy apenas das regras
firebase deploy --only firestore:rules
```

## 👥 Gerenciamento de Usuários

### Criar Administradores
1. Usuário faz login normalmente
2. No Firestore, edite o documento em `users/[uid]`
3. Altere `role` para `"admin"`

### Funções Disponíveis
- `student`: Estudante (padrão)
- `instructor`: Instrutor (pode criar cursos)
- `admin`: Administrador (acesso total)

## 📊 Estrutura do Banco de Dados

### Coleções Principais

**users**
```javascript
{
  uid: "string",
  email: "string",
  displayName: "string",
  photoURL: "string",
  role: "student|instructor|admin",
  createdAt: timestamp,
  lastLogin: timestamp
}
```

**courses**
```javascript
{
  title: "string",
  description: "string",
  category: "string",
  price: number,
  featured: boolean,
  published: boolean,
  instructor: "string",
  instructorId: "string",
  createdAt: timestamp,
  enrolledCount: number
}
```

**enrollments**
```javascript
{
  userId: "string",
  courseId: "string",
  progress: number, // 0-100
  enrolledAt: timestamp,
  completedAt: timestamp
}
```

## 🔒 Segurança

- ✅ Autenticação obrigatória para todas as ações
- ✅ Controle de permissões por função
- ✅ Validação de dados no Firestore
- ✅ Regras de segurança robustas
- ✅ Proteção contra acesso não autorizado

## 🎨 Personalização

### Cores e Tema
Edite o arquivo `public/assets/css/style.css` para personalizar:
- Cores primárias
- Tipografia
- Espaçamentos
- Componentes

### Funcionalidades Adicionais
- Sistema de pagamentos (Stripe/PayPal)
- Certificados automáticos
- Fóruns de discussão
- Chat em tempo real
- Notificações push

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no Firebase Console
2. Confira as regras de segurança do Firestore
3. Teste a autenticação no Authentication
4. Verifique as credenciais no `firebase-config.js`

## 🎯 Próximos Passos

1. ✅ Configurar Firebase (seguir tutorial acima)
2. ✅ Fazer primeiro deploy
3. ✅ Criar usuário admin
4. ✅ Testar criação de cursos
5. ✅ Configurar Kekoweb.org
6. 🔄 Personalizar design e funcionalidades

---

**🎉 Sua plataforma de cursos está pronta para usar!**

Desenvolvida com ❤️ usando Firebase + HTML + Tailwind + JavaScript