# Simulador de jornadas — BARD RH

Protótipo estático com duas jornadas conectadas: Candidato e Administrador. Toda a simulação acontece no navegador e usa dados fictícios.

## Abrir

Abra `index.html` diretamente no navegador. Não é necessário Docker, PHP, banco de dados ou servidor HTTP.

Também é possível acessar a pasta por qualquer servidor estático local.

## Acessos

| Perfil | Usuário | Senha |
|---|---|---|
| Candidato | `candidato@teste.com` | `teste123` |
| Administrador | `admin@teste.com` | `teste123` |

Na tela inicial, use **Preencher acesso** para completar os campos sem entrar automaticamente.

## Roteiro recomendado

1. Entre como Candidato.
2. Abra **Vagas** e escolha **Auxiliar de Logística**.
3. Confira o currículo pré-anexado e envie a candidatura.
4. Aguarde o parecer simulado terminar em **Aguardando revisão humana**.
5. Saia e entre como Administrador.
6. Abra **Candidatos**, selecione Ana Beatriz e agende uma entrevista com justificativa.
7. Saia e volte como Candidato para consultar a notificação, a entrevista e o histórico atualizado.

O estado é persistido em `localStorage`. Use **Reiniciar simulação** para restaurar o cenário original.

## Limites intencionais

- Nenhum arquivo é enviado: o upload valida apenas metadados no navegador.
- A IA é totalmente emulada e não realiza chamadas externas.
- Somente Ana Beatriz possui o detalhe completo, pois ela conduz o roteiro principal.
- Todas as informações são fictícias e exclusivas do protótipo.
