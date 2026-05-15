# 🚀 Open Analytics — Guia de Deploy

## Visão Geral do Sistema

```
GitHub (código)  ──►  Netlify (hospedagem + funções)
                            │
                    Netlify Forms (leads)
                    EmailJS (e-mails grátis)
                    MercadoPago (pagamentos)
                    Supabase (banco de dados — opcional)
```

---

## 1. Pré-requisitos (todos gratuitos)

| Serviço | Para que serve | Plano gratuito |
|---|---|---|
| GitHub | Repositório do código | Ilimitado |
| Netlify | Hospedagem + Functions | 100GB banda/mês |
| EmailJS | E-mails de confirmação | 200 e-mails/mês |
| MercadoPago | Receber pagamentos | Pago por transação |
| Supabase | Banco de dados (opcional) | 500MB grátis |

---

## 2. Subindo para o GitHub

```bash
# 1. Crie um repositório no github.com (botão New)

# 2. No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "feat: Open Analytics v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/open-analytics.git
git push -u origin main
```

---

## 3. Deploy no Netlify

1. Acesse **app.netlify.com** → **Add new site** → **Import from Git**
2. Conecte seu GitHub e selecione o repositório `open-analytics`
3. Configurações de build:
   - **Base directory:** deixe em branco
   - **Build command:** deixe em branco
   - **Publish directory:** `.` (ponto)
4. Clique em **Deploy site**
5. Seu site estará em: `https://NOME-ALEATORIO.netlify.app`

### Domínio personalizado (opcional)
- Netlify → Domain management → Add custom domain
- Configure os DNS conforme instruído

---

## 4. Configurar EmailJS (e-mails de confirmação)

1. Crie conta em **emailjs.com** (plano gratuito)
2. Adicione um **Email Service** (Gmail, Outlook, etc.)
3. Crie um **Email Template** com estas variáveis:
   ```
   Para: {{to_email}}
   Assunto: ✅ Pedido {{order_id}} confirmado — Open Analytics

   Olá, {{to_name}}!

   Seu pagamento foi aprovado. 🎉

   Pedido: {{order_id}}
   Itens: {{order_items}}
   Total: {{order_total}}
   Método: {{pay_method}}

   Acesse seus downloads em:
   {{download_url}}

   Open Analytics
   ```
4. Copie os IDs em: Netlify → Site settings → **Environment variables**:
   ```
   EMAILJS_SERVICE_ID   = service_xxxxxxx
   EMAILJS_TEMPLATE_ID  = template_xxxxxxx
   EMAILJS_PUBLIC_KEY   = seu_public_key
   ```

---

## 5. Configurar MercadoPago

1. Crie conta em **mercadopago.com.br**
2. Acesse: Seu perfil → **Credenciais** → **Produção**
3. Copie o **Access Token**
4. Adicione no Netlify → Environment variables:
   ```
   MP_ACCESS_TOKEN = APP_USR-xxxxx
   ```
5. Configure o Webhook:
   - MercadoPago → Configurações → **Webhooks**
   - URL: `https://SEUSITE.netlify.app/.netlify/functions/payment-webhook`
   - Eventos: selecione **Pagamentos**

### Para usar o SDK do MercadoPago no front-end:
Adicione no `index.html` antes de `</body>`:
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
<script>
  const mp = new MercadoPago('SUA_PUBLIC_KEY_AQUI', { locale: 'pt-BR' });
</script>
```

---

## 6. Configurar Supabase (banco de dados — opcional mas recomendado)

1. Crie conta em **supabase.com**
2. Crie um novo projeto
3. No SQL Editor, execute:

```sql
-- Tabela de usuários
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  pass_hash text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Tabela de produtos
create table products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null,
  old_price numeric,
  description text,
  emoji text default '📦',
  features jsonb default '[]',
  files jsonb default '[]',
  badge text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Tabela de pedidos
create table orders (
  id text primary key,
  user_email text not null,
  items jsonb not null,
  total numeric not null,
  method text not null,
  status text default 'pending',
  mp_payment_id text,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Políticas básicas
create policy "Produtos públicos" on products for select using (active = true);
create policy "Usuário vê seus pedidos" on orders for select using (user_email = auth.jwt() ->> 'email');
```

4. Copie as credenciais:
   ```
   SUPABASE_URL = https://xxxxx.supabase.co
   SUPABASE_KEY = eyJxxxxx (chave anon pública)
   ```

---

## 7. Credenciais Admin Padrão

Acesse o painel administrativo com:
```
E-mail: admin@openanalytics.com.br
Senha:  Admin@2026
```

⚠️ **Importante:** Altere estas credenciais antes de publicar!

No arquivo `js/app.js`, linha `doLogin()`:
```javascript
// Mude para suas credenciais:
email === 'SEU_EMAIL' && pass === 'SUA_SENHA_FORTE'
```

---

## 8. Adicionar produtos reais com arquivos

1. Crie a pasta `downloads/` no projeto:
   ```
   downloads/
   ├── p1/
   │   └── imobiliaria-premium-v2.zip
   ├── p2/
   │   ├── dashboard-financeiro-v3.xlsx
   │   └── manual.pdf
   └── ...
   ```
2. Suba os arquivos para o GitHub junto com o código
3. Os clientes farão o download diretamente desses arquivos após a compra

**⚠️ Nota:** Para proteção real dos arquivos (evitar acesso sem compra), use Netlify Identity + funções serverless para gerar URLs temporárias assinadas. Veja a documentação em: https://docs.netlify.com/visitor-access/identity/

---

## 9. Variáveis de ambiente — Resumo

No Netlify → Site settings → Environment variables, adicione:

```
EMAILJS_SERVICE_ID   = service_xxxxxxx
EMAILJS_TEMPLATE_ID  = template_xxxxxxx
EMAILJS_PUBLIC_KEY   = sua_chave_publica_emailjs
MP_ACCESS_TOKEN      = APP_USR-xxxxx-xxxxxxx
SUPABASE_URL         = https://xxxxx.supabase.co
SUPABASE_KEY         = eyJxxxxx
```

---

## 10. Serviços gratuitos utilizados — Limites

| Serviço | Limite gratuito | O que acontece ao exceder |
|---|---|---|
| Netlify | 100GB/mês + 300 minutos build | Site para, upgrade necessário |
| EmailJS | 200 e-mails/mês | E-mails param (sem cobrança) |
| MercadoPago | Sem limite de transações | Taxa por venda (3,99% + R$0,40) |
| Supabase | 500MB + 50.000 req/mês | Pausa automática após inatividade |
| GitHub | Ilimitado (repos públicos) | — |

---

## 11. Estrutura de arquivos

```
open-analytics/
├── index.html              ← Página principal (SPA)
├── netlify.toml            ← Configuração do Netlify
├── README.md               ← Este arquivo
├── css/
│   └── style.css           ← Todos os estilos
├── js/
│   └── app.js              ← App inteiro (auth, produtos, checkout)
├── assets/
│   └── logo.jpg            ← Logotipo
├── downloads/              ← Criar esta pasta com seus arquivos
│   ├── p1/
│   └── p2/
└── netlify/
    └── functions/
        ├── send-email.js          ← Envio de e-mail pós-compra
        └── payment-webhook.js     ← Webhook MercadoPago
```

---

## 12. Suporte e dúvidas

- E-mail: contato@openanalytics.com.br
- WhatsApp: (00) 00000-0000

---

*Open Analytics v1.0 — 2026*
