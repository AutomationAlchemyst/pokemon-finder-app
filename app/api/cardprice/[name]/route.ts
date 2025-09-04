import { NextResponse } from 'next/server';

const API_KEY = process.env.POKEMON_TCG_API_KEY;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const name = pathParts[pathParts.length - 1];

  if (!name) {
    return NextResponse.json({ error: 'Pokémon name required' }, { status: 400 });
  }

  try {
    const tcgResponse = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${name}"`, {
      headers: { 'X-Api-Key': API_KEY! }
    });
    
    if (!tcgResponse.ok) {
      // If the API itself has an error, return N/A
      return NextResponse.json({ price: 'N/A' });
    }
    
    const tcgData = await tcgResponse.json();
    const firstCard = tcgData.data[0];

    // If no card is found, or it has no price info, return N/A
    if (!firstCard || !firstCard.tcgplayer?.prices) {
      return NextResponse.json({ price: 'N/A' });
    }

    const priceInfo = firstCard.tcgplayer.prices.holofoil || firstCard.tcgplayer.prices.unlimitedHolofoil || firstCard.tcgplayer.prices.normal || firstCard.tcgplayer.prices.reverseHolofoil;
    const marketPrice = priceInfo?.market;
    
    return NextResponse.json({ price: marketPrice ? `$${marketPrice.toFixed(2)}` : 'N/A' });

  } catch (_error) {
    return NextResponse.json({ price: 'N/A' });
  }
}