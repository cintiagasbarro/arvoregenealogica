// Dados da família (mesmo JSON mas estruturado)
let familyData = null;

// Carrega os dados do JSON
async function loadFamilyData() {
  try {
    const response = await fetch('family_tree.json');
    familyData = await response.json();
    renderFamilyTree();
  } catch (error) {
    console.error('Erro ao carregar dados da família:', error);
  }
}

// Renderiza a árvore genealógica
function renderFamilyTree() {
  const container = document.getElementById('family-tree');
  container.innerHTML = '';
  
  if (familyData) {
    renderMember(familyData, container, 0);
  }
}

// Renderiza um membro da família
function renderMember(member, container, generation) {
  // Cria o elemento do membro
  const memberDiv = document.createElement('div');
  memberDiv.className = 'family-member';
  
  // Cria o botão do membro
  const button = document.createElement('button');
  button.className = `member-button generation-${generation}`;
  button.textContent = member.name;
  
  // Adiciona classe se tem filhos
  if (member.children && member.children.length > 0) {
    button.classList.add('has-children');
    
    // Adiciona evento de clique
    button.addEventListener('click', () => {
      toggleChildren(memberDiv, member, generation);
    });
  }
  
  memberDiv.appendChild(button);
  
  // Cria container para filhos (inicialmente colapsado)
  if (member.children && member.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'children-container collapsed';
    memberDiv.appendChild(childrenContainer);
  }
  
  container.appendChild(memberDiv);
}

// Alterna exibição dos filhos
function toggleChildren(memberDiv, member, generation) {
  const button = memberDiv.querySelector('.member-button');
  const childrenContainer = memberDiv.querySelector('.children-container');
  
  if (!childrenContainer) return;
  
  if (childrenContainer.classList.contains('collapsed')) {
    // Expande
    expandChildren(button, childrenContainer, member, generation);
  } else {
    // Colapsa
    collapseChildren(button, childrenContainer);
  }
}

// Expande os filhos
function expandChildren(button, childrenContainer, member, generation) {
  button.classList.add('expanded');
  childrenContainer.classList.remove('collapsed');
  childrenContainer.classList.add('expanded', 'expanding');
  
  // Remove a classe de animação após a animação
  setTimeout(() => {
    childrenContainer.classList.remove('expanding');
  }, 300);
  
  // Renderiza os filhos se ainda não foram renderizados
  if (childrenContainer.children.length === 0) {
    member.children.forEach(child => {
      renderMember(child, childrenContainer, generation + 1);
    });
  }
}

// Colapsa os filhos
function collapseChildren(button, childrenContainer) {
  button.classList.remove('expanded');
  childrenContainer.classList.add('collapsing');
  childrenContainer.classList.remove('expanded');
  
  setTimeout(() => {
    childrenContainer.classList.add('collapsed');
    childrenContainer.classList.remove('collapsing');
  }, 300);
}

// Colapsa todos os membros
function collapseAll() {
  const allContainers = document.querySelectorAll('.children-container');
  const allButtons = document.querySelectorAll('.member-button.has-children');
  
  allButtons.forEach(button => {
    button.classList.remove('expanded');
  });
  
  allContainers.forEach(container => {
    container.classList.add('collapsed');
    container.classList.remove('expanded');
  });
}

// Expande todos os membros
function expandAll() {
  const allContainers = document.querySelectorAll('.children-container');
  const allButtons = document.querySelectorAll('.member-button.has-children');
  
  allButtons.forEach(button => {
    button.classList.add('expanded');
  });
  
  allContainers.forEach((container, index) => {
    setTimeout(() => {
      container.classList.remove('collapsed');
      container.classList.add('expanded');
      
      // Renderiza filhos se necessário
      const memberDiv = container.parentElement;
      const button = memberDiv.querySelector('.member-button');
      const memberName = button.textContent;
      
      // Encontra o membro nos dados e renderiza filhos
      if (container.children.length === 0) {
        const member = findMemberByName(familyData, memberName);
        if (member && member.children) {
          const generation = parseInt(button.className.match(/generation-(\d+)/)[1]);
          member.children.forEach(child => {
            renderMember(child, container, generation + 1);
          });
        }
      }
    }, index * 100); // Stagger animation
  });
}

// Encontra um membro pelo nome (função auxiliar)
function findMemberByName(data, name) {
  if (data.name === name) {
    return data;
  }
  
  if (data.children) {
    for (let child of data.children) {
      const found = findMemberByName(child, name);
      if (found) return found;
    }
  }
  
  return null;
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  loadFamilyData();
});