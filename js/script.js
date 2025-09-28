const url = "https://japceibal.github.io/japflix_api/movies-data.json";
const lista = document.getElementById("lista");
let peliculas = [];

async function getData() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en la petición: " + response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Hubo un problema:", error);
    lista.innerHTML = "";
    const li = document.createElement("li");
    li.className = "list-group-item text-danger";
    li.textContent = "No se pudieron cargar los datos.";
    lista.appendChild(li);
    return null;
  }
}

// Función para filtrar películas según la búsqueda
function filtrarPeliculas(datos, query) {
  query = query.toLowerCase();
  return datos.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.genres.join(", ").toLowerCase().includes(query) ||
    p.tagline.toLowerCase().includes(query) ||
    p.overview.toLowerCase().includes(query)
  );
}

// Función para generar estrellas según vote_average
function generarEstrellas(vote_average) {
  const estrellasLlenas = Math.round(vote_average / 2);
  const estrellasVacias = 5 - estrellasLlenas;
  return '<span class="fa fa-star checked"></span>'.repeat(estrellasLlenas) + '<span class="fa fa-star"></span>'.repeat(estrellasVacias);
}

function obtenerAnio(releaseDate) {
  // Si releaseDate existe, toma string antes del primer guión
  if (!releaseDate) return "N/A";
  return releaseDate.split("-")[0];
}

// Función para cambiar formato
function formatoMoneda(numero) {
  if (numero === 0 || !numero) return "N/A";
  // Intl.NumberFormat es la forma estándar de formatear una moneda
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0 // Evita mostrar centavos (.00)
  }).format(numero);
}

function mostrarPeliculas(peliculasFiltradas) {
  lista.innerHTML = "";

  if (peliculasFiltradas.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-warning";
    li.textContent = "No se encontraron películas con ese criterio.";
    lista.appendChild(li);
    return;
  }

  peliculasFiltradas.forEach(peli => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.style.cursor = "pointer";

    li.innerHTML = `
      <h5>${peli.title}</h5>
      <p><em>${peli.tagline}</em></p>
      <p>${generarEstrellas(peli.vote_average)}</p>
    `;

    li.addEventListener("click", () => {
      const anio = obtenerAnio(peli.release_date);
      const duracion = peli.runtime ? `${peli.runtime} min` : "N/A";
      const presupuesto = formatoMoneda(peli.budget);
      const ganancias = formatoMoneda(peli.revenue);


      document.getElementById("movieTitle").textContent = peli.title;
      document.getElementById("movieOverview").textContent = peli.overview;
      document.getElementById("movieGenres").innerHTML = peli.genres
        .map(g => `<li class="list-inline-item">${g.name}</li>`)
        .join("");

      document.getElementById("movieAnio").textContent = `Año: ${anio}`;
      document.getElementById("movieDurac").textContent = `Duración: ${duracion}`;
      document.getElementById("moviePresu").textContent = `Presupuesto: ${presupuesto}`;
      document.getElementById("movieGanan").textContent = `Ganancias: ${ganancias}`;

      const offcanvas = new bootstrap.Offcanvas(document.getElementById("offcanvasTop"));
      offcanvas.show();
    });

    lista.appendChild(li);
  });
}

// Al cargar la página, traemos los datos
async function main() {
  const datos = await getData();
  if (datos) peliculas = datos;
}

// Botón para buscar
document.getElementById("btnBuscar").addEventListener("click", () => {
  const query = document.getElementById("inputBuscar").value.trim();
  if (!query) {
    Swal.fire({
      title: "Atención",
      text: "Por favor, escribí algo para buscar.",
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return;
  }

  const filtradas = filtrarPeliculas(peliculas, query);
  mostrarPeliculas(filtradas);
});

main();

