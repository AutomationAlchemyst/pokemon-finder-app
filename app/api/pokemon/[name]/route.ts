import { NextResponse } from 'next/server';

// The function signature is now simplified to only accept 'request'.
// We have removed the second 'context' argument completely.
export async function GET(request: Request) {
  
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const name = pathParts[pathParts.length - 1];

  if (!name) {
    return NextResponse.json({ error: 'Could not determine Pokémon name from URL' }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Pokémon not found. Please check the spelling.' }, { status: 404 });
    }

    const data = await apiResponse.json();
    
    const responseData = {
      name: data.name,
      id: data.id,
      imageUrl: data.sprites.front_default,
      height: data.height,
      weight: data.weight,
      types: data.types,
      abilities: data.abilities,
      stats: data.stats,
    };

    return NextResponse.json(responseData);

  } catch (_error) { // The error variable is unused, so we prefix with '_'
    return NextResponse.json({ error: 'Failed to fetch data from the Pokémon API' }, { status: 500 });
  }
}