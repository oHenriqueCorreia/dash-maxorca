# MaxOrça — Performance & Growth Dashboard

Dashboard executiva de tráfego pago desenvolvida para apresentar resultados, criativos, públicos e planejamento comercial da MaxOrça.

## Recursos

- KPIs de investimento, cliques, CTR, CPC, conversões e CPA.
- Filtros por campanha, objetivo, status e intervalo de datas.
- Gráficos interativos com Chart.js.
- Tabela detalhada e ordenável das campanhas.
- Ranking dos melhores criativos.
- Laboratório de novas ideias e planejamento de públicos.
- Planejamento de Black Friday e fim de ano.
- Simulador de leads, vendas, faturamento e ROAS.
- Layout responsivo para desktop, tablet e smartphone.

## Tecnologias

- HTML5
- CSS3 e Tailwind CSS via CDN
- JavaScript sem frameworks
- Chart.js
- Vercel

## Estrutura

```text
dist/
├── index.html
├── styles.css
└── app.js
```

## Desenvolvimento local

Sirva a pasta `dist` com qualquer servidor HTTP estático. Exemplo:

```bash
python -m http.server 4173 --directory dist
```

Depois acesse `http://localhost:4173`.

## Observação sobre os dados

Os arquivos de origem apresentam resultados agregados entre 1º de agosto e 4 de novembro de 2026. Quando um intervalo menor é selecionado, a dashboard identifica os valores como estimativas proporcionais. Receita e ROAS realizados não estavam disponíveis nos arquivos originais; o módulo de ROAS é um simulador de cenário.
