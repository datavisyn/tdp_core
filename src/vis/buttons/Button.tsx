import React from 'react';

type ThemeColorTypes = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'gray';
export function Button({
  themeColor,
  type,
  text,
  addIcon,
}: {
  themeColor: ThemeColorTypes;
  type: 'icon' | 'text' | 'outline' | 'normal';
  text: string | null;
  addIcon: boolean;
}) {
  return (
    <button type="button" className={`btn btn${type !== 'normal' ? `-${type}` : ''}-${themeColor}`}>
      {addIcon && <i className="fas fa-plus me-1" />}
      {text}
    </button>
  );
}
