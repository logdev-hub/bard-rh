(function () {
    'use strict';

    const validRoutes = [
        '/login', '/candidato/inicio', '/candidato/perfil', '/candidato/curriculo',
        '/candidato/vagas', '/candidato/vagas/auxiliar-de-logistica', '/candidato/candidaturas',
        '/candidato/candidaturas/1', '/admin/inicio', '/admin/vagas',
        '/admin/vagas/1/candidatos', '/admin/candidatos/1', '/admin/auditoria'
    ];

    function current() {
        const value = window.location.hash.replace(/^#/, '') || '/login';
        return validRoutes.includes(value) ? value : '/login';
    }

    function navigate(path) {
        if (current() === path) {
            window.BardApp.render();
            return;
        }
        window.location.hash = path;
    }

    function guard(path) {
        const role = window.BardStore.get().session.role;
        if (path.startsWith('/candidato') && role !== 'candidate') return '/login';
        if (path.startsWith('/admin') && role !== 'admin') return '/login';
        if (path === '/login' && role) return role === 'candidate' ? '/candidato/inicio' : '/admin/inicio';
        return path;
    }

    window.BardRouter = { current: current, navigate: navigate, guard: guard };
}());
