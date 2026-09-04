(function () {
    'use strict';

    const config = window.BardData;

    function cloneInitial() {
        return config.initialState();
    }

    function load() {
        try {
            const parsed = JSON.parse(localStorage.getItem(config.storageKey));
            if (parsed && parsed.version === 1) return parsed;
        } catch (error) {
            console.warn('Não foi possível recuperar a simulação.', error);
        }
        const initial = cloneInitial();
        localStorage.setItem(config.storageKey, JSON.stringify(initial));
        return initial;
    }

    let state = load();

    window.BardStore = {
        get: function () { return state; },
        save: function () {
            localStorage.setItem(config.storageKey, JSON.stringify(state));
            window.dispatchEvent(new CustomEvent('bard:state', { detail: state }));
        },
        update: function (updater) {
            updater(state);
            this.save();
            return state;
        },
        reset: function () {
            state = cloneInitial();
            this.save();
            return state;
        },
        login: function (role) {
            const account = config.credentials[role];
            state.session = { role: role, name: account.name };
            state.audit.unshift({ id: Date.now(), at: new Date().toISOString(), user: account.name, action: 'Login demonstrativo', entity: role === 'candidate' ? 'Jornada do candidato' : 'Jornada do administrador', result: 'Sucesso', reason: 'Acesso realizado no simulador local.' });
            this.save();
        },
        logout: function () {
            state.session = { role: null, name: null };
            this.save();
        },
        advanceGuide: function (role, targetIndex) {
            if (!role || typeof state.guide[role] !== 'number') return;
            state.guide[role] = Math.max(state.guide[role], targetIndex);
            this.save();
        },
        addAudit: function (action, entity, reason) {
            state.audit.unshift({
                id: Date.now(), at: new Date().toISOString(),
                user: state.session.name || 'Simulador', action: action,
                entity: entity, result: 'Concluído', reason: reason
            });
            this.save();
        },
        addNotification: function (text) {
            state.notifications.unshift({ id: Date.now(), text: text, at: new Date().toISOString(), read: false });
            this.save();
        }
    };
}());
