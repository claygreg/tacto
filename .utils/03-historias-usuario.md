# Histórias de Usuário com Critérios de Aceite — Tacto MVP

> Cada User Story (US) descreve uma funcionalidade do ponto de vista do professor.
> Os Critérios de Aceite definem quando a funcionalidade está "pronta".

---

## Épico 1 — Motor de Criação de Questões

### US 1.1 — Geração de Questão via Inteligência Artificial

**Como** professor,
**Quero** inserir tema, nível de ensino e habilidade específica,
**Para** que a IA gere uma questão inédita (objetiva ou discursiva) alinhada a esses parâmetros.

**Critérios de Aceite:**
- [ ] O formulário exige: Tema, Disciplina, Ano Escolar e Habilidade (campo livre ou seleção de código BNCC)
- [ ] O professor pode escolher o tipo: Objetiva (4 ou 5 alternativas) ou Discursiva
- [ ] A questão gerada exibe: texto-base (se houver), enunciado e alternativas (quando objetiva)
- [ ] A alternativa correta é indicada claramente para o professor (mas não exportada para o aluno)
- [ ] O botão "Gerar outra" gera uma nova questão com os mesmos parâmetros
- [ ] A geração responde em no máximo 10 segundos; se falhar, exibe mensagem de erro amigável
- [ ] A questão gerada pode ser aceita, editada ou descartada antes de salvar

---

### US 1.2 — Revisão e Refinamento Pedagógico

**Como** professor,
**Quero** editar o texto-base, o enunciado e os distratores de uma questão gerada,
**Para** garantir rigor técnico e adequar à realidade da minha turma.

**Critérios de Aceite:**
- [ ] Todos os campos (texto-base, enunciado, alternativas) são editáveis via editor rich text
- [ ] O professor pode reordenar as alternativas arrastando (drag-and-drop)
- [ ] O professor pode alterar qual alternativa é a correta
- [ ] As alterações são salvas somente ao clicar em "Salvar" (sem auto-save que possa confundir)
- [ ] O sistema avisa se o professor tentar sair com alterações não salvas

---

### US 1.3 — Autoria Manual de Itens

**Como** professor,
**Quero** criar uma questão do zero,
**Para** registrar itens que já possuo ou que prefiro redigir eu mesmo.

**Critérios de Aceite:**
- [ ] O professor pode selecionar o modo "Manual" no editor de questões
- [ ] Todos os campos (texto-base opcional, enunciado, alternativas) ficam em branco para preenchimento livre
- [ ] Para questões objetivas: entre 2 e 5 alternativas, exatamente uma marcada como correta
- [ ] Para questões discursivas: campo de "gabarito/critérios de correção" disponível (visível só para o professor)
- [ ] Validação impede salvar sem enunciado preenchido

---

### US 1.4 — Gestão do Banco de Itens Pessoal

**Como** professor,
**Quero** salvar e organizar minhas questões por disciplina e competência,
**Para** reutilizá-las em avaliações futuras com facilidade.

**Critérios de Aceite:**
- [ ] Questões salvas aparecem no Banco Pessoal do professor (só ele tem acesso)
- [ ] Cada questão exibe: tipo, disciplina, tags, trecho do enunciado
- [ ] Filtros funcionais: Disciplina / Tipo / Tag / Texto livre
- [ ] O professor pode editar ou excluir qualquer questão do seu banco
- [ ] Exclusão exibe confirmação antes de remover
- [ ] A questão excluída é removida de provas futuras mas não de provas já exportadas

---

### US 1.5 — Busca Avançada no Acervo Público

**Como** professor,
**Quero** pesquisar questões de domínio público com filtros combinados,
**Para** adicionar rapidamente itens já validados às minhas avaliações.

**Critérios de Aceite:**
- [ ] Filtros disponíveis: Disciplina, Assunto, Nível de ensino, Banca/Origem, Ano
- [ ] Resultados exibem preview do enunciado e identificação da fonte
- [ ] O professor pode adicionar a questão ao Banco Pessoal ou diretamente a uma prova em edição
- [ ] Questões do acervo público não podem ser editadas, apenas copiadas para o banco pessoal (onde podem ser modificadas)
- [ ] Paginação ou carregamento progressivo para listas longas

---

## Épico 2 — Estruturação e Exportação

### US 2.1 — Montagem do Caderno de Prova

**Como** professor,
**Quero** selecionar e organizar questões em um caderno de avaliação,
**Para** compor a prova final com ordem e pesos definidos.

**Critérios de Aceite:**
- [ ] O professor cria uma prova associada a uma turma específica
- [ ] Pode adicionar questões do Banco Pessoal, do Acervo Público ou criar novas diretamente
- [ ] Questões podem ser reordenadas via drag-and-drop
- [ ] Cada questão tem campo de peso/pontuação editável (padrão: igual para todas)
- [ ] A soma total de pontos é exibida em tempo real
- [ ] Mínimo de 1 questão para exportar; sem limite máximo definido no MVP

---

### US 2.2 — Exportação Multiformato (PDF / DOCX)

**Como** professor,
**Quero** exportar a avaliação em PDF ou DOCX,
**Para** imprimir ou fazer ajustes de última hora.

**Critérios de Aceite:**
- [ ] O PDF gerado contém: cabeçalho institucional, questões formatadas, folha de respostas e gabarito (em página separada)
- [ ] O DOCX gerado contém as mesmas seções, editável no Microsoft Word ou equivalente
- [ ] O cabeçalho é configurável (nome da escola, professor, disciplina, data, turma)
- [ ] A folha de gabarito (para uso exclusivo do professor) é sempre gerada junto, mas em página separada
- [ ] O download inicia em no máximo 15 segundos após a solicitação

---

### US 2.3 — Geração Anti-Fraude (Múltiplas Versões Embaralhadas)

**Como** professor,
**Quero** gerar versões embaralhadas da mesma prova automaticamente,
**Para** reduzir cópias durante a aplicação em sala.

**Critérios de Aceite:**
- [ ] O professor escolhe quantas versões gerar: 1, 2 ou 3 (ex.: Tipo A, B, C)
- [ ] Em cada versão: a ordem das questões é embaralhada
- [ ] Em cada versão: a ordem das alternativas (objetivas) também é embaralhada
- [ ] Um gabarito espelho correspondente é gerado para cada versão (ex.: gabarito Tipo A, gabarito Tipo B)
- [ ] Todos os arquivos são agrupados em um .zip para download único
- [ ] A identificação da versão (ex.: "TIPO A") aparece em destaque no cabeçalho de cada prova

---

## Épico 3 — Tabulação e Diagnóstico Analítico

### US 3.1 — Inserção Rápida de Gabaritos

**Como** professor,
**Quero** registrar as respostas dos alunos de forma ágil,
**Para** alimentar o motor de correção sem fricção.

**Critérios de Aceite:**
- [ ] A tela exibe uma tabela: alunos nas linhas, questões nas colunas
- [ ] Para questões objetivas: o professor clica na alternativa marcada pelo aluno (A/B/C/D/E)
- [ ] Para questões discursivas: o professor digita a nota obtida (0 até o peso máximo da questão)
- [ ] O professor seleciona a versão da prova (Tipo A, B...) para cada aluno individualmente
- [ ] É possível salvar o progresso parcialmente e retomar depois
- [ ] Botão "Confirmar e Calcular" finaliza o processo e redireciona para o diagnóstico

---

### US 3.2 — Painel Macro da Turma (Diagnóstico Nível 1)

**Como** professor,
**Quero** visualizar o desempenho consolidado da turma,
**Para** identificar quais tópicos precisam de revisão coletiva.

**Critérios de Aceite:**
- [ ] Exibe: média geral da turma, nota mais alta, nota mais baixa, mediana
- [ ] Gráfico de barras: percentual de acerto por questão
- [ ] Heatmap ou tabela de calor: habilidades × % de acerto
- [ ] Lista de questões ordenada por % de erro (da mais errada para a mais acertada)
- [ ] Cada aluno aparece como linha clicável que abre o Perfil Individual (US 3.3)
- [ ] Botão "Enviar Feedback por E-mail" visível no painel

---

### US 3.3 — Perfil de Desempenho Individual (Diagnóstico Nível 2)

**Como** professor,
**Quero** ver o detalhamento de erros e acertos de cada aluno,
**Para** planejar intervenções personalizadas.

**Critérios de Aceite:**
- [ ] Exibe: nota do aluno, posição na turma, % de acerto geral
- [ ] Lista todas as questões com: o que o aluno marcou, gabarito correto e status (✓/✗)
- [ ] Mostra as habilidades da BNCC que o aluno acertou vs. errou
- [ ] Exibe histórico de provas anteriores do mesmo aluno (nesta turma), se houver
- [ ] Navegação entre alunos sem voltar à listagem (botões Anterior / Próximo)

---

### US 3.4 — Histórico e Evolução Temporal (Diagnóstico Nível 3)

**Como** professor,
**Quero** comparar o desempenho ao longo dos bimestres,
**Para** monitorar a evolução e medir a eficácia das minhas intervenções.

**Critérios de Aceite:**
- [ ] Exibe gráfico de linha com média da turma ao longo das avaliações registradas
- [ ] O professor pode filtrar por turma específica ou ver comparativo entre turmas
- [ ] Pode selecionar um aluno específico para sobrepor sua curva no gráfico da turma
- [ ] Tabela de provas com: nome, data, média, nº de participantes
- [ ] Disponível apenas após 2 ou mais provas registradas na turma (exibe aviso caso contrário)

---

### US 3.5 — Disparo Automatizado de Feedback Individual por E-mail

**Como** professor,
**Quero** enviar o relatório de desempenho de cada aluno automaticamente por e-mail,
**Para** eliminar a necessidade de distribuição manual dos resultados.

**Critérios de Aceite:**
- [ ] O professor clica em "Enviar Feedback por E-mail" no painel da turma
- [ ] Tela de confirmação exibe: quantos alunos receberão e-mail, quais possuem e-mail cadastrado
- [ ] O e-mail enviado ao aluno contém: nota, % de acerto, lista de questões (sem revelar gabarito completo no MVP), mensagem motivacional padronizada
- [ ] Alunos sem e-mail cadastrado são listados para que o professor aja manualmente
- [ ] O professor recebe uma confirmação de envio (tela + e-mail de resumo para ele mesmo)
- [ ] Os e-mails são enviados em fila (não todos ao mesmo tempo) para evitar bloqueio por spam

---

## Épico 4 — Gestão de Acessos e Base

### US 4.1 — Cadastro e Autenticação do Professor

**Como** professor,
**Quero** criar minha conta e fazer login com segurança,
**Para** ter meu espaço de trabalho protegido.

**Critérios de Aceite:**
- [ ] Cadastro via e-mail/senha com validação de formato e força de senha
- [ ] Autenticação via Google (OAuth 2.0) como alternativa
- [ ] E-mail de confirmação enviado ao cadastrar
- [ ] Fluxo de recuperação de senha via link enviado ao e-mail
- [ ] Sessão mantida por pelo menos 7 dias (token renovado automaticamente)
- [ ] Logout disponível em qualquer tela autenticada

---

### US 4.2 — Criação e Gestão de Turmas

**Como** professor,
**Quero** cadastrar minhas turmas no sistema,
**Para** organizar avaliações e dados de forma isolada.

**Critérios de Aceite:**
- [ ] O professor pode criar uma turma com: Nome (ex: "9º Ano A"), Ano letivo, Disciplina principal
- [ ] Pode ter múltiplas turmas (sem limite no MVP)
- [ ] Pode editar o nome e dados de uma turma a qualquer momento
- [ ] Pode arquivar (não excluir) uma turma ao final do ano, preservando histórico
- [ ] A listagem exibe: nome, nº de alunos, nº de provas aplicadas

---

### US 4.3 — Importação de Lista de Chamada em Lote

**Como** professor,
**Quero** fazer upload de uma planilha com meus alunos,
**Para** cadastrá-los rapidamente sem digitar um por um.

**Critérios de Aceite:**
- [ ] Formatos aceitos: CSV e XLSX (Excel)
- [ ] Colunas obrigatórias: Nome Completo, E-mail do Aluno
- [ ] Colunas opcionais: Data de Nascimento
- [ ] O sistema exibe uma pré-visualização dos dados antes de confirmar a importação
- [ ] Linhas com erro (e-mail inválido, nome vazio) são destacadas e podem ser ignoradas ou corrigidas
- [ ] Um template de planilha para download é disponibilizado na tela de importação
- [ ] Alunos já existentes na turma não são duplicados (verificação por e-mail)
