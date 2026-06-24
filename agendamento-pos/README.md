# Agendamento dos Testes do Pós 💙

Site simples e direto para idosas agendarem os 4 testes (Força,
Composição Corporal, Cardiorrespiratório e Exame de Sangue), em tempo real,
pelo celular. Inclui painel administrativo para você gerenciar tudo.

## O que já está pronto
- Importação automática dos horários da sua planilha (`Agendamento.xlsx` → `data/tests-data.json`)
- Bloqueio automático de horário assim que alguém agenda
- Exame de sangue com limite de vagas por dia (15 por padrão — pode mudar)
- Cada pessoa agenda nome + WhatsApp uma vez e depois os 4 testes, um de cada vez
- Tela final de confirmação com resumo de tudo que foi agendado
- Painel admin (`/admin`) protegido por senha: ver, excluir agendamentos, exportar Excel

---

## PASSO A PASSO PARA PUBLICAR (sem precisar saber programar)

### Parte 1 — Criar o banco de dados (Supabase, gratuito)

1. Acesse https://supabase.com e crie uma conta gratuita.
2. Clique em **"New Project"**. Escolha um nome (ex: `agendamento-pos`) e uma senha de banco (guarde-a, mas não é a mesma do painel admin do site).
3. Espere o projeto terminar de ser criado (1-2 minutos).
4. No menu lateral, clique em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase-schema.sql` (está na pasta deste projeto), copie todo o conteúdo, cole no editor e clique em **Run**.
   - Isso cria as tabelas de horários, participantes e agendamentos.
6. No menu lateral, vá em **Project Settings → API**. Você vai precisar de 3 valores:
   - **Project URL** → isso é o `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → isso é o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (clique em "Reveal") → isso é o `SUPABASE_SERVICE_ROLE_KEY` (NUNCA compartilhe esta chave)

### Parte 2 — Configurar o projeto no seu computador

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais recente), se ainda não tiver.
2. Abra uma janela de terminal dentro da pasta `agendamento-pos`.
3. Rode:
   ```
   npm install
   ```
4. Copie o arquivo `.env.example` e renomeie a cópia para `.env.local`.
5. Abra o `.env.local` e preencha com os 3 valores do Supabase (Parte 1) e escolha uma senha para `ADMIN_PASSWORD` (essa é a senha que você vai usar para entrar em `/admin`).
6. Importe os horários da planilha para o banco:
   ```
   npm run seed
   ```
   Você vai ver uma listagem confirmando quantos horários foram importados para cada teste.
7. (Opcional) Para testar no seu computador antes de publicar:
   ```
   npm run dev
   ```
   Depois abra http://localhost:3000 no navegador.

### Parte 3 — Publicar gratuitamente na Vercel

1. Crie uma conta gratuita em https://vercel.com (pode entrar com GitHub).
2. Suba este projeto para um repositório no GitHub:
   - Crie um repositório novo (ex: `agendamento-pos`) em https://github.com/new
   - No terminal, dentro da pasta do projeto:
     ```
     git init
     git add .
     git commit -m "primeira versão"
     git branch -M main
     git remote add origin LINK_DO_SEU_REPOSITORIO
     git push -u origin main
     ```
3. Na Vercel, clique em **Add New → Project** e selecione o repositório que você acabou de subir.
4. Antes de clicar em "Deploy", abra a seção **Environment Variables** e adicione as mesmas 4 variáveis do seu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. Clique em **Deploy**. Em cerca de 1 minuto seu site estará no ar, com um link tipo `https://agendamento-pos.vercel.app`.
6. Esse é o link que você vai compartilhar com as participantes! E `https://agendamento-pos.vercel.app/admin` é o seu painel administrativo (peça a senha que você definiu).

> Sempre que quiser atualizar o site, basta dar `git push` de novo — a Vercel publica a nova versão automaticamente.

---

## Como usar o painel administrativo

Acesse `/admin` no site, digite a senha (`ADMIN_PASSWORD`).
Lá você pode:
- Ver todas as participantes e o que cada uma já agendou
- Excluir um agendamento específico (libera o horário automaticamente)
- Excluir uma participante inteira (remove os 4 agendamentos dela)
- Exportar tudo para um arquivo Excel (botão "📥 Exportar Excel")

## Se precisar reimportar os horários
Se você editar a planilha original, gere o novo `data/tests-data.json` e rode `npm run seed` novamente.
⚠️ Atenção: o `npm run seed` apaga e recria todos os horários — agendamentos feitos serão perdidos junto com o horário antigo. Faça isso apenas antes de começar os agendamentos, ou peça ajuda para gerar só os horários novos sem apagar os existentes.

## Mudar o número de vagas do exame de sangue
No Supabase, vá em **Table Editor → slots**, filtre por `test_id = sangue` e edite a coluna `capacity` de cada linha (hoje está em 15).
