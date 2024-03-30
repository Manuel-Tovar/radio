// Importar datos estáticos de países y de idiomas
import countries from './countries.js';
import languagesData from './languages.js';
import { handleDrag } from './dragHandler.js';
// Elementos del DOM
const containers = document.querySelectorAll(".containers");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const rotatingImage = document.getElementById("rotatingImage");
const songName = document.querySelector(".music-player h2");
const artistName = document.querySelector(".music-player p");
const songContainer = document.getElementById("song-container");
const containerCountry = document.getElementById('containerCountry');
const languagesContainer = document.querySelector('.languages-container');
const loadMoreButton = document.getElementById("load-more-btn");
// Estado y configuración
let rotating = false;
let currentRotation = 0;
let rotationInterval;
let currentSongIndex = 0;
let currentLoadedStations = 0;
let stationsPerPage = 50;
let countryRadio = 'Colombia'; // País inicial
const songs = [];

// Inicialización de la aplicación
function initializeApp() {


  // Aplicar handleDrag a los contenedores
  containers.forEach(handleDrag);

  // Generar HTML para cada país
  countries.forEach(country => {
    let countriesHTML = `
      <div class="artist" >
          <img class="artist-img" id="${country.id}" src="${country.cover}" alt="Radio ${country.name}" />
          <p>${country.name}</p>
      </div>`;
    containerCountry.insertAdjacentHTML('beforeend', countriesHTML);
  });

  // Evento clic en los países generados dinámicamente
  containerCountry.addEventListener('click', (event) => {
    const countryId = event.target.closest('.artist-img').id;
    if (countryId) {
      countryRadio = countryId;
      getRadioStations();
    }
  });

  // Manejar errores de carga de canciones
  song.addEventListener("error", handleSongError);

  // Obtener estaciones de radio para el país inicial
  getRadioStations();
}

// Obtener estaciones de radio desde la API por país
function getRadioStations() {
  // Limpiar arreglo de canciones y contenedor de canciones
  songs.length = 0;
  songContainer.innerHTML = '';
  currentLoadedStations = 0;
  // Hacer solicitud a la API para obtener estaciones de radio por país
  fetch(`https://de1.api.radio-browser.info/json/stations/bycountry/${countryRadio}?limit=${stationsPerPage}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(station => {
        const cover = station.favicon ? station.favicon : './img/radio_vinil.png';
        songs.push({
          title: station.name,
          name: 'Radio ' + countryRadio,
          source: station.url,
          cover: cover
        });
      });

      // Actualizar información de la canción actual
      updateSongInfo();
    })
    .catch(error => {
      console.error('Error al obtener datos de la API de radio-browser.info:', error);
    });
}

// Manejar errores de carga de canciones
function handleSongError() {
  const errorIndex = currentSongIndex;

  // Eliminar canción problemática del arreglo y del HTML
  if (errorIndex !== -1) {
    songs.splice(errorIndex, 1);
    const songElement = document.querySelectorAll('.song')[errorIndex];
    if (songElement) {
      songElement.remove();
    }
  }

  console.error("Error al cargar la canción. Se ha eliminado la canción problemática.");

  // Avanzar a la siguiente canción si se eliminó la actual
  if (errorIndex === currentSongIndex) {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    updateSongInfo();
  }
}

// Iniciar rotación de la imagen
function startRotation() {
  if (!rotating) {
    rotating = true;
    rotationInterval = setInterval(rotateImage, 50);
  }
}

// Pausar rotación de la imagen
function pauseRotation() {
  clearInterval(rotationInterval);
  rotating = false;
}

// Rotar la imagen
function rotateImage() {
  currentRotation += 1;
  rotatingImage.style.transform = `rotate(${currentRotation}deg)`;
}

// Actualizar información de la canción actual
function updateSongInfo() {

  songContainer.innerHTML = '';
  controlIcon.classList.remove("fa-pausey");
  controlIcon.classList.add("fa-play");
  // Restablecer el estado de reproducción a pausa
  pauseRotation();

  songs.forEach(station => {
    const cover = station.cover ? station.cover : './img/radio_vinil.png';

    songContainer.innerHTML += `
            <div class="song">
                <div class="song-img">
                    <img src="${cover}" alt="Radio ${song.title}" />
                    <div class="overlay">
                        <i class="fa-solid fa-play"></i>
                    </div>
                </div>
                <div class="song-title">
                    <h2>${station.title}</h2>
                    <p>${station.name}</p>
                </div>
                <span></span>
            </div>
        `;
  });

  const stationElements = document.querySelectorAll('.song-img');
  stationElements.forEach((stationElement, index) => {
    stationElement.addEventListener('click', () => {
      songName.textContent = songs[index].title;
      artistName.textContent = songs[index].name;
      song.src = songs[index].source;
      rotatingImage.src = songs[index].cover;
      currentSongIndex = index;
      playPause();
    });
  });

  songName.textContent = songs[currentSongIndex].title;
  artistName.textContent = songs[currentSongIndex].name;
  song.src = songs[currentSongIndex].source;
  rotatingImage.src = songs[currentSongIndex].cover;

}

// Manejar eventos del reproductor de música
playPauseButton.addEventListener("click", playPause);

forwardButton.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});
backwardButton.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
});



// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", initializeApp);

// Función para reproducir o pausar la canción
function playPause() {
  if (song.paused) {
    song.play();
    controlIcon.classList.add("fa-pause");
    controlIcon.classList.remove("fa-play");
    startRotation();
  } else {
    song.pause();
    controlIcon.classList.remove("fa-pause");
    controlIcon.classList.add("fa-play");
    pauseRotation();

  }
}

// Obtener estaciones de radio desde la API por idioma
function getStationsLanguages(selectedCountry, selectedLanguage) {
  songs.length = 0;
  songContainer.innerHTML = '';
  currentLoadedStations = 0;

  fetch(`https://de1.api.radio-browser.info/json/stations/bylanguage/${selectedLanguage}?limit=${stationsPerPage}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(station => {
        const cover = station.favicon ? station.favicon : './img/radio_vinil.png';
        songs.push({
          title: station.name,
          name: 'Radio ' + selectedCountry,
          source: station.url,
          cover: cover
        });
      });

      updateSongInfo();
    })
    .catch(error => {
      console.error('Error al obtener datos de la API de radio-browser.info:', error);
    });
}

// Función para crear elementos de idioma
function createLanguagesElement(languages) {
  const languagesElement = document.createElement('div');
  languagesElement.className = 'language';
  languagesElement.innerHTML = `
      <div class="languages-frame" id="${languages.id}">
        <img
          src="${languages.imgSrc}"
          alt="Radio ${languages.country}" />
      </div>
      <div>
        <h2>${languages.country}</h2>
        <p>Radio</p>
      </div>`;
  return languagesElement;
}

// Agregar eventos de clic a los elementos de idioma
function addClickEvents() {
  languagesData.forEach(languages => {
    const languagesElement = document.getElementById(languages.id);
    if (languagesElement) {
      languagesElement.addEventListener('click', () => {
        const selectedCountry = languages.country;
        const selectedLanguage = languages.language;
        countryRadio = languages.country;
        getStationsLanguages(selectedCountry, selectedLanguage);
        currentLoadedStations = 0;
      });
    }
  });
}

// Inicializar la página
function initializePage() {

  languagesContainer.innerHTML = '';

  languagesData.forEach(languages => {
    const languagesElement = createLanguagesElement(languages);
    languagesContainer.appendChild(languagesElement);
  });

  addClickEvents();
}

// Llamar a la función para inicializar la página
initializePage();




// Función para cargar más estaciones de radio
function cargarMasEstaciones() {
  // Incrementar el número de estaciones cargadas

  currentLoadedStations += stationsPerPage;

  // Hacer una solicitud a la API para obtener más estaciones de radio con paginación
  fetch(`https://de1.api.radio-browser.info/json/stations/bycountry/${countryRadio}?limit=${stationsPerPage}&offset=${currentLoadedStations}`)

    .then(response => response.json())
    .then(data => {
      // Agregar las nuevas estaciones cargadas al contenedor existente
      const songContainer = document.getElementById("song-container");
      data.forEach(station => {
        const cover = station.favicon ? station.favicon : './img/radio_vinil.png';
        const stationHTML = `
                  <div class="song">
                      <div class="song-img">
                          <img src="${cover}" alt="Radio ${station.name}" />
                          <div class="overlay">
                              <i class="fa-solid fa-play"></i>
                          </div>
                      </div>
                      <div class="song-title">
                          <h2>${station.name}</h2>
                          <p>${countryRadio}</p>
                      </div>
                      <span></span>
                  </div>
              `;
        songContainer.insertAdjacentHTML('beforeend', stationHTML);
        // Agregar la nueva estación a la lista de canciones
        const newSong = {
          title: station.name,
          name: 'Radio ' + countryRadio,
          source: station.url,
          cover: cover
        };
        songs.push(newSong);

      });

      // Agregar event listeners a las nuevas estaciones cargadas
      const newStations = songContainer.querySelectorAll('.song');
      newStations.forEach((station, index) => {
        station.addEventListener('click', () => {
          // Actualizar la información de la canción seleccionada
          songName.textContent = songs[index].title;
          artistName.textContent = songs[index].name;
          song.src = songs[index].source;
          rotatingImage.src = songs[index].cover;
          currentSongIndex = index;
          // Reproducir la nueva canción en el reproductor
          playPause();
        });
      });


    })
    .catch(error => {
      console.error('Error al cargar más estaciones de radio:', error);
    });
}



// Agregar un evento de clic al botón de "Cargar más"
loadMoreButton.addEventListener('click', cargarMasEstaciones);



// Función para filtrar países según la consulta de búsqueda
function filterCountries(searchQuery) {
  const filteredCountries = countries.filter(country => {
    return country.name.toLowerCase().includes(searchQuery);
  });

  containerCountry.innerHTML = '';

  filteredCountries.forEach(country => {
    let countriesHTML = `
            <div class="artist" >
                <img  class="artist-img" id="${country.id}" src="${country.cover}" alt="Radio ${country.name}" />
                <p>${country.name}</p>
            </div>
        `;
    containerCountry.insertAdjacentHTML('beforeend', countriesHTML);
  });
}

// Escuchar eventos de entrada en el campo de búsqueda para países
const countrySearchInput = document.getElementById("country-search-input");
countrySearchInput.addEventListener("input", () => {
  const searchQuery = countrySearchInput.value.trim().toLowerCase();

  filterCountries(searchQuery);
});



// Función para filtrar canciones según la consulta de búsqueda
function filterSongs(searchQuery) {
  const filteredSongs = songs.filter(song => {
    return song.title.toLowerCase().includes(searchQuery);
  });

  // Limpiar el contenedor de canciones antes de mostrar los resultados de la búsqueda
  songContainer.innerHTML = '';

  // Generar dinámicamente el contenido HTML para las canciones filtradas
  filteredSongs.forEach(song => {
    let songHTML = `
            <div class="song">
                <div class="song-img">
                    <img src="${song.cover}" alt="${song.title}" />
                    <div class="overlay">
                        <i class="fa-solid fa-play"></i>
                    </div>
                </div>
                <div class="song-title">
                    <h2>${song.title}</h2>
                    <p>${song.name}</p>
                </div>
                <span></span>
            </div>
        `;
    songContainer.insertAdjacentHTML('beforeend', songHTML);
  });

  // Agregar controladores de eventos clic a cada canción filtrada
  const songElements = document.querySelectorAll('.song');
  songElements.forEach((songElement, index) => {
    songElement.addEventListener('click', () => {
      // Actualizar la información de la canción seleccionada
      songName.textContent = filteredSongs[index].title;
      artistName.textContent = filteredSongs[index].name;
      song.src = filteredSongs[index].source;
      rotatingImage.src = filteredSongs[index].cover;
      currentSongIndex = index;
      // Reproducir la nueva canción en el reproductor
      playPause();
    });
  });
}


// Escuchar eventos de entrada en el campo de búsqueda para canciones
const songSearchInput = document.getElementById("song-search-input");
songSearchInput.addEventListener("input", () => {
  // Obtener el valor actual del campo de búsqueda
  const searchQuery = songSearchInput.value.trim().toLowerCase();

  // Filtrar las canciones según la consulta de búsqueda
  filterSongs(searchQuery);
});



