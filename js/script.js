const API_URL = 'https://rickandmortyapi.com/api/character';
const IMAGEM_SEGURANCA = 'https://rickandmortyapi.com/api/character/avatar/1.jpeg';

// Elementos do DOM
const containerPersonagens = document.getElementById('personagens-container');
const tituloPersonagens = document.getElementById('titulo-personagens');
const tituloEpisodios = document.querySelector('#episodios .titulo-secao');
const modalZoom = document.getElementById('modal-zoom');
const imgModal = document.getElementById('img-modal');
const captionModal = document.getElementById('caption-modal');
const btnFecharModal = document.querySelector('.fechar-modal');

const btnMostrarTodos = document.getElementById('btn-mostrar-todos');
const btnMostrarFavoritos = document.getElementById('btn-mostrar-favoritos');
const btnMenuEpisodios = document.getElementById('btn-menu-episodios');

// Elementos do player de áudio
const btnMusica = document.getElementById('btn-musica');
const musicaAbertura = document.getElementById('musica-abertura');

let listaGeral = [];
let idsFavoritos = [];
let mostrandoFavoritos = false;

// 1. Controle de Play / Pause da Música Local
if (btnMusica && musicaAbertura) {
  btnMusica.addEventListener('click', () => {
    if (musicaAbertura.paused) {
      musicaAbertura.play()
        .then(() => {
          btnMusica.textContent = '⏸️ Pausar Abertura';
          btnMusica.classList.add('tocando');
        })
        .catch(erro => {
          console.error('Erro de reprodução:', erro);
          alert('Erro ao tentar tocar a música. Verifique o caminho no index.html!');
        });
    } else {
      musicaAbertura.pause();
      btnMusica.textContent = '🎵 Tocar Abertura';
      btnMusica.classList.remove('tocando');
    }
  });
}

// 2. Consumo da API pública do Rick e Morty
async function buscarPersonagens() {
  try {
    const resposta = await fetch(API_URL);
    const dados = await resposta.json();
    listaGeral = dados.results;
    renderizarCards(listaGeral);
  } catch (erro) {
    console.error('Erro na requisição:', erro);
    containerPersonagens.innerHTML = '<p class="mensagem-vazio">Erro ao carregar os personagens.</p>';
  }
}

// 3. Renderização dinâmica dos cards de personagens
function renderizarCards(personagens) {
  containerPersonagens.innerHTML = '';

  if (personagens.length === 0) {
    containerPersonagens.innerHTML = '<p class="mensagem-vazio">Nenhum personagem favoritado ainda. Clique no coração 🤍 dos cards para favoritar!</p>';
    return;
  }

  personagens.forEach(personagem => {
    const card = document.createElement('div');
    card.classList.add('card-personagem');

    const status = personagem.status === 'Alive' ? 'Vivo' : (personagem.status === 'Dead' ? 'Morto' : 'Desconhecido');
    const especie = personagem.species === 'Human' ? 'Humano' : (personagem.species === 'Alien' ? 'Alienígena' : personagem.species);
    const origem = (personagem.origin.name === 'unknown') ? 'Desconhecida' : personagem.origin.name.replace('Earth', 'Terra');
    
    const classeCorStatus = status === 'Vivo' ? 'status-vivo' : (status === 'Morto' ? 'status-morto' : 'status-desconhecido');
    const ehFav = idsFavoritos.includes(personagem.id);
    const iconeCoracao = ehFav ? '❤️' : '🤍';

    card.innerHTML = `
      <div class="container-img-card">
        <img src="${personagem.image}" alt="${personagem.name}" class="img-personagem" onerror="this.onerror=null; this.src='${IMAGEM_SEGURANCA}';">
        <button class="btn-favorito">${iconeCoracao}</button>
      </div>
      <div class="card-body">
        <h3>${personagem.name}</h3>
        <div class="info-status">
          <span class="status-indicador ${classeCorStatus}"></span>
          <span>${status} - ${especie}</span>
        </div>
        <p><strong>Origem:</strong> ${origem}</p>
      </div>
    `;

    // Evento: Zoom na imagem (Modal)
    const imgElemento = card.querySelector('.img-personagem');
    imgElemento.addEventListener('click', () => {
      modalZoom.style.display = 'flex';
      imgModal.src = imgElemento.src;
      captionModal.textContent = personagem.name;
    });

    // Evento: Favoritar Personagem
    const btnFav = card.querySelector('.btn-favorito');
    btnFav.addEventListener('click', (e) => {
      e.stopPropagation();
      if (idsFavoritos.includes(personagem.id)) {
        idsFavoritos = idsFavoritos.filter(id => id !== personagem.id);
        btnFav.textContent = '🤍';
      } else {
        idsFavoritos.push(personagem.id);
        btnFav.textContent = '❤️';
      }

      if (mostrandoFavoritos) {
        const apenasFavs = listaGeral.filter(p => idsFavoritos.includes(p.id));
        renderizarCards(apenasFavs);
      }
    });

    containerPersonagens.appendChild(card);
  });
}

// 4. Interação do Coração nos Episódios
document.querySelectorAll('.btn-favorito-ep').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = btn.textContent === '🤍' ? '❤️' : '🤍';
    
    if (mostrandoFavoritos) {
      filtrarEpisodiosFavoritos();
    }
  });
});

// Funções auxiliares para filtro de episódios
function filtrarEpisodiosFavoritos() {
  const cardsEpisodios = document.querySelectorAll('.card-episodio');
  cardsEpisodios.forEach(card => {
    const btnFavEp = card.querySelector('.btn-favorito-ep');
    if (btnFavEp.textContent === '❤️') {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function mostrarTodosEpisodios() {
  const cardsEpisodios = document.querySelectorAll('.card-episodio');
  cardsEpisodios.forEach(card => {
    card.style.display = 'block';
  });
}

// 5. Filtros do Menu Superior
btnMostrarTodos.addEventListener('click', () => {
  mostrandoFavoritos = false;
  tituloPersonagens.textContent = 'Personagens';
  tituloEpisodios.textContent = 'Episódios';
  mostrarTodosEpisodios();
  renderizarCards(listaGeral);
});

if (btnMenuEpisodios) {
  btnMenuEpisodios.addEventListener('click', () => {
    mostrandoFavoritos = false;
    tituloPersonagens.textContent = 'Personagens';
    tituloEpisodios.textContent = 'Episódios';
    mostrarTodosEpisodios();
    renderizarCards(listaGeral);
  });
}

btnMostrarFavoritos.addEventListener('click', () => {
  mostrandoFavoritos = true;
  tituloPersonagens.textContent = 'Meus Personagens Favoritos ❤️';
  tituloEpisodios.textContent = 'Meus Episódios Favoritos ❤️';
  
  filtrarEpisodiosFavoritos();

  const apenasFavs = listaGeral.filter(p => idsFavoritos.includes(p.id));
  renderizarCards(apenasFavs);
});

// 6. Fechar Modal
btnFecharModal.addEventListener('click', () => {
  modalZoom.style.display = 'none';
});

modalZoom.addEventListener('click', (e) => {
  if (e.target !== imgModal) {
    modalZoom.style.display = 'none';
  }
});

// Inicialização
buscarPersonagens();