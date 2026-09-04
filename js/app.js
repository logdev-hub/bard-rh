(function () {
    'use strict';

    const App = {
        pendingFile: null,
        pendingDecision: null,
        modal: null,

        init: function () {
            this.modal = new bootstrap.Modal(document.getElementById('appModal'));
            window.addEventListener('hashchange', this.render.bind(this));
            document.addEventListener('click', this.handleClick.bind(this));
            document.addEventListener('submit', this.handleSubmit.bind(this));
            document.addEventListener('change', this.handleChange.bind(this));
            document.addEventListener('input', this.handleInput.bind(this));
            document.addEventListener('keydown', this.handleKeydown.bind(this));
            document.addEventListener('dragover', this.handleDragOver.bind(this));
            document.addEventListener('dragleave', this.handleDragLeave.bind(this));
            document.addEventListener('drop', this.handleDrop.bind(this));
            if (!window.location.hash) window.location.hash = '/login';
            else this.render();
        },

        render: function () {
            const requested = window.BardRouter.current();
            const route = window.BardRouter.guard(requested);
            if (route !== requested) {
                window.BardRouter.navigate(route);
                return;
            }
            document.getElementById('app').innerHTML = window.BardViews.render(window.BardStore.get(), route);
            document.title = this.titleFor(route) + ' — BARD RH';
            window.scrollTo({ top: 0, behavior: 'auto' });
        },

        titleFor: function (route) {
            const titles = {
                '/login': 'Simulador de jornadas', '/candidato/inicio': 'Painel do candidato',
                '/candidato/perfil': 'Perfil profissional', '/candidato/curriculo': 'Meu currículo',
                '/candidato/vagas': 'Vagas', '/candidato/vagas/auxiliar-de-logistica': 'Auxiliar de Logística',
                '/candidato/candidaturas': 'Minhas candidaturas', '/candidato/candidaturas/1': 'Acompanhamento',
                '/admin/inicio': 'Painel administrativo', '/admin/vagas': 'Gestão de vagas',
                '/admin/vagas/1/candidatos': 'Pipeline de candidatos', '/admin/candidatos/1': 'Revisão de Ana Beatriz',
                '/admin/auditoria': 'Auditoria'
            };
            return titles[route] || 'Simulador';
        },

        handleClick: function (event) {
            const guideCandidate = event.target.closest('[data-guide-candidate]');
            const guideAdmin = event.target.closest('[data-guide-admin]');
            const adminOpen = event.target.closest('[data-admin-open]');
            if (guideCandidate) window.BardStore.advanceGuide('candidate', Number(guideCandidate.dataset.guideCandidate));
            if (guideAdmin) window.BardStore.advanceGuide('admin', Number(guideAdmin.dataset.guideAdmin));
            if (adminOpen) {
                window.BardStore.advanceGuide('admin', 3);
                window.BardStore.addAudit('Parecer visualizado', 'Ana Beatriz · Auxiliar de Logística', 'Administrador abriu a análise explicável para revisão humana.');
            }

            const trigger = event.target.closest('[data-action]');
            if (!trigger) return;
            const action = trigger.dataset.action;
            if (action === 'fill-login') this.fillLogin(trigger.dataset.role);
            if (action === 'toggle-password') this.togglePassword(trigger);
            if (action === 'logout') this.logout();
            if (action === 'toggle-guide') this.toggleGuide();
            if (action === 'guide-hint') this.toast('Dica da jornada', trigger.dataset.hint, 'primary');
            if (action === 'reset-demo') this.showResetModal();
            if (action === 'confirm-reset') this.confirmReset();
            if (action === 'show-ai-rules') this.showAiRules();
            if (action === 'toggle-notifications') this.showNotifications();
            if (action === 'mark-notifications') this.markNotifications();
            if (action === 'preview-resume') this.previewResume();
            if (action === 'replace-resume') this.showResumeUpload();
            if (action === 'cancel-resume') this.cancelResumeUpload();
            if (action === 'confirm-resume') this.confirmResume();
            if (action === 'demo-job') this.toast('Conteúdo demonstrativo', 'Nesta jornada, use a vaga Auxiliar de Logística.', 'primary');
            if (action === 'demo-secondary') this.toast('Função contextual', 'Esta função aparece para dar contexto, mas o roteiro principal é a avaliação de candidatos.', 'primary');
            if (action === 'other-candidate') this.toast('Escolha Ana Beatriz', 'O detalhe completo foi preparado para a candidata principal da simulação.', 'primary');
            if (action === 'clear-job-filters') this.clearJobFilters();
            if (action === 'clear-candidate-filters') this.clearCandidateFilters();
            if (action === 'clear-audit-filter') this.clearAuditFilter();
            if (action === 'withdraw-application') this.showWithdrawModal();
            if (action === 'confirm-withdraw') this.confirmWithdraw();
            if (action === 'confirm-decision') this.confirmDecision();
        },

        handleSubmit: function (event) {
            event.preventDefault();
            if (event.target.id === 'loginForm') this.submitLogin(event.target);
            if (event.target.id === 'profileForm') this.saveProfile(event.target);
            if (event.target.id === 'applicationForm') this.submitApplication(event.target);
            if (event.target.id === 'decisionForm') this.prepareDecision(event.target);
            if (event.target.id === 'exceptionForm') this.submitException(event.target);
        },

        handleChange: function (event) {
            if (event.target.id === 'resumeFile' && event.target.files[0]) this.validateFile(event.target.files[0]);
            if (event.target.id === 'targetStatus') this.toggleDecisionFields(event.target.value);
            if (['jobCity', 'jobArea', 'jobModel'].includes(event.target.id)) this.filterJobs();
            if (['candidateStage', 'candidateScore', 'candidateSort'].includes(event.target.id)) this.filterCandidates();
            if (event.target.id === 'auditFilter') this.filterAudit();
        },

        handleInput: function (event) {
            if (event.target.id === 'jobSearch') this.filterJobs();
            if (event.target.id === 'candidateSearch') this.filterCandidates();
        },

        handleKeydown: function (event) {
            const dropzone = event.target.closest('#resumeDropzone');
            if (dropzone && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                document.getElementById('resumeFile').click();
            }
        },

        handleDragOver: function (event) {
            const dropzone = event.target.closest('#resumeDropzone');
            if (!dropzone) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            dropzone.classList.add('is-over');
        },

        handleDragLeave: function (event) {
            const dropzone = event.target.closest('#resumeDropzone');
            if (dropzone && !dropzone.contains(event.relatedTarget)) dropzone.classList.remove('is-over');
        },

        handleDrop: function (event) {
            const dropzone = event.target.closest('#resumeDropzone');
            if (!dropzone) return;
            event.preventDefault();
            dropzone.classList.remove('is-over');
            const file = event.dataTransfer.files[0];
            if (file) this.validateFile(file);
        },

        fillLogin: function (role) {
            const account = window.BardData.credentials[role];
            document.getElementById('email').value = account.email;
            document.getElementById('password').value = account.password;
            document.getElementById('email').focus();
            document.getElementById('loginError').textContent = '';
        },

        togglePassword: function (button) {
            const input = document.getElementById('password');
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            button.textContent = showing ? 'Mostrar senha' : 'Ocultar senha';
        },

        submitLogin: function (form) {
            const formData = new FormData(form);
            const email = String(formData.get('email') || '').trim().toLowerCase();
            const password = String(formData.get('password') || '');
            const role = Object.keys(window.BardData.credentials).find(function (key) {
                const account = window.BardData.credentials[key];
                return account.email === email && account.password === password;
            });
            const error = document.getElementById('loginError');
            if (!role) {
                error.textContent = 'E-mail ou senha inválidos. Use um dos acessos demonstrativos.';
                form.querySelector('button[type="submit"]').classList.add('btn-danger');
                return;
            }
            error.textContent = '';
            window.BardStore.login(role);
            window.BardStore.advanceGuide(role, 0);
            window.BardRouter.navigate(role === 'candidate' ? '/candidato/inicio' : '/admin/inicio');
        },

        logout: function () {
            window.BardStore.logout();
            window.BardRouter.navigate('/login');
        },

        toggleGuide: function () {
            window.BardStore.update(function (state) { state.guide.hidden = !state.guide.hidden; });
            this.render();
        },

        showResetModal: function () {
            this.openModal('Reiniciar simulação', '<p>Isso restaura perfis, candidatura, decisões, notificações e auditoria para o estado inicial.</p><div class="alert alert-warning mb-0"><strong>Atenção:</strong> apenas os dados fictícios salvos neste navegador serão substituídos.</div>', '<button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-danger" type="button" data-action="confirm-reset">Reiniciar simulação</button>');
        },

        confirmReset: function () {
            const priorRole = window.BardStore.get().session.role;
            window.BardStore.reset();
            this.modal.hide();
            window.BardRouter.navigate('/login');
            this.toast('Simulação reiniciada', priorRole ? 'O estado demonstrativo foi restaurado com segurança.' : 'Tudo pronto para uma nova jornada.', 'success');
        },

        showAiRules: function () {
            const body = '<div class="sim-ai-banner"><span>H</span><div><strong>Decisão humana por princípio</strong><small>A inteligência artificial desta demonstração é inteiramente emulada.</small></div></div><ul class="mb-0"><li>A IA não aprova, elimina ou movimenta candidatos.</li><li>Ausência de evidência significa <strong>não comprovado</strong>.</li><li>Scores são indicadores, nunca decisões.</li><li>Dados sensíveis e observações de acessibilidade ficam fora da análise.</li><li>Toda movimentação exige justificativa e autoria humana.</li></ul>';
            this.openModal('Como usamos IA', body, '<button class="btn" type="button" data-bs-dismiss="modal">Entendi</button>');
        },

        showNotifications: function () {
            const items = window.BardStore.get().notifications;
            const body = items.length ? items.map(function (n) { return '<article class="sim-list-row sim-notification ' + (n.read ? '' : 'unread') + '"><div class="sim-list-copy"><strong>' + window.BardViews.escape(n.text) + '</strong><small>' + window.BardViews.formatDate(n.at) + '</small></div></article>'; }).join('') : '<div class="sim-empty">Nenhuma notificação.</div>';
            this.openModal('Notificações', body, '<button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Fechar</button>');
        },

        markNotifications: function () {
            window.BardStore.update(function (state) { state.notifications.forEach(function (n) { n.read = true; }); });
            this.render();
            this.toast('Notificações atualizadas', 'Todas foram marcadas como lidas.', 'success');
        },

        saveProfile: function (form) {
            if (!form.reportValidity()) return;
            const button = form.querySelector('button[type="submit"]');
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Salvando';
            const values = Object.fromEntries(new FormData(form).entries());
            setTimeout(function () {
                window.BardStore.update(function (state) {
                    ['name', 'headline', 'city', 'state', 'workModel', 'availability', 'education', 'desiredSalary', 'summary', 'experience', 'skills', 'accessibility'].forEach(function (key) { state.profile[key] = values[key] || ''; });
                    state.profile.relocation = form.elements.relocation.checked;
                });
                App.render();
                App.toast('Perfil atualizado', 'As informações foram salvas apenas neste navegador.', 'success');
            }, 450);
        },

        showResumeUpload: function () {
            const region = document.getElementById('resumeUploadRegion');
            region.hidden = false;
            document.getElementById('resumeDropzone').focus();
        },

        cancelResumeUpload: function () {
            this.pendingFile = null;
            const region = document.getElementById('resumeUploadRegion');
            if (region) region.hidden = true;
        },

        validateFile: function (file) {
            const allowed = ['pdf', 'docx', 'html', 'htm', 'txt'];
            const extension = file.name.split('.').pop().toLowerCase();
            const error = document.getElementById('uploadError');
            const selected = document.getElementById('selectedFile');
            const confirm = document.querySelector('[data-action="confirm-resume"]');
            if (!allowed.includes(extension)) {
                this.pendingFile = null;
                error.textContent = 'Formato não permitido. Use PDF, DOCX, HTML ou TXT.';
                selected.innerHTML = '';
                confirm.disabled = true;
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                this.pendingFile = null;
                error.textContent = 'O arquivo ultrapassa o limite de 10 MB.';
                selected.innerHTML = '';
                confirm.disabled = true;
                return;
            }
            this.pendingFile = { name: file.name, type: file.type || 'application/octet-stream', size: file.size };
            error.textContent = '';
            selected.innerHTML = '<span class="badge badge-green">Pronto</span> <strong>' + window.BardViews.escape(file.name) + '</strong> · ' + this.formatBytes(file.size);
            confirm.disabled = false;
        },

        confirmResume: function () {
            if (!this.pendingFile) return;
            const file = this.pendingFile;
            window.BardStore.update(function (state) {
                state.resume = { name: file.name, type: file.type, size: file.size, version: state.resume.version + 1, status: 'Processado', primary: true, updatedAt: new Date().toISOString() };
            });
            this.pendingFile = null;
            this.render();
            this.toast('Currículo substituído', 'A alteração foi simulada localmente. Nenhum arquivo foi enviado.', 'success');
        },

        previewResume: function () {
            const p = window.BardStore.get().profile;
            const body = '<div class="alert alert-info"><strong>Visualização segura:</strong> o conteúdo abaixo é uma representação textual controlada.</div><article class="sim-safe-preview"><h2>' + window.BardViews.escape(p.name) + '</h2><p><strong>' + window.BardViews.escape(p.headline) + '</strong></p><h3>Resumo</h3><p>' + window.BardViews.escape(p.summary) + '</p><h3>Experiência</h3><p>' + window.BardViews.escape(p.experience) + '</p><h3>Formação</h3><p>' + window.BardViews.escape(p.education) + '</p><h3>Habilidades</h3><p>' + window.BardViews.escape(p.skills) + '</p></article>';
            this.openModal('Currículo demonstrativo', body, '<a class="btn btn-secondary" href="assets/curriculo-ana-beatriz-souza.html" target="_blank" rel="noopener">Abrir arquivo modelo</a><button class="btn" type="button" data-bs-dismiss="modal">Fechar</button>');
        },

        submitApplication: function (form) {
            const error = document.getElementById('applicationError');
            if (!form.reportValidity()) {
                error.textContent = 'Revise os campos e confirme o uso responsável da IA.';
                return;
            }
            const values = Object.fromEntries(new FormData(form).entries());
            window.BardStore.update(function (state) {
                state.scenario.candidateSubmitted = true;
                state.scenario.aiComplete = false;
                state.application.coverLetter = values.coverLetter;
                state.application.answers = { availability: values.availability, shift: values.shift };
                state.application.status = 'enviada';
                state.application.submittedAt = new Date().toISOString();
                state.application.interview = null;
                state.application.history = [{ status: 'enviada', at: new Date().toISOString(), reason: 'Candidatura enviada pela candidata.' }];
                state.candidates[0].status = 'enviada';
            });
            window.BardStore.advanceGuide('candidate', 4);
            window.BardRouter.navigate('/candidato/candidaturas/1');
            this.toast('Candidatura enviada', 'O processamento simulado foi iniciado.', 'success');
            this.runAiSequence();
        },

        runAiSequence: function () {
            const sequence = [
                ['em_processamento', 'Extraindo informações e removendo dados pessoais desnecessários.'],
                ['triagem_ia_concluida', 'Parecer explicável gerado com base em evidências profissionais.'],
                ['aguardando_revisao_humana', 'Análise encaminhada para decisão humana.']
            ];
            sequence.forEach(function (step, index) {
                setTimeout(function () {
                    window.BardStore.update(function (state) {
                        state.application.status = step[0];
                        state.candidates[0].status = step[0] === 'triagem_ia_concluida' ? 'em_processamento' : step[0];
                        state.application.history.push({ status: step[0], at: new Date().toISOString(), reason: step[1] });
                        if (index === sequence.length - 1) {
                            state.scenario.aiComplete = true;
                            state.notifications.unshift({ id: Date.now(), text: 'Seu parecer de aderência está disponível e aguarda revisão humana.', at: new Date().toISOString(), read: false });
                            state.audit.unshift({ id: Date.now() + 1, at: new Date().toISOString(), user: 'Simulador de IA', action: 'Parecer gerado', entity: 'Ana Beatriz · Auxiliar de Logística', result: 'Concluído', reason: 'Parecer encaminhado sem decisão automática.' });
                        }
                    });
                    if (window.BardRouter.current() === '/candidato/candidaturas/1') App.render();
                    if (index === sequence.length - 1) App.toast('Parecer disponível', 'A candidatura agora aguarda revisão humana.', 'success');
                }, 650 * (index + 1));
            });
        },

        toggleDecisionFields: function (value) {
            const fields = document.getElementById('interviewFields');
            if (!fields) return;
            const show = value === 'entrevista_agendada';
            fields.hidden = !show;
            ['interviewDate', 'interviewTime', 'interviewLocation', 'interviewMessage'].forEach(function (id) { document.getElementById(id).required = show; });
            if (show) {
                const date = document.getElementById('interviewDate');
                if (!date.value) {
                    const next = new Date(Date.now() + 2 * 86400000);
                    date.value = next.toISOString().slice(0, 10);
                    document.getElementById('interviewTime').value = '10:00';
                }
            }
            const rejection = document.getElementById('rejectionFields');
            const rejecting = value === 'nao_selecionada';
            rejection.hidden = !rejecting;
            ['rejectionReason', 'rejectionMessage'].forEach(function (id) { document.getElementById(id).required = rejecting; });
        },

        prepareDecision: function (form) {
            const error = document.getElementById('decisionError');
            const data = Object.fromEntries(new FormData(form).entries());
            if (!data.targetStatus) { error.textContent = 'Selecione a nova etapa.'; return; }
            if (!data.notes || data.notes.trim().length < 10) { error.textContent = 'A justificativa humana deve ter pelo menos 10 caracteres.'; return; }
            if (!form.reportValidity()) { error.textContent = 'Preencha os campos obrigatórios antes de continuar.'; return; }
            error.textContent = '';
            this.pendingDecision = data;
            const isInterview = data.targetStatus === 'entrevista_agendada';
            const isRejection = data.targetStatus === 'nao_selecionada';
            const body = '<div class="sim-ai-banner"><span>H</span><div><strong>Confirmação de decisão humana</strong><small>A movimentação será atribuída a ' + window.BardViews.escape(data.owner) + '.</small></div></div><dl class="row mb-0"><dt class="col-sm-4">Nova etapa</dt><dd class="col-sm-8">' + window.BardViews.escape(window.BardData.statusLabels[data.targetStatus]) + '</dd><dt class="col-sm-4">Justificativa</dt><dd class="col-sm-8">' + window.BardViews.escape(data.notes) + '</dd>' + (isInterview ? '<dt class="col-sm-4">Entrevista</dt><dd class="col-sm-8">' + window.BardViews.escape(data.interviewDate + ' às ' + data.interviewTime + ' · ' + data.interviewMode) + '</dd>' : '') + '</dl>';
            const rejectionNote = isRejection ? '<div class="alert alert-warning mt-3 mb-0"><strong>Mensagem ao candidato:</strong> ' + window.BardViews.escape(data.rejectionMessage) + '</div>' : '';
            this.openModal('Revisar movimentação', body + rejectionNote, '<button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Voltar</button><button class="btn btn-teal" type="button" data-action="confirm-decision">Confirmar decisão humana</button>');
        },

        confirmDecision: function () {
            if (!this.pendingDecision) return;
            const d = this.pendingDecision;
            window.BardStore.update(function (state) {
                state.scenario.candidateSubmitted = true;
                state.application.status = d.targetStatus;
                state.candidates[0].status = d.targetStatus;
                state.application.history.push({ status: d.targetStatus, at: new Date().toISOString(), reason: d.notes + ' — decisão registrada por ' + d.owner + '.' });
                if (d.targetStatus === 'entrevista_agendada') {
                    state.application.interview = { at: new Date(d.interviewDate + 'T' + d.interviewTime + ':00').toISOString(), mode: d.interviewMode, location: d.interviewLocation, owner: d.owner, message: d.interviewMessage };
                }
                const message = d.targetStatus === 'entrevista_agendada' ? 'Sua entrevista para Auxiliar de Logística foi agendada. Consulte os detalhes.' : (d.targetStatus === 'nao_selecionada' ? d.rejectionMessage : 'Sua candidatura foi atualizada para: ' + window.BardData.statusLabels[d.targetStatus] + '.');
                state.notifications.unshift({ id: Date.now(), text: message, at: new Date().toISOString(), read: false });
                state.audit.unshift({ id: Date.now() + 1, at: new Date().toISOString(), user: d.owner, action: d.targetStatus === 'entrevista_agendada' ? 'Entrevista agendada' : (d.targetStatus === 'nao_selecionada' ? 'Não seleção registrada' : 'Etapa alterada'), entity: 'Ana Beatriz · Auxiliar de Logística', result: 'Concluído', reason: d.targetStatus === 'nao_selecionada' ? d.rejectionReason + ': ' + d.notes : d.notes });
                state.guide.admin = 4;
            });
            this.pendingDecision = null;
            this.modal.hide();
            this.render();
            this.toast('Decisão registrada', 'O histórico, a auditoria e a jornada do candidato foram atualizados.', 'success');
        },

        submitException: function (form) {
            if (!form.reportValidity()) return;
            const d = Object.fromEntries(new FormData(form).entries());
            window.BardStore.addAudit('Exceção de ranking registrada', 'Ana Beatriz · Auxiliar de Logística', d.reason + ': ' + d.description + ' · Risco ' + d.risk + '.');
            form.reset();
            this.toast('Exceção registrada', 'A justificativa ficou disponível na auditoria.', 'success');
        },

        showWithdrawModal: function () {
            this.openModal('Retirar candidatura', '<p>Deseja retirar sua candidatura para Auxiliar de Logística?</p><p class="text-muted mb-0">A retirada será registrada no histórico e não poderá ser desfeita nesta simulação.</p>', '<button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-danger" type="button" data-action="confirm-withdraw">Retirar candidatura</button>');
        },

        confirmWithdraw: function () {
            window.BardStore.update(function (state) {
                state.application.status = 'retirada';
                state.candidates[0].status = 'retirada';
                state.application.history.push({ status: 'retirada', at: new Date().toISOString(), reason: 'Retirada pela própria candidata.' });
                state.audit.unshift({ id: Date.now(), at: new Date().toISOString(), user: 'Ana Beatriz Souza', action: 'Candidatura retirada', entity: 'Auxiliar de Logística', result: 'Concluído', reason: 'Retirada solicitada pela candidata.' });
            });
            this.modal.hide();
            this.render();
            this.toast('Candidatura retirada', 'A movimentação foi registrada no histórico.', 'success');
        },

        filterJobs: function () {
            const search = (document.getElementById('jobSearch').value || '').toLowerCase();
            const city = document.getElementById('jobCity').value;
            const area = document.getElementById('jobArea').value;
            const model = document.getElementById('jobModel').value;
            let visible = 0;
            document.querySelectorAll('[data-job-card]').forEach(function (card) {
                const matches = card.dataset.title.includes(search) && (!city || card.dataset.city === city) && (!area || card.dataset.area === area) && (!model || card.dataset.model === model);
                card.hidden = !matches;
                if (matches) visible += 1;
            });
            document.getElementById('jobResultCount').textContent = visible + (visible === 1 ? ' oportunidade encontrada' : ' oportunidades encontradas');
            document.getElementById('jobEmpty').hidden = visible !== 0;
        },

        clearJobFilters: function () {
            ['jobSearch', 'jobCity', 'jobArea', 'jobModel'].forEach(function (id) { document.getElementById(id).value = ''; });
            this.filterJobs();
        },

        filterCandidates: function () {
            const search = (document.getElementById('candidateSearch').value || '').toLowerCase();
            const stage = document.getElementById('candidateStage').value;
            const score = document.getElementById('candidateScore').value;
            const sort = document.getElementById('candidateSort').value;
            document.querySelectorAll('[data-candidate-card]').forEach(function (card) {
                const value = Number(card.dataset.score);
                const scoreMatch = score === '' || (score === '0' ? value < 70 : value >= Number(score));
                card.hidden = !(card.dataset.name.includes(search) && (!stage || card.dataset.status === stage) && scoreMatch);
            });
            document.querySelectorAll('[data-column]').forEach(function (column) {
                const cards = Array.from(column.querySelectorAll('[data-candidate-card]'));
                const visible = cards.filter(function (card) { return !card.hidden; });
                column.querySelector('[data-count]').textContent = visible.length;
                if (sort.startsWith('score')) {
                    cards.sort(function (a, b) { return sort === 'score-desc' ? Number(b.dataset.score) - Number(a.dataset.score) : Number(a.dataset.score) - Number(b.dataset.score); }).forEach(function (card) { column.querySelector('[data-cards]').appendChild(card); });
                }
            });
        },

        clearCandidateFilters: function () {
            ['candidateSearch', 'candidateStage', 'candidateScore'].forEach(function (id) { document.getElementById(id).value = ''; });
            document.getElementById('candidateSort').value = 'stage';
            this.filterCandidates();
        },

        filterAudit: function () {
            const value = document.getElementById('auditFilter').value.toLowerCase();
            document.querySelectorAll('[data-audit-row]').forEach(function (row) { row.hidden = value && !row.dataset.actionName.includes(value); });
        },

        clearAuditFilter: function () {
            document.getElementById('auditFilter').value = '';
            this.filterAudit();
        },

        openModal: function (title, body, footer) {
            document.getElementById('appModalTitle').textContent = title;
            document.getElementById('appModalBody').innerHTML = body;
            document.getElementById('appModalFooter').innerHTML = footer;
            this.modal.show();
        },

        toast: function (title, message, tone) {
            const id = 'toast-' + Date.now();
            const region = document.getElementById('toastRegion');
            const safeTitle = window.BardViews.escape(title);
            const safeMessage = window.BardViews.escape(message);
            region.insertAdjacentHTML('beforeend', '<div id="' + id + '" class="toast" role="status" aria-live="polite" aria-atomic="true"><div class="toast-header"><span class="badge badge-' + (tone === 'success' ? 'green' : 'blue') + ' me-2">B</span><strong class="me-auto">' + safeTitle + '</strong><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button></div><div class="toast-body">' + safeMessage + '</div></div>');
            const element = document.getElementById(id);
            const toast = new bootstrap.Toast(element, { delay: 4200 });
            element.addEventListener('hidden.bs.toast', function () { element.remove(); });
            toast.show();
        },

        formatBytes: function (bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / 1048576).toFixed(1) + ' MB';
        }
    };

    window.BardApp = App;
    document.addEventListener('DOMContentLoaded', function () { App.init(); });
}());
