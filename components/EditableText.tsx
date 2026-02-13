
import React from 'react';

interface EditableTextProps {
  id: string; // Kept for compatibility with existing usage
  defaultText: string;
  className?: string;
  multiline?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

/**
 * Standardized text wrapper for institutional content.
 * Live editing functionality has been removed to maintain site integrity.
 */
export const EditableText: React.FC<EditableTextProps> = ({ 
  defaultText, 
  className = "", 
  tag = 'span'
}) => {
  const Tag = tag;
  return <Tag className={className}>{defaultText}</Tag>;
};
