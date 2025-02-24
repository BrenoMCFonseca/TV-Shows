import { useEffect, useState } from "react";
import "../styles/styles.css"; // Importe o arquivo CSS

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
        <div className="container">
          <h1>Escolha um seriado</h1>
          <div className="show-list">
            {shows?.map((show) => (
              <div
                key={show.id}
                className="show-card"
                onClick={() => {
                  const selectedShowData = shows.find((s) => s.id === show.id);
                  if (selectedShowData) {
                    setSelectedShow(show.id);
                    setSelectedShowData(selectedShowData);
                    setSelectedSeason(null);
                    fetchSeasons(show.id);
                    setEpisodes([]);
                  }
                }}
              >
                <h2>{show.name}</h2>
                {show.image && (
                  <img src={show.image.medium} alt={show.name} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
  
      {selectedShow && (
        <div className="container">
          <div className="season-container">
            {selectedShowData && selectedShowData.image && (
              <img
                src={selectedShowData.image.medium}
                alt={selectedShowData.name}
              />
            )}
            <h2>Escolha uma temporada</h2>
            <select
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
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
        <div className="episode-container">
          <h2>{episodes.length} - Episódios</h2>
          <div>
            {episodes.map((episode) => (
              <div key={episode.id} className="episode-card">
                <h3>{episode.name}</h3>
                {episode.image && (
                  <img src={episode.image.medium} alt={episode.name} />
                )}
                <p dangerouslySetInnerHTML={{ __html: episode.summary }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};


export default App;