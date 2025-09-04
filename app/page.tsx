"use client";

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { PokemonCardSkeleton } from './components/PokemonCardSkeleton'; // Import the new skeleton component

// Define the shape of our Pokémon data
type PokemonData = {
  name: string;
  id: number;
  imageUrl: string;
  types: { type: { name:string } }[];
  abilities: { ability: { name: string }, is_hidden: boolean }[];
  stats: { stat: { name: string }, base_stat: number }[];
};

// This component renders the card once data is loaded
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

// This is the main page component
export default function HomePage() {
  // State variables to manage the app's data and UI
  const [pokemonOneName, setPokemonOneName] = useState('');
  const [pokemonTwoName, setPokemonTwoName] = useState('');
  const [pokemonOneData, setPokemonOneData] = useState<PokemonData | null>(null);
  const [pokemonTwoData, setPokemonTwoData] = useState<PokemonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<string | null>(null);

  // Main function to handle the comparison
  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    if (!pokemonOneName || !pokemonTwoName) {
      setError("Please enter a name for both Pokémon.");
      return;
    }
    
    // Reset the state and start loading
    setIsLoading(true);
    setPokemonOneData(null);
    setPokemonTwoData(null);
    setError(null);
    setBattleResult(null);

    // I've added a small delay here so you can clearly see the skeleton effect in action.
    // You can remove this line in the final version if you want.
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    try {
      // Fetch data for both Pokémon simultaneously
      const responses = await Promise.all([
        fetch(`/api/pokemon/${pokemonOneName.toLowerCase()}`),
        fetch(`/api/pokemon/${pokemonTwoName.toLowerCase()}`)
      ]);
      const data = await Promise.all(responses.map(res => {
        if (!res.ok) throw new Error(`Could not find one of the Pokémon. Please check the names.`);
        return res.json();
      }));
      
      // Store the data
      setPokemonOneData(data[0]);
      setPokemonTwoData(data[1]);

      // Calculate the battle score
      let score1 = 0;
      let score2 = 0;
      data[0].stats.forEach((stat: { base_stat: number }, index: number) => {
        if (stat.base_stat > data[1].stats[index].base_stat) {
          score1++;
        } else if (data[1].stats[index].base_stat > stat.base_stat) {
          score2++;
        }
      });

      // Determine the result text
      let resultText = '';
      if (score1 > score2) resultText = `${data[0].name} wins ${score1} - ${score2}!`;
      else if (score2 > score1) resultText = `${data[1].name} wins ${score2} - ${score1}!`;
      else resultText = `It's a draw ${score1} - ${score1}!`;
      setBattleResult(resultText);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    } finally {
      setIsLoading(false); // Stop loading, regardless of success or error
    }
  };

  // Helper function to render the stat comparison rows
  const renderComparisonStats = (p1: PokemonData, p2: PokemonData) => {
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

  // The JSX that renders the page
  return (
    <main>
      <h1>Pokémon Battle</h1>
        <form onSubmit={handleCompare} className="compare-form">
          <input type="text" value={pokemonOneName} onChange={(e) => setPokemonOneName(e.target.value)} placeholder="e.g., Charizard"/>
          <input type="text" value={pokemonTwoName} onChange={(e) => setPokemonTwoName(e.target.value)} placeholder="e.g., Blastoise"/>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Comparing...' : 'Compare!'}</button>
        </form>
        <a href="https://buy.stripe.com/00wbJ0bbc4YP6zDfpkgYU00" target="_blank" rel="noopener noreferrer" className="tip-button">
          If you like this, please leave a tip 💖
        </a>

      {error && <p className="error-message" style={{marginTop: '2rem'}}>{error}</p>}

      {/* This is the key logic: show skeletons while loading, otherwise show the results */}
      {isLoading ? (
        <div className="battle-container">
          <div className="pokemon-column"><PokemonCardSkeleton /></div>
          <div className="vs-divider">
            {/* We don't show stats or results while loading */}
          </div>
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