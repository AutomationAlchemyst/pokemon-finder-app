"use client";

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { PokemonCardSkeleton } from './components/PokemonCardSkeleton';

type PokemonData = {
  name: string;
  id: number;
  imageUrl: string;
  types: { type: { name:string } }[];
  abilities: { ability: { name: string }, is_hidden: boolean }[];
  stats: { stat: { name: string }, base_stat: number }[];
};

// A new type for the Pokédex list
type PokedexEntry = {
  name: string;
  url: string;
};

const PokemonCard = ({ data }: { data: PokemonData }) => (
  <div className="pokemon-card">
    <Image src={data.imageUrl} alt={data.name} width="160" height="160" style={{ margin: '0 auto' }} />
    <h2>{data.name}</h2>
    <p>#{data.id}</p>
    <div className="card-details-section">
      <h3>Types</h3>
      <ul>{data.types.map(t => <li key={t.type.name}>- {t.type.name}</li>)}</ul>
    </div>
    <div className="card-details-section">
      <h3>Abilities</h3>
      <ul>{data.abilities.map(a => <li key={a.ability.name}>- {a.ability.name}{a.is_hidden ? ' (Hidden)' : ''}</li>)}</ul>
    </div>
  </div>
);

export default function HomePage() {
  const [pokemonOneName, setPokemonOneName] = useState('');
  const [pokemonTwoName, setPokemonTwoName] = useState('');
  const [pokemonOneData, setPokemonOneData] = useState<PokemonData | null>(null);
  const [pokemonTwoData, setPokemonTwoData] = useState<PokemonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<string | null>(null);

  // --- AUTOCOMPLETE STATE ---
  const [allPokemon, setAllPokemon] = useState<PokedexEntry[]>([]);
  const [suggestionsOne, setSuggestionsOne] = useState<PokedexEntry[]>([]);
  const [suggestionsTwo, setSuggestionsTwo] = useState<PokedexEntry[]>([]);
  
  // Fetch the full Pokédex list on page load
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch('/api/pokedex');
        const data = await response.json();
        setAllPokemon(data);
      } catch (err) {
        console.error("Failed to load Pokédex for autocomplete:", err);
      }
    };
    fetchAllPokemon();
  }, []);

  // --- AUTOCOMPLETE HANDLERS ---
  const handleInputChange = (value: string, inputNumber: 1 | 2) => {
    if (inputNumber === 1) {
      setPokemonOneName(value);
      if (value.length > 1) {
        const filtered = allPokemon.filter(p => p.name.toLowerCase().startsWith(value.toLowerCase())).slice(0, 5);
        setSuggestionsOne(filtered);
      } else {
        setSuggestionsOne([]);
      }
    } else {
      setPokemonTwoName(value);
      if (value.length > 1) {
        const filtered = allPokemon.filter(p => p.name.toLowerCase().startsWith(value.toLowerCase())).slice(0, 5);
        setSuggestionsTwo(filtered);
      } else {
        setSuggestionsTwo([]);
      }
    }
  };

  const handleSuggestionClick = (name: string, inputNumber: 1 | 2) => {
    if (inputNumber === 1) {
      setPokemonOneName(name);
      setSuggestionsOne([]);
    } else {
      setPokemonTwoName(name);
      setSuggestionsTwo([]);
    }
  };

  const handleCompare = async (e: FormEvent) => {
    // ... (rest of this function is unchanged)
    e.preventDefault();
    if (!pokemonOneName || !pokemonTwoName) {
      setError("Please enter a name for both Pokémon.");
      return;
    }
    setIsLoading(true);
    setPokemonOneData(null);
    setPokemonTwoData(null);
    setError(null);
    setBattleResult(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const responses = await Promise.all([
        fetch(`/api/pokemon/${pokemonOneName.toLowerCase()}`),
        fetch(`/api/pokemon/${pokemonTwoName.toLowerCase()}`)
      ]);
      const data = await Promise.all(responses.map(res => {
        if (!res.ok) throw new Error(`Could not find one of the Pokémon. Please check the names.`);
        return res.json();
      }));
      setPokemonOneData(data[0]);
      setPokemonTwoData(data[1]);
      let score1 = 0;
      let score2 = 0;
      data[0].stats.forEach((stat: { base_stat: number }, index: number) => {
        if (stat.base_stat > data[1].stats[index].base_stat) score1++;
        else if (data[1].stats[index].base_stat > stat.base_stat) score2++;
      });
      let resultText = '';
      if (score1 > score2) resultText = `${data[0].name} wins ${score1} - ${score2}!`;
      else if (score2 > score1) resultText = `${data[1].name} wins ${score2} - ${score1}!`;
      else resultText = `It's a draw ${score1} - ${score1}!`;
      setBattleResult(resultText);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderComparisonStats = (p1: PokemonData, p2: PokemonData) => {
    // ... (unchanged)
    return p1.stats.map((stat, index) => {
      const p1Stat = stat.base_stat;
      const p2Stat = p2.stats[index].base_stat;
      const statName = stat.stat.name.replace('-', ' ');
      let p1Class = '', p2Class = '';
      if (p1Stat > p2Stat) p1Class = 'stat-winner';
      else if (p2Stat > p1Stat) p2Class = 'stat-winner';
      else { p1Class = 'stat-tie'; p2Class = 'stat-tie'; }
      return (
        <div key={statName} className="stat-row">
          <span className={p1Class}>{p1Stat}</span>
          <span className="stat-name">{statName}</span>
          <span className={p2Class}>{p2Stat}</span>
        </div>
      );
    });
  };

  return (
    <main>
      <h1>Pokémon Battle</h1>
        <form onSubmit={handleCompare} className="compare-form">
          {/* --- UPDATED INPUT 1 --- */}
          <div className="autocomplete-container">
            <input
              type="text"
              value={pokemonOneName}
              onChange={(e) => handleInputChange(e.target.value, 1)}
              placeholder="e.g., Charizard"
            />
            {suggestionsOne.length > 0 && (
              <ul className="suggestions-list">
                {suggestionsOne.map(p => (
                  <li key={p.name} onClick={() => handleSuggestionClick(p.name, 1)}>
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* --- UPDATED INPUT 2 --- */}
          <div className="autocomplete-container">
            <input
              type="text"
              value={pokemonTwoName}
              onChange={(e) => handleInputChange(e.target.value, 2)}
              placeholder="e.g., Blastoise"
            />
            {suggestionsTwo.length > 0 && (
              <ul className="suggestions-list">
                {suggestionsTwo.map(p => (
                  <li key={p.name} onClick={() => handleSuggestionClick(p.name, 2)}>
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Comparing...' : 'Compare!'}</button>
        </form>
        <a href="https://buy.stripe.com/00wbJ0bbc4YP6zDfpkgYU00" target="_blank" rel="noopener noreferrer" className="tip-button">
          If you like this, please leave a tip 💖
        </a>
        {error && <p className="error-message" style={{marginTop: '2rem'}}>{error}</p>}
        {isLoading ? (
          <div className="battle-container">
            <div className="pokemon-column"><PokemonCardSkeleton /></div>
            <div className="vs-divider"></div>
            <div className="pokemon-column"><PokemonCardSkeleton /></div>
          </div>
        ) : pokemonOneData && pokemonTwoData && (
          <div className="battle-container">
            <div className="pokemon-column"><PokemonCard data={pokemonOneData} /></div>
            <div className="vs-divider">
              {battleResult && (
                <div className="battle-result">
                  <h3>Result</h3>
                  <p>{battleResult}</p>
                </div>
              )}
              <h3>Base Stats</h3>
              <div className="stats-comparison">{renderComparisonStats(pokemonOneData, pokemonTwoData)}</div>
            </div>
            <div className="pokemon-column"><PokemonCard data={pokemonTwoData} /></div>
          </div>
        )}
    </main>
  );
}