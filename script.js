const width = 2000;
const height = 1000;
const margin = {top: 20, right: 300, bottom: 30, left: 150}; // Margem maior à direita também

let currentRoot = null;
let navigationStack = []; // Stack para navegação
let originalRoot = null; // Referência ao nó raiz original

function loadData() {
  d3.json("family_tree.json").then(data => {
    const root = d3.hierarchy(data);
    root.x0 = height / 2;
    root.y0 = 0;
    
    // Armazena a referência do nó raiz original
    originalRoot = root;
    
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    
    // Inicializa o stack de navegação com o nó raiz
    navigationStack = [root];
    currentRoot = root;
    
    update(root);
  });
}

function update(source) {
  const treeLayout = d3.tree().size([height, width - margin.left - margin.right]);
  const treeData = treeLayout(source);

  const nodes = treeData.descendants();
  const links = treeData.links();

  // Define posição dos nós com margens adequadas
  nodes.forEach(d => {
    d.y = d.depth * 250 + margin.left; // Maior espaçamento entre níveis
    d.x = d.x + margin.top;
    
    // Ajusta posição vertical para filhos únicos para evitar sobreposição
    if (d.parent && d.parent.children && d.parent.children.length === 1) {
      d.x = d.x + 40; // Move 40px para baixo se for filho único
    }
  });

  const svg = d3.select("#tree");
  svg.selectAll("*").remove(); // Limpa antes de redesenhar

  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 2)
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("d", d => diagonal(d.source, d.target));

  const node = svg.append("g")
    .selectAll("g")
    .data(nodes, d => d.id || (d.id = ++i))
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${source.y0 || margin.left},${source.x0 || height/2})`)
    .on("click", (event, d) => {
      event.stopPropagation(); // Previne bubbling
      
      // NOVA LÓGICA DE NAVEGAÇÃO:
      // 1. Se tem filhos (expandidos ou não) e não é folha, navega para esse nó
      // 2. Se é folha (não tem filhos), volta para geração anterior
      
      if (d.children || d._children) {
        // Tem filhos - navega para esse nó mantendo os pais visíveis
        navigateToNode(d);
      } else {
        // É folha - volta para geração anterior
        goToParent();
      }
    });

  node.append("circle")
    .attr("r", 6)
    .attr("fill", d => {
      // Destaca nós que podem expandir (têm filhos)
      if (d.children || d._children) {
        return "#007BFF"; // Azul para nós com filhos
      } else {
        return "#28a745"; // Verde para folhas (clique volta)
      }
    });

  // Texto posicionado à direita do círculo
  node.append("text")
    .attr("dy", ".35em")
    .attr("x", 20)  // 20px à direita do centro do círculo
    .attr("text-anchor", "start")  // Sempre alinhado à esquerda
    .text(d => d.data.name);

  // Animação de entrada
  node.transition()
    .duration(750)
    .attr("transform", d => `translate(${d.y},${d.x})`);

  nodes.forEach(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Calcula o tamanho necessário baseado na posição dos nós
  const maxX = d3.max(nodes, d => d.x) + margin.bottom;
  const maxY = d3.max(nodes, d => d.y) + margin.right;
  const minX = d3.min(nodes, d => d.x) - margin.top;
  const minY = d3.min(nodes, d => d.y) - margin.left;

  const svgWidth = Math.max(maxY - minY + 100, width);
  const svgHeight = Math.max(maxX - minX + 100, height);
  
  svg.attr("width", svgWidth);
  svg.attr("height", svgHeight);
  
  // Atualiza o estado atual
  currentRoot = source;
}

// NOVA FUNÇÃO: Navegar para um nó específico mantendo os pais
function navigateToNode(targetNode) {
  // Expande o nó alvo para mostrar seus filhos
  if (targetNode._children) {
    targetNode.children = targetNode._children;
    targetNode._children = null;
  }
  
  // Adiciona ao stack de navegação
  navigationStack.push(targetNode);
  currentRoot = targetNode;
  
  // Atualiza a visualização focando no nó alvo
  update(targetNode);
}

// Função para voltar ao nó anterior
function goToParent() {
  if (navigationStack.length > 1) {
    navigationStack.pop(); // Remove o nó atual
    const previousNode = navigationStack[navigationStack.length - 1];
    
    // Colapsa o nó atual se ele tem filhos expandidos
    if (currentRoot && currentRoot.children) {
      currentRoot._children = currentRoot.children;
      currentRoot.children = null;
    }
    
    // Expande o nó anterior para mostrar seus filhos
    if (previousNode._children) {
      previousNode.children = previousNode._children;
      previousNode._children = null;
    }
    
    currentRoot = previousNode;
    update(previousNode);
  } else {
    alert("Você já está no início da árvore.");
  }
}

// Função para voltar ao nó raiz
function goToRoot() {
  if (originalRoot) {
    // Colapsa todos os nós
    function collapseAll(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapseAll);
        d.children = null;
      }
    }
    
    collapseAll(originalRoot);
    
    // Expande apenas o primeiro nível
    if (originalRoot._children) {
      originalRoot.children = originalRoot._children;
      originalRoot._children = null;
    }
    
    // Reseta o stack de navegação
    navigationStack = [originalRoot];
    currentRoot = originalRoot;
    
    update(originalRoot);
  }
}

function diagonal(s, d) {
  return `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`;
}

let i = 0;
loadData();