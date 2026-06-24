# Agendamento dos Testes do Pós 💙 (versão HTML simples)

Versão 100% em HTML/JavaScript puro — sem instalar nada, sem terminal, sem build.
Você só precisa: 1) criar um banco gratuito no Supabase, 2) colar 2 informações em 1 arquivo, 3) arrastar a pasta para um site de hospedagem gratuita.

## Arquivos
- `index.html` → tela inicial (nome + WhatsApp)
- `agendar.html` → agendamento dos 4 testes, um por vez
- `confirmacao.html` → resumo final
- `admin.html` → painel da organizadora (senha, ver/excluir agendamentos, exportar Excel, importar planilha)
- `assets/config.js` → **único arquivo que você precisa editar** (chaves do Supabase)
- `assets/tests-data.json` → horários extraídos da sua planilha original
- `supabase-schema.sql` → script para criar o banco de dados

---

## PASSO A PASSO

### Parte 1 — Criar o banco de dados (Supabase, gratuito, 5 minutos)

1. Acesse https://supabase.com → crie uma conta gratuita.
2. Clique em **New Project**. Dê um nome (ex: `agendamento-pos`) e uma senha de banco (guarde, mas não precisa lembrar depois).
3. Espere o projeto ficar pronto (1-2 min).
4. Vá em **SQL Editor → New query**. Abra o arquivo `supabase-schema.sql`, copie tudo, cole lá e clique em **Run**.
   - Dentro desse arquivo, na linha `insert into app_settings (key, value) values ('admin_password', 'minhasenha123')`, troque `minhasenha123` pela senha que você quer usar no painel admin **antes** de rodar — ou troque depois em **Table Editor → app_settings**.
5. Vá em **Project Settings → API**. Copie:
   - **Project URL**
   - **anon public key**

### Parte 2 — Editar 1 arquivo

Abra `assets/config.js` em qualquer editor de texto (ou no bloco de notas) e troque:
```js
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA-CHAVE-ANON-AQUI";
```
pelos valores que você copiou. Salve o arquivo.

> Não existe risco em essa chave "anon" ficar visível no site — ela só permite ler horários e criar agendamentos; ela não dá acesso para excluir nada (isso só acontece com a senha de admin, verificada dentro do banco).

### Parte 3 — Importar os horários da planilha

1. Abra o site (veja Parte 4 abaixo para publicá-lo, ou simplesmente abra `index.html` no navegador para testar localmente).
2. Acesse `admin.html`, entre com a senha que você definiu.
3. Clique em **📂 Importar planilha**. Isso lê o `assets/tests-data.json` (já gerado a partir do seu Excel) e cria todos os horários no banco.
   - Você só precisa fazer isso **uma vez** (ou de novo se quiser recomeçar do zero — atenção: isso apaga agendamentos já feitos).

### Parte 4 — Publicar o site (gratuito, sem terminal)

**Opção mais simples — Netlify Drop:**
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta `agendamento-html` inteira para a página.
3. Pronto — você recebe um link tipo `https://nome-aleatorio.netlify.app`. Esse é o link para compartilhar com as participantes.
4. `https://nome-aleatorio.netlify.app/admin.html` é o seu painel.

**Opção alternativa — Vercel:**
1. Crie conta em https://vercel.com
2. Clique em **Add New → Project → Upload** (ou conecte um repositório do GitHub com esses mesmos arquivos)
3. Como não há build (é só HTML), pode publicar direto — não precisa configurar nada de "build command".

> Dica: depois de publicar, abra o link em modo anônimo/privado para garantir que está tudo funcionando como uma participante veria.

---

## Como usar o painel administrativo
Acesse `/admin.html`, digite a senha. Você pode:
- Ver todas as participantes e o que cada uma agendou
- Excluir um agendamento específico (libera a vaga automaticamente)
- Excluir uma participante inteira (remove os 4 agendamentos)
- Exportar tudo para Excel (botão **📥 Exportar Excel**)
- Reimportar os horários da planilha original (botão **📂 Importar planilha** — atenção, apaga tudo que já foi agendado)

## Mudar o número de vagas do exame de sangue
No Supabase, vá em **Table Editor → slots**, filtre por `test_id = sangue` e edite a coluna `capacity` de cada linha (hoje está em 15).

## Trocar a senha do admin depois
No Supabase, vá em **Table Editor → app_settings**, edite a linha `admin_password`.
