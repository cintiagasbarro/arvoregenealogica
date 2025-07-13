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
  const treeLayout = d3.tree().size([height, width / 2.5]);
  const treeData = treeLayout(source);

  const nodes = treeData.descendants();
  const links = treeData.links();

  // Define posição dos nós com margem à esquerda
  nodes.forEach(d => d.y = d.depth * 200 + margin.left);

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
    .attr("transform", d => `translate(${source.y0},${source.x0})`)
    .on("click", (event, d) => {
      event.stopPropagation(); // Previne bubbling
      
      if (d.children) {
        // Se já expandido, colapsa
        d._children = d.children;
        d.children = null;
      } else {
        // Se colapsado, expande
        d.children = d._children;
        d._children = null;
      }
      
      // Atualiza o stack de navegação apenas quando expandindo um nó
      if (d.children) {
        navigationStack.push(d);
        currentRoot = d;
      }
      
      update(d);
    });

  node.append("circle")
    .attr("r", 6)
    .attr("fill", "#007BFF");

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

  // Atualiza o tamanho do SVG com margens adequadas
  const boundingBox = svg.node().getBBox();
  const svgWidth = Math.max(boundingBox.width + margin.left + margin.right + 100, width);
  const svgHeight = Math.max(boundingBox.height + margin.top + margin.bottom + 100, height);
  
  svg.attr("width", svgWidth);
  svg.attr("height", svgHeight);
  
  // Atualiza também o viewBox para garantir que tudo seja visível
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // Atualiza o estado atual
  currentRoot = source;
}

// Função para voltar ao nó anterior
function goToParent() {
  if (navigationStack.length > 1) {
    navigationStack.pop(); // Remove o nó atual
    const previousNode = navigationStack[navigationStack.length - 1];
    
    // Colapsa o nó atual e expande o anterior
    if (currentRoot && currentRoot.children) {
      currentRoot._children = currentRoot.children;
      currentRoot.children = null;
    }
    
    // Expande o nó anterior
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