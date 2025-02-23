import { useEffect, useState } from "react";

interface ShowData {
  id: number;
  name: string;
  image: { medium: string };
  summary: string;
  premiered: string;
}

interface Season {
  id: number;
  number: number;
}

interface Episode {
  id: number;
  name: string;
  summary: string;
  image?: { medium: string };
  runtime: number;
}

const App: React.FC = () => {
  //const showId = 169; // ID de Breaking Bad
  const [shows, setShows] = useState<ShowData[]>([]);
  const [selectedShow, setSelectedShow] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesPerSeason, setEpisodesPerSeason] = useState<{ [key: number]: number }>({});
  const [selectedShowData, setSelectedShowData] = useState<ShowData | null>(null);

  const fetchSeasons = async (showId: number) => {
    try {
      const response = await fetch(`https://api.tvmaze.com/shows/${showId}/seasons`);
      const data = await response.json();
      setSeasons(data);
      // Para cada temporada, buscamos o número de episódios
      data.forEach((season: { id: number }) => {
        fetchEpisodesCount(season.id);

      }); // Armazena as temporadas no estado
    } catch (error) {
      console.error("Erro ao buscar temporadas:", error);
    }
  };
  const fetchEpisodesCount = async (seasonId: number) => {
    try {
      const response = await fetch(`https://api.tvmaze.com/seasons/${seasonId}/episodes`);
      const data = await response.json();
      setEpisodesPerSeason((prev) => ({
        ...prev,
        [seasonId]: data.length, // Salva o número de episódios dessa temporada
      }));
    } catch (error) {
      console.error(`Erro ao buscar episódios da temporada ${seasonId}:`, error);
    }
  };

  // Buscar informações da série e temporadas
  useEffect(() => {
    fetch("https://api.tvmaze.com/shows?page=1")
      .then((res) => res.json())
      .then((data) => setShows(data.slice(0, 20))); // Pegando os 10 primeiros seriados
  }, []);

  useEffect(() => {
    if (selectedShow) {
      fetch(`https://api.tvmaze.com/shows/${selectedShow}/seasons`)
        .then((response) => response.json())
        .then((data) => setShows(data));
    }
  }, [selectedShow]);


  // Buscar episódios da temporada selecionada
  useEffect(() => {
    if (selectedSeason) {
      fetch(`https://api.tvmaze.com/seasons/${selectedSeason}/episodes`)
        .then((response) => response.json())
        .then((data) => setEpisodes(data));
    }
  }, [selectedSeason]);

  return (
    <>
    {!selectedShow && ( // Se nenhum seriado foi selecionado, exibe a lista
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h1>Escolha um seriado</h1>
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px"
            }}
          >
            {shows?.map((show) => (
              <div
                key={show.id}
                onClick={() => {
                  const selectedShowData = shows.find((s) => s.id === show.id);
                  if (selectedShowData) {
                    setSelectedShow(show.id);
                    setSelectedShowData(show);  // Salva os dados do seriado escolhido
                    setSelectedSeason(null);
                    fetchSeasons(show.id);
                    setEpisodes([]);
                  }
                }}
                style={{
                  cursor: "pointer", marginBottom: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                  transition: "transform 0.2s",
                  backgroundColor: "#f9f9f9"
                }}

                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >

                <h2 style={{ fontSize: "18px" }}>{show.name}</h2>
                {show.image && (
                  <img src={show.image.medium}
                    alt={show.name}
                    style={{
                      width: "100%",
                      maxWidth: "200px",
                      height: "auto",
                      borderRadius: "8px"
                    }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    
        {selectedShow && (
          <div style={{ textAlign: "center", padding: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "20px",
              maxWidth: "400px",
              margin: "0 auto",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Exibe a imagem do seriado selecionado */}
             {selectedShowData && selectedShowData.image && (
               <img 
                 src={selectedShowData.image.medium} 
                 alt={selectedShowData.name} 
                 style={{ width: "200px", borderRadius: "8px", marginBottom: "20px" }}
               />
        )}

              <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Escolha uma temporada</h2>
           
              <select onChange={(e) => setSelectedSeason(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  transition: "0.3s",
                }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#007bff")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#ccc")}
            >
              <option value="">Selecione</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  Temporada {season.number}
                </option>
              ))}
            </select>
          </div>
          </div>
        )}
        {selectedSeason && (
          <div style={{
            maxWidth: "800px",
            margin: "auto",
            padding: "20px",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
              {episodes.length} - Episódios</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {episodes.map((episode) => (
                <div key={episode.id}
                  style={{
                    maxWidth: "600px",
                    margin: "auto",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fff",
                    textAlign: "left"
                  }}
                >
                  <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>{episode.name}</h3>

                  {episode.image && (
                    <img
                      src={episode.image.medium}
                      alt={episode.name}

                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        display: "block",
                        marginBottom: "10px"
                      }} />
                  )}

                  <p dangerouslySetInnerHTML={{ __html: episode.summary }}
                    style={{ fontSize: "16px", lineHeight: "1.5" }} />
                </div>

              ))}
            </div>
          </div>
        )}

      </>
  );
};


export default App;