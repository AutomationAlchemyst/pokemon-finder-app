"use client";

import { useState, FormEvent } from 'react';
import Image from 'next/image';

type PokemonData = {
  name: string;
  id: number;
  imageUrl: string;
  types: { type: { name:string } }[];
  abilities: { ability: { name: string }, is_hidden: boolean }[];
  stats: { stat: { name: string }, base_stat: number }[];
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

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    if (!pokemonOneName || !pokemonTwoName) {
      setError("Please enter a name for both Pokémon.");
      return;
    }

    setIsLoading(true);
    setPokemonOneData(null);
    setPokemonTwoData(null);
    setError(null);

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
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <main>
        <h1>Pokémon Battle</h1>
        <p>Enter two Pokémon to see how they stack up head-to-head.</p>
        <form onSubmit={handleCompare} className="compare-form">
          <input type="text" value={pokemonOneName} onChange={(e) => setPokemonOneName(e.target.value)} placeholder="e.g., Charizard"/>
          <input type="text" value={pokemonTwoName} onChange={(e) => setPokemonTwoName(e.target.value)} placeholder="e.g., Blastoise"/>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Comparing...' : 'Compare!'}</button>
        </form>

        {/* --- ADD THE TIP BUTTON HERE --- */}
        <a 
          href="https://buy.stripe.com/00wbJ0bbc4YP6zDfpkgYU00" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="tip-button"
        >
          If you like this, please leave a tip 💖
        </a>
        
        {error && <p className="error-message" style={{marginTop: '2rem'}}>{error}</p>}
        {pokemonOneData && pokemonTwoData && (
          <div className="battle-container">
            <div className="pokemon-column"><PokemonCard data={pokemonOneData} /></div>
            <div className="vs-divider">
              <h3>Base Stats</h3>
              <div className="stats-comparison">{renderComparisonStats(pokemonOneData, pokemonTwoData)}</div>
            </div>
            <div className="pokemon-column"><PokemonCard data={pokemonTwoData} /></div>
          </div>
        )}
    </main>
  );
}