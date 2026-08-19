/*
 * DESIGN: "Serra Dourada" — dados do roteiro.
 * Cada parada tem query Google Maps + coordenadas de referência.
 */

export interface Parada {
  id: string;
  hora: string;
  titulo: string;
  local: string;
  endereco: string;
  coords: [number, number]; // lat, lng
  descricao: string;
  tipo: "encontro" | "cafe" | "turismo" | "almoco" | "natureza" | "mirante";
  imagem?: string;
  observacao?: string;
}

// Ponto de encontro (Mix Mateus Maranguape)
export const PONTO_ENCONTRO: Parada = {
  id: "encontro",
  hora: "07h45",
  titulo: "Ponto de encontro: Mix Mateus",
  local: "Mix Mateus de Maranguape",
  endereco:
    "Av. Comandante Aviador Childerico Mota — Tangueira, Maranguape-CE",
  coords: [-3.8967191, -38.6737368],
  descricao:
    "Encontro do grupo no estacionamento do Mix Mateus de Maranguape, na BR-116, antes da subida da serra. Combine de abastecer antes: lá em cima os postos são raros.",
  tipo: "encontro",
};

export const PARADAS: Parada[] = [
  {
    id: "cafe",
    hora: "09h15",
    titulo: "Café de subida",
    local: "Café Brasil — Guaramiranga",
    endereco: "Estrada do maciço, Guaramiranga-CE",
    coords: [-4.2553965, -38.9683055],
    descricao:
      "Parada estratégica na subida: café da serra, pães artesanais e o primeiro abraço do clima fresco. O termômetro já mostra que Fortaleza ficou para trás.",
    tipo: "cafe",
    imagem: "/manus-storage/cafe_serra_5a00f3c9.png",
  },
  {
    id: "centro",
    hora: "10h30",
    titulo: "Chegada em Aratuba + Igreja Matriz",
    local: "Centro de Aratuba",
    endereco:
      "Av. Arlindo Medina, Centro — Aratuba-CE (Igreja Matriz de São Francisco de Paula)",
    coords: [-4.4189611, -39.045265],
    descricao:
      "A cidade mais alta do Ceará (960 m). Fotos na Igreja Matriz e caminhada pelas praças: ar puro, clima de cidadezinha serrana e lojinhas de artesanato.",
    tipo: "turismo",
  },
  {
    id: "mirantes",
    hora: "11h00",
    titulo: "Mirantes panorâmicos",
    local: "Estradas de Aratuba",
    endereco: "Maciço de Baturité, Aratuba-CE",
    coords: [-4.41, -39.05],
    descricao:
      "Vistas de 360° com a serra verde descendo para a caatinga dourada — o contraste fotográfico mais raro do Ceará. Pergunte aos moradores pelo mirante favorito deles.",
    tipo: "mirante",
  },
  {
    id: "almoco",
    hora: "12h30",
    titulo: "Almoço sertanejo-serrano",
    local: "Restaurantes de Aratuba",
    endereco: "Centro de Aratuba-CE (Val Paraíso, Rua Julio Pereira)",
    coords: [-4.418, -39.046],
    descricao:
      "Galinha caipira com pirão, baião de dois e feijão verde. O Sabor do Sítio (sab e dom, com reserva) é a pedida mais famosa da região.",
    tipo: "almoco",
  },
  {
    id: "cachoeira",
    hora: "14h00",
    titulo: "Banho de cachoeira",
    local: "Cachoeira da Surubaca",
    endereco: "Sítio Santo Antônio, Pai João — a ~5 km do centro de Aratuba",
    coords: [-4.4324365, -39.015701],
    descricao:
      "Trilha curta de ~1 km (10–15 min) até a cachoeira mais famosa de Aratuba: água gelada e cristalina num poço natural. Leve roupa de banho, toalha e troca de roupa.",
    tipo: "natureza",
    imagem: "/manus-storage/cachoeira_surbuaca_0d3c6711.png",
  },
  {
    id: "tardinha",
    hora: "16h00",
    titulo: "Café da tarde + lembranças",
    local: "Centro de Aratuba",
    endereco: "Centro de Aratuba-CE",
    coords: [-4.4189611, -39.045265],
    descricao:
      "Café produzido na própria serra, mel, rapadura, cachaça artesanal e queijos — as lembranças perfeitas da viagem.",
    tipo: "cafe",
  },
  {
    id: "putdosol",
    hora: "17h00",
    titulo: "Pôr do sol na serra",
    local: "Mirante voltado ao oeste",
    endereco: "Estrada de descida, Aratuba-CE",
    coords: [-4.41, -39.07],
    descricao:
      "Às ~17h40 o sol doura a caatinga lá embaixo. É a foto de ouro do dia — tire antes de começar a descida.",
    tipo: "mirante",
    imagem: "/manus-storage/por_do_sol_serra_94b82283.png",
  },
];

export const CHEGADA = {
  hora: "~20h",
  titulo: "Volta para Fortaleza",
  descricao:
    "Descida pela CE-356 com atenção redobrada nas curvas. Parada opcional para lanche em Itapiúna ou Cascavel. Chegada prevista entre 19h45 e 20h15.",
};

/** Gera URL do Google Maps traçando a rota até o destino.
 * Se `from` tiver coords, usa a origem exata; caso contrário usa
 * "localização atual" (current location) via destino vazio no modo rota. */
export function abrirRota(
  destino: string,
  coords: [number, number],
  from?: string,
  fromCoords?: [number, number]
) {
  const dest = `${coords[0]},${coords[1]}`;
  let url: string;
  if (fromCoords && from) {
    url = `https://www.google.com/maps/dir/${fromCoords[0]},${fromCoords[1]}/${dest}/@${coords[0]},${coords[1]},12z?travelmode=driving`;
  } else if (from) {
    url = `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${dest}/@${coords[0]},${coords[1]},12z?travelmode=driving`;
  } else {
    // do local onde a pessoa está
    url = `https://www.google.com/maps/dir//${dest}/@${coords[0]},${coords[1]},12z?travelmode=driving`;
  }
  window.open(url, "_blank", "noopener");
}

export const ITENS_CHECKLIST = [
  { categoria: "Documentos & dinheiro", itens: ["RG ou CNH", "Dinheiro em espécie", "Cartão do banco", "Chaves"] },
  { categoria: "Roupa & frio", itens: ["Casaco ou corta-vento", "Roupa de baixo para o banho", "Troca de roupa seca", "Tênis de trilha (nada de chinelo)"] },
  { categoria: "Cachoeira", itens: ["Toalha", "Saco plástico para roupa molhada", "Protetor solar", "Repelente"] },
  { categoria: "Eletrônicos", itens: ["Celular carregado", "Power bank", "Fones/caixinha"] },
  { categoria: "Comida & água", itens: ["Garrafa de água", "Lanche para a estrada", "Dinheiro para o café da subida"] },
];

export const CONVITE_WHATSAPP = () =>
  `🏔️ MISSÃO ARATUBA — Bate e volta Fortaleza → Serra de Aratuba\n\n📅 Saída: 08h00 (encontro no Mix Mateus de Maranguape às 07h45)\n☕ Café na subida · 📸 Centro de Aratuba · 💦 Cachoeira da Surubaca · 🌇 Pôr do sol na serra\n💰 Custo por pessoa: R$ 100–190\n\n📲 Roteiro completo e navegação:\n${typeof window !== "undefined" ? window.location.href : ""}`;

export function pesquisarLocal(query: string) {
  window.open(
    `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
    "_blank",
    "noopener"
  );
}
