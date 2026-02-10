
import React, { useState, useEffect, useRef } from 'react';
import { contentService } from '../services/contentService';
import { useEdit } from './EditContext';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  multiline?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  id, 
  defaultText, 
  className = "", 
  tag = 'span',
  multiline = false
}) => {
  const { isTextEditing } = useEdit();
  const [text, setText] = useState(contentService.getText(id, defaultText));
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setText(contentService.getText(id, defaultText));
  }, [id, defaultText]);

  const handleBlur = () => {
    if (elementRef.current) {
      const newText = elementRef.current.innerText;
      setText(newText);
      contentService.saveUpdate(id, newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  const Tag = tag;

  if (!isTextEditing) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag
      ref={elementRef as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} outline-none ring-2 ring-amber-400 ring-offset-2 rounded px-1 transition-all bg-amber-50/50 cursor-text`}
    >
      {text}
    </Tag>
  );
};
