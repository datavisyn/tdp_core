import React from 'react';

type ThemeColorTypes = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'gray';
export function Button({
  themeColor,
  type,
  text,
  addIcon,
  backgroundColor,
}: {
  themeColor: ThemeColorTypes;
  type: 'icon' | 'text' | 'outline' | 'normal';
  text: string | null;
  addIcon: boolean;
  backgroundColor: 'bg-light' | 'bg-dark';
}) {
  return (
    <div className={`${backgroundColor} w-25 d-flex flex-row justify-content-center pt-5 pb-5`}>
      <button type="button" className={`btn btn${type !== 'normal' ? `-${type}` : ''}-${themeColor}`}>
        {addIcon && <i className="fas fa-plus me-1" />}
        {text}
      </button>
    </div>
  );
}
