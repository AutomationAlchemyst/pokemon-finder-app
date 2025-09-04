"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Pokemon = {
  name: string;
  url: string;
};

export default function PokedexPage() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the list of all Pokémon when the page loads
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch('/api/pokedex');
        const data = await response.json();
        setAllPokemon(data);
        setFilteredPokemon(data);
      } catch (error) {
        console.error("Failed to fetch Pokémon list:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllPokemon();
  }, []);

  // Filter the list whenever the search term changes
  useEffect(() => {
    const results = allPokemon.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPokemon(results);
  }, [searchTerm, allPokemon]);

  return (
    <main>
      <div className="pokedex-header">
        <h1>Pokédex</h1>
        <p>Search for a Pokémon to reference its name.</p>
        <Link href="/" className="back-link">← Back to Battle</Link>
      </div>
      
      <input
        type="text"
        placeholder="Search Pokémon..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading ? (
        <p>Loading Pokédex...</p>
      ) : (
        <div className="pokedex-grid">
          {filteredPokemon.map((pokemon) => (
            <div key={pokemon.name} className="pokedex-card">
              {pokemon.name}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}