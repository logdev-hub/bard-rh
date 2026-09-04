(function () {
    'use strict';

    const now = () => new Date().toISOString();
    const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

    window.BardData = {
        storageKey: 'bardrh-jornada-demo-v1',
        credentials: {
            candidate: { email: 'candidato@teste.com', password: 'teste123', name: 'Ana Beatriz Souza' },
            admin: { email: 'admin@teste.com', password: 'teste123', name: 'Marina Costa' }
        },
        statusLabels: {
            enviada: 'Enviada',
            em_processamento: 'Em processamento',
            triagem_ia_concluida: 'Triagem de IA concluída',
            aguardando_revisao_humana: 'Aguardando revisão humana',
            em_analise: 'Em análise',
            pre_selecionada: 'Pré-selecionada',
            entrevista_agendada: 'Entrevista agendada',
            entrevista_realizada: 'Entrevista realizada',
            teste_enviado: 'Teste enviado',
            teste_concluido: 'Teste concluído',
            finalista: 'Finalista',
            proposta_enviada: 'Proposta enviada',
            contratada: 'Contratada',
            nao_selecionada: 'Não selecionada',
            retirada: 'Retirada'
        },
        pipeline: [
            'enviada', 'em_processamento', 'aguardando_revisao_humana', 'em_analise',
            'pre_selecionada', 'entrevista_agendada', 'entrevista_realizada',
            'teste_enviado', 'teste_concluido', 'finalista', 'proposta_enviada',
            'contratada', 'nao_selecionada'
        ],
        guides: {
            candidate: [
                { title: 'Conheça seu painel', text: 'Confira seu perfil e clique em Buscar vagas.', hint: 'O botão azul está no topo do painel.' },
                { title: 'Encontre uma oportunidade', text: 'Use os filtros e abra a vaga Auxiliar de Logística.', hint: 'Ela está na primeira posição da lista.' },
                { title: 'Revise a oportunidade', text: 'Leia os detalhes e clique em Candidatar-se.', hint: 'O resumo da candidatura fica à direita.' },
                { title: 'Envie a candidatura', text: 'Confira o currículo, responda à triagem e confirme o envio.', hint: 'O currículo demonstrativo já está selecionado.' },
                { title: 'Acompanhe a análise', text: 'Observe a simulação da IA e consulte o parecer explicável.', hint: 'A IA termina sempre em revisão humana.' },
                { title: 'Acompanhe a decisão', text: 'Depois da ação do administrador, confira a notificação e a nova etapa.', hint: 'Troque de perfil sem reiniciar a simulação.' }
            ],
            admin: [
                { title: 'Leia os indicadores', text: 'Confira as pendências e clique em Avaliar candidatos.', hint: 'O CTA está no cabeçalho do painel.' },
                { title: 'Abra o pipeline', text: 'Acesse os candidatos da vaga Auxiliar de Logística.', hint: 'Use o botão Ver candidatos.' },
                { title: 'Analise Ana Beatriz', text: 'Abra o cartão de Ana Beatriz para consultar evidências e parecer.', hint: 'Ela aguarda revisão humana.' },
                { title: 'Registre a decisão humana', text: 'Escolha Agendar entrevista e preencha a justificativa.', hint: 'A justificativa precisa ter pelo menos 10 caracteres.' },
                { title: 'Confirme a continuidade', text: 'Confira a auditoria ou entre como candidato para ver a atualização.', hint: 'O estado é compartilhado pelo navegador.' }
            ]
        },
        initialState: function () {
            return {
                version: 1,
                session: { role: null, name: null },
                guide: { candidate: 0, admin: 0, hidden: false },
                scenario: { candidateSubmitted: false, aiComplete: true },
                profile: {
                    name: 'Ana Beatriz Souza', email: 'candidato@teste.com', headline: 'Assistente de Logística',
                    city: 'Guarulhos', state: 'SP', workModel: 'Presencial ou híbrido', availability: 'Imediata',
                    education: 'Ensino médio completo', desiredSalary: '2200', relocation: false,
                    experience: 'Conferência de cargas, romaneio, CTE, separação e organização de estoque.',
                    skills: 'Organização, atenção aos detalhes, comunicação e pacote Office básico.',
                    summary: 'Profissional de logística com experiência em conferência, documentação de transporte e organização de estoque. Busco contribuir com uma operação segura e eficiente.',
                    accessibility: ''
                },
                resume: {
                    name: 'curriculo-ana-beatriz-souza.html', type: 'text/html', size: 48200,
                    version: 1, status: 'Processado', primary: true, updatedAt: now()
                },
                jobs: [
                    {
                        id: 1, slug: 'auxiliar-de-logistica', title: 'Auxiliar de Logística', company: 'TransLog Norte Transportes Ltda.',
                        city: 'Guarulhos', state: 'SP', area: 'Logística', model: 'Presencial', contract: 'CLT', salary: 'R$ 1.980,00',
                        published: 'Hoje', status: 'Publicada', candidates: 5, awaiting: 2,
                        mission: 'Executar atividades operacionais de coleta, entrega e conferência de cargas.',
                        responsibilities: ['Conferir volumes e documentos de transporte', 'Apoiar separação, expedição e organização do estoque', 'Registrar movimentações e comunicar divergências'],
                        requirements: ['Ensino médio completo', 'Noções de documentos de transporte', 'Disponibilidade para trabalho presencial'],
                        skills: ['Organização', 'Atenção aos detalhes', 'Comunicação'],
                        benefits: ['Vale Transporte', 'Vale Refeição']
                    },
                    { id: 2, slug: 'assistente-administrativo', title: 'Assistente Administrativo', company: 'TransLog Norte Transportes Ltda.', city: 'Guarulhos', state: 'SP', area: 'Administrativo', model: 'Híbrido', contract: 'CLT', salary: 'R$ 2.450,00', published: 'Há 2 dias', status: 'Publicada', candidates: 8, awaiting: 3 },
                    { id: 3, slug: 'analista-de-transportes', title: 'Analista de Transportes', company: 'TransLog Norte Transportes Ltda.', city: 'São Paulo', state: 'SP', area: 'Logística', model: 'Híbrido', contract: 'CLT', salary: 'R$ 4.200,00', published: 'Há 4 dias', status: 'Publicada', candidates: 12, awaiting: 1 }
                ],
                candidates: [
                    { id: 1, name: 'Ana Beatriz Souza', headline: 'Assistente de Logística', city: 'Guarulhos/SP', status: 'aguardando_revisao_humana', score: 84, jobId: 1 },
                    { id: 2, name: 'Bruno Carvalho Lima', headline: 'Auxiliar de Estoque', city: 'São Paulo/SP', status: 'em_analise', score: 76, jobId: 1 },
                    { id: 3, name: 'Camila Ferreira Dias', headline: 'Operadora Logística', city: 'Guarulhos/SP', status: 'pre_selecionada', score: 91, jobId: 1 },
                    { id: 4, name: 'Diego Martins Alves', headline: 'Ajudante de Expedição', city: 'Osasco/SP', status: 'aguardando_revisao_humana', score: 63, jobId: 1 },
                    { id: 5, name: 'Eduarda Nunes Rocha', headline: 'Assistente de Operações', city: 'Guarulhos/SP', status: 'entrevista_agendada', score: 79, jobId: 1 }
                ],
                application: {
                    id: 1, jobId: 1, candidateId: 1, status: 'aguardando_revisao_humana', score: 84,
                    coverLetter: 'Tenho experiência em conferência de cargas, organização de estoque e documentos de transporte. Tenho disponibilidade imediata e interesse em contribuir com a operação da TransLog Norte.',
                    answers: { availability: 'Sim, tenho disponibilidade imediata.', shift: 'Sim, possuo disponibilidade para o horário informado.' },
                    submittedAt: minutesAgo(34), interview: null,
                    history: [
                        { status: 'enviada', at: minutesAgo(34), reason: 'Candidatura enviada pela candidata.' },
                        { status: 'em_processamento', at: minutesAgo(33), reason: 'Análise automatizada iniciada.' },
                        { status: 'triagem_ia_concluida', at: minutesAgo(32), reason: 'Parecer explicável disponibilizado.' },
                        { status: 'aguardando_revisao_humana', at: minutesAgo(32), reason: 'Encaminhada para decisão humana.' }
                    ]
                },
                analysis: {
                    score: 84,
                    candidateSummary: 'Seu currículo apresenta boa correspondência com as atividades de conferência, organização de estoque e documentação de transporte. Alguns conhecimentos podem ser aprofundados em uma conversa com o RH.',
                    recruiterSummary: 'Há evidências objetivas de experiência operacional em logística, localização compatível e disponibilidade imediata. Recomenda-se validar o nível de autonomia com sistemas de estoque e o uso prático de CTE.',
                    dimensions: [
                        { name: 'Conhecimentos técnicos', weight: 35, score: 82, evidence: 'Menções a conferência, romaneio e CTE.' },
                        { name: 'Experiência profissional', weight: 20, score: 80, evidence: 'Experiência anterior em rotina de estoque e expedição.' },
                        { name: 'Habilidades', weight: 20, score: 86, evidence: 'Organização, atenção aos detalhes e comunicação declaradas.' },
                        { name: 'Formação', weight: 10, score: 100, evidence: 'Ensino médio completo informado.' },
                        { name: 'Disponibilidade', weight: 15, score: 80, evidence: 'Disponibilidade imediata e localização compatível.' }
                    ],
                    requirements: [
                        { label: 'Ensino médio completo', result: 'Comprovado', tone: 'green', evidence: 'Formação registrada no currículo.' },
                        { label: 'Experiência em conferência de cargas', result: 'Comprovado', tone: 'green', evidence: 'Atividade descrita na experiência profissional.' },
                        { label: 'Conhecimento de CTE', result: 'Evidência parcial', tone: 'amber', evidence: 'CTE é citado, sem detalhamento do nível de autonomia.' },
                        { label: 'Sistema de gestão de estoque', result: 'Não comprovado', tone: 'gray', evidence: 'Não há sistema específico mencionado.' }
                    ],
                    questions: ['Conte uma situação em que identificou uma divergência na conferência de cargas.', 'Quais sistemas ou planilhas você já utilizou para controlar estoque?', 'Como organiza prioridades em dias de grande volume?']
                },
                notifications: [
                    { id: 1, text: 'Seu perfil demonstrativo está pronto para a jornada.', at: minutesAgo(45), read: false }
                ],
                audit: [
                    { id: 1, at: minutesAgo(32), user: 'Simulador de IA', action: 'Parecer gerado', entity: 'Ana Beatriz · Auxiliar de Logística', result: 'Concluído', reason: 'Análise explicável encaminhada para revisão humana.' }
                ]
            };
        }
    };
}());
