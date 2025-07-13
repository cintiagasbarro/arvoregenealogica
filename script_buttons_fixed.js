// Dados da família embutidos
const familyData = {
  "name": "Eurípedes e Marta",
  "children": [
    {
      "name": "João Silva",
      "children": [
        {
          "name": "Pedro Silva (filho único)",
          "children": [
            {"name": "Ana Silva"},
            {"name": "Carlos Silva"}
          ]
        },
        {
          "name": "Maria Silva",
          "children": [
            {"name": "José Silva"},
            {"name": "Antônia Silva"}
          ]
        }
      ]
    },
    {
      "name": "Maria Santos",
      "children": [
        {
          "name": "Paulo Santos",
          "children": [
            {"name": "Luiza Santos (filha única)"}
          ]
        },
        {
          "name": "Teresa Santos",
          "children": [
            {"name": "Fernanda Santos"},
            {"name": "Ricardo Santos"}
          ]
        }
      ]
    },
    {
      "name": "Roberto Oliveira (filho único)",
      "children": [
        {
          "name": "Marcos Oliveira (também filho único)",
          "children": [
            {"name": "Lucas Oliveira"},
            {"name": "Gabriel Oliveira"}
          ]
        }
      ]
    }
  ]
};

// Cria um botão para um membro da família
function createMemberButton(member, generation) {
  const button = document.createElement('button');
  button.className = 'member-button generation-' + generation;
  button.textContent = member.name;
  
  // Se tem filhos, adiciona funcionalidade de expansão
  if (member.children && member.children.length > 0) {
    button.classList.add('has-children');
    
    button.addEventListener('click', function() {
      // Procura container de filhos existente
      let childrenContainer = button.nextElementSibling;
      
      if (!childrenContainer || !childrenContainer.classList.contains('children-container')) {
        // Cria novo container de filhos
        childrenContainer = document.createElement('div');
        childrenContainer.className = 'children-container';
        
        // Adiciona filhos ao container
        member.children.forEach(function(child) {
          const childButton = createMemberButton(child, generation + 1);
          childrenContainer.appendChild(childButton);
        });
        
        // Insere o container após o botão
        button.parentNode.insertBefore(childrenContainer, button.nextSibling);
      }
      
      // Alterna expansão/colapso
      if (childrenContainer.classList.contains('expanded')) {
        // Colapsa
        childrenContainer.classList.remove('expanded');
        button.classList.remove('expanded');
      } else {
        // Expande
        childrenContainer.classList.add('expanded');
        button.classList.add('expanded');
      }
    });
  }
  
  return button;
}

// Renderiza a árvore genealógica
function renderFamilyTree() {
  const container = document.getElementById('family-tree');
  container.innerHTML = '';
  
  const rootButton = createMemberButton(familyData, 0);
  container.appendChild(rootButton);
}

// Colapsa todos os membros
function collapseAll() {
  const allContainers = document.querySelectorAll('.children-container');
  const allButtons = document.querySelectorAll('.member-button.has-children');
  
  allButtons.forEach(function(button) {
    button.classList.remove('expanded');
  });
  
  allContainers.forEach(function(container) {
    container.classList.remove('expanded');
  });
}

// Expande todos os membros (apenas um nível por vez)
function expandAll() {
  const allButtons = document.querySelectorAll('.member-button.has-children:not(.expanded)');
  
  allButtons.forEach(function(button, index) {
    setTimeout(function() {
      button.click();
    }, index * 200); // Stagger animation
  });
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  renderFamilyTree();
});