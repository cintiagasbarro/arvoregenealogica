const width = 2000;
const height = 1000;

let currentRoot = null;
let historyStack = [];

function loadData() {
    d3.json("family_tree.json").then(data => {
    const root = d3.hierarchy(data);
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);
  });
}

function update(source) {
  const treeLayout = d3.tree().size([height, width / 2.5]);
  const treeData = treeLayout(source);

  const nodes = treeData.descendants();
  const links = treeData.links();

  // Define posição dos nós
  nodes.forEach(d => d.y = d.depth * 200);

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
    .attr("transform", d => `translate(${source.y0},${source.x0})`)
    .on("click", (event, d) => {
      if (d.children) {
        // Se já expandido, colapsa
        d._children = d.children;
        d.children = null;
      } else {
        // Se colapsado, expande
        d.children = d._children;
        d._children = null;
      }
      update(d);
    });

  node.append("circle")
    .attr("r", 6)
    .attr("fill", "#007BFF");

  // ALTERAÇÃO PRINCIPAL - TEXTO MAIS À DIREITA
  node.append("text")
    .attr("dy", ".35em")
    .attr("x", 20)  // SEMPRE 20px à direita do centro do círculo
    .attr("text-anchor", "start")  // SEMPRE alinhado à esquerda (início do texto)
    .text(d => d.data.name);

  // Animação de entrada
  node.transition()
    .duration(750)
    .attr("transform", d => `translate(${d.y},${d.x})`);

  nodes.forEach(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Atualiza o tamanho do SVG
  const boundingBox = svg.node().getBBox();
  svg.attr("width", boundingBox.width + 100); // Adiciona margem extra
  svg.attr("height", boundingBox.height + 100);

  // Armazena histórico para voltar
  historyStack.push(source);
  currentRoot = source;
}

// Função para voltar ao nó anterior
function goToParent() {
  if (historyStack.length > 1) {
    historyStack.pop(); // Remove o último nó da pilha
    const previousNode = historyStack[historyStack.length - 1];
    update(previousNode);
  } else {
    alert("Você está no início.");
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