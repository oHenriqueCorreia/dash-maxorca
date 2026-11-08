# Max no Zap — Inteligência de mídia

Dashboard executivo para apresentar a performance da Meta Ads do Max no Zap, os criativos exportados e um plano de testes para públicos, mensagens e oferta. A identidade visual usa a logomarca e as cores do [site oficial](https://maxorca.site/).

## Dados

O arquivo `dist/data.js` contém os totais agregados exportados de campanhas, conjuntos e anúncios entre **01/09/2026 e 08/11/2026**. O painel calcula indicadores diretamente dessas linhas. O script `build-data.ps1` reconstrói o arquivo a partir dos CSVs locais quando novas exportações estiverem disponíveis.

Leads do pixel, contatos no site e visitas ao perfil são eventos diferentes. O indicador de custo por resultado combinado considera apenas a verba e os resultados das campanhas de lead e contato. A exportação não contém série diária, receita realizada, qualificação dos leads ou vendas. Por isso o painel não apresenta tendência temporal nem ROAS realizado. A seção de faturamento é uma simulação ajustável.

Os CSVs de conjuntos e anúncios cobrem apenas parte das campanhas; não se devem somar métricas de níveis diferentes. Ideias de público, roteiro e oferta são recomendações para validar na conta e com a equipe comercial.

## Execução local

Sirva a pasta `dist` por HTTP, por exemplo:

```bash
npx serve dist
```

O projeto é estático (HTML, CSS e JavaScript) e a Vercel publica a pasta `dist` conforme `vercel.json`. `dashboard.js` faz os cálculos e controles; `scripts.js` contém hipóteses de roteiros; `brand.css` aplica a identidade do cliente. Chart.js está incluído localmente para o gráfico funcionar sem depender do CDN.
