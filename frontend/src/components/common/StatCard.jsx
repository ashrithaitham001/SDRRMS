import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const iconColorMap = {
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'teal',
  trend,
  subtitle,
  onClick,
  className = '',
}) => {
  const iconTheme = iconColorMap[iconColor] || iconColorMap.teal;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-teal-300' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {value ?? '0'}
            </h3>
          </div>
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${iconTheme}`}>
            {React.isValidElement(Icon) ? Icon : <Icon className="h-6 w-6" />}
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          {trend && typeof trend === 'object' && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend.value}
            </span>
          )}

          {typeof trend === 'string' && (
            <span className="font-medium text-slate-700">{trend}</span>
          )}

          {subtitle && (
            <span className="text-slate-500 truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
