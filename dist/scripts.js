/* Variações propostas: o CSV não contém o roteiro audiovisual original. */
const SCRIPT_SETS = [
  {
    match:'RAFACAR PDF',
    title:'RAFACAR PDF • papel para PDF',
    body:'Manter a sequência original de urgência do cliente, orçamento em papel e transformação em PDF. Confirmar cada cena no vídeo original.',
    hooks:[
      'O cliente pediu o orçamento agora. O papel ainda está na bancada?',
      'Quanto tempo você leva para transformar um pedido em orçamento?',
      'Essa folha amassada pode estar atrasando o próximo serviço.',
      'Cliente com pressa e orçamento no papel: olha esta saída.',
      'Antes de perder a venda por demora, veja este orçamento.'
    ],
    endings:[
      'Mostre o PDF pronto e convide para conhecer a solução.',
      'Feche com a comparação papel versus PDF e um convite para testar.',
      'Retome a urgência do cliente e chame para solicitar uma demonstração.',
      'Termine com o arquivo enviado e a pergunta: como seria na sua oficina?',
      'Mostre a entrega final e convide a criar o próximo orçamento.'
    ]
  },
  {
    match:'REVIEW',
    title:'REVIEW • prova visual',
    body:'Manter a demonstração rápida do produto e a prova visual que aparecem no conceito. Validar tela, falas e duração com o arquivo original.',
    hooks:[
      'Quer ver um orçamento profissional sendo feito na prática?',
      'Sem promessa: olha a tela e julgue o resultado.',
      'Este é o antes e depois de um orçamento de oficina.',
      'Quanto tempo você acha que levou para chegar a esta tela?',
      'Se o cliente pede clareza, mostre o orçamento assim.'
    ],
    endings:[
      'Volte à tela final e convide para ver uma demonstração completa.',
      'Feche com o resultado visual e convide a testar na própria rotina.',
      'Reforce o que a demonstração mostrou e peça um contato.',
      'Termine com um resumo de uma frase e um convite para conhecer.',
      'Mostre o orçamento pronto e convide a comparar com o processo atual.'
    ]
  },
  {
    match:'TRINITY',
    title:'TRINITY • rotina corrida',
    body:'Manter a situação do profissional trabalhando sozinho e a passagem da correria para o orçamento. Conferir a narrativa real no vídeo original.',
    hooks:[
      'Você atende, executa e ainda precisa montar orçamento sozinho?',
      'A oficina está cheia. Quem vai parar para fazer o orçamento?',
      'Quando tudo depende de uma pessoa, cada minuto conta.',
      'Mais um cliente chegando e o orçamento anterior nem saiu.',
      'Essa cena é familiar para quem toca a oficina quase sozinho?'
    ],
    endings:[
      'Retome o tempo ganho e convide a conhecer a ferramenta.',
      'Feche com a rotina mais organizada e um convite para testar.',
      'Mostre o orçamento concluído e pergunte se o público quer simplificar.',
      'Reforce a entrega ao cliente e convide para pedir uma demonstração.',
      'Termine na oficina em movimento, com o próximo passo de cadastro.'
    ]
  },
  ...['01','02','03'].map(number=>({
    match:'Vt Ad Campeao '+number,
    title:'Vt Ad Campeao '+number+' • contato no site',
    body:'Preservar integralmente o miolo e o sentido do vídeo original. O CSV não descreve cenas, argumento ou falas; revisar o arquivo antes de produzir.',
    hooks:[
      'Você também precisa entregar um orçamento com mais agilidade?',
      'Olha o que muda quando o orçamento fica mais simples.',
      'Sua oficina ainda perde tempo com esse processo?',
      'Tem um jeito mais direto de apresentar o próximo orçamento.',
      'Antes de enviar o próximo orçamento, veja isto.'
    ],
    endings:[
      'Reforce o benefício demonstrado no miolo e convide para entrar em contato.',
      'Retome a cena final original e convide para conhecer a solução.',
      'Faça uma pergunta ligada ao problema mostrado e convide para contato.',
      'Mostre o resultado já presente no vídeo e convide a solicitar detalhes.',
      'Feche com a proposta original e um convite claro para falar com a equipe.'
    ]
  }))
];
document.addEventListener('DOMContentLoaded',()=>{
  const grid=document.getElementById('script-grid');
  grid.innerHTML=SCRIPT_SETS.map(set=>{
    const creative=CREATIVES.find(c=>c.name.includes(set.match));
    return `<article class="script-card"><div class="script-head"><span>5 VARIAÇÕES</span><h3>${esc(set.title)}</h3><p>${creative ? integer(creative.results)+' '+(creative.objective==='lead'?'leads':'contatos')+' • '+money(creative.cpa)+' por resultado no período completo' : 'Conceito do CSV'}</p></div>
      <div class="script-core"><strong>Miolo fixo</strong><p>${esc(set.body)}</p></div>
      <div class="script-variants">${set.hooks.map((hook,i)=>`<div class="script-variant"><b>${String(i+1).padStart(2,'0')}</b><div><p><strong>Hook:</strong> ${esc(hook)}</p><p><strong>Desfecho:</strong> ${esc(set.endings[i])}</p></div></div>`).join('')}</div></article>`;
  }).join('');
});
