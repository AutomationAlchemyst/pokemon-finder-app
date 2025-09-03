import { NextResponse } from 'next/server';

// We will use the 'request' object but ignore the 'context' object
export async function GET(request: Request, context: { params: { name: string } }) {

  // --- NEW APPROACH ---
  // We will no longer use context.params.name
  // Instead, we manually parse the name from the request URL.
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const name = pathParts[pathParts.length - 1]; // The name is the last part of the URL path

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

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data from the Pokémon API' }, { status: 500 });
  }
}