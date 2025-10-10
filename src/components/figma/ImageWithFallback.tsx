import React, { useState } from "react";

export const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [error, setError] = useState(false);
  return error ? (
    <div className={className} style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#888' }}>Image not available</span>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} onError={() => setError(true)} />
  );
};
