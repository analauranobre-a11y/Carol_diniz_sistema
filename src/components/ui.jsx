import React, { useState } from 'react';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

export const FormField = ({ label, children, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-orange-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${className}`}
    {...props}
  />
);

export const Select = ({ className = '', children, ...props }) => (
  <select
    className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none ${className}`}
    rows={3}
    {...props}
  />
);

export const Btn = ({ variant = 'primary', className = '', children, ...props }) => {
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border border-orange-500 text-orange-500 hover:bg-orange-50',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ color = 'gray', children }) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export const StatCard = ({ label, value, sub, color = 'orange' }) => {
  const colors = { orange: 'text-orange-500', green: 'text-green-500', blue: 'text-blue-500', gray: 'text-gray-500' };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

export const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    {action}
  </div>
);

export const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <span className="text-5xl mb-3">{icon}</span>
    <p className="text-sm">{message}</p>
  </div>
);

export const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
