// in app/components/PokemonCardSkeleton.tsx

export const PokemonCardSkeleton = () => (
  <div className="pokemon-card skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    
    <div className="card-details-section">
      <div className="skeleton skeleton-subtitle"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line"></div>
    </div>
    
    <div className="card-details-section">
      <div className="skeleton skeleton-subtitle"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line"></div>
    </div>
  </div>
);