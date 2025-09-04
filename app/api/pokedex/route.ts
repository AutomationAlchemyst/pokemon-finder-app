import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // We fetch a high limit to get all Pokémon names at once.
    // This is a lightweight call that only gets names and URLs.
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
    
    if (!response.ok) {
      throw new Error('Failed to fetch Pokémon list');
    }

    const data = await response.json();
    return NextResponse.json(data.results);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data from PokeAPI' }, { status: 500 });
  }
}