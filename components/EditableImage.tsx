
import React, { memo } from 'react';

interface EditableImageProps {
  id: string; // Kept for compatibility with existing usage
  defaultSrc: string;
  className?: string;
  alt?: string;
}

/**
 * Standardized image wrapper for institutional assets.
 * Interactive editing and cloud synchronization modules have been removed.
 */
export const EditableImage = memo(({ defaultSrc, className, alt }: EditableImageProps) => {
  return (
    <div className={`relative ${className} overflow-hidden`}>
      <img 
        src={defaultSrc} 
        alt={alt || "Institutional Asset"} 
        className="w-full h-full object-cover block" 
      />
    </div>
  );
});
