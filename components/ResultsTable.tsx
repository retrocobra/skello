
import React from 'react';
import { ExtractedStoreData } from '../types';

interface ResultsTableProps {
  data: ExtractedStoreData[];
}

interface TransformedData {
  [storeName: string]: {
    daily: {
      [date: string]: {
        revenue: number;
        costs: number;
      };
    };
    total: {
      revenue: number;
      costs: number;
    };
  };
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (!data.length) {
    return null;
  }

  const transformedData: TransformedData = {};
  const allDates = new Set<string>();

  data.forEach(store => {
    if (!transformedData[store.storeName]) {
      transformedData[store.storeName] = { daily: {}, total: { revenue: 0, costs: 0 } };
    }
    store.dailyData.forEach(day => {
      allDates.add(day.date);
      transformedData[store.storeName].daily[day.date] = { revenue: day.revenue, costs: day.costs };
    });
    transformedData[store.storeName].total = store.weeklyTotal;
  });

  const sortedDates = Array.from(allDates).sort();
  const stores = Object.keys(transformedData).sort();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="sticky left-0 bg-gray-50 dark:bg-gray-800 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Magasin</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Indicateur</th>
            {sortedDates.map(date => (
              <th key={date} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-bold">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {stores.map((storeName, storeIndex) => {
            const storeData = transformedData[storeName];
            const isEvenStore = storeIndex % 2 === 0;
            const baseBg = isEvenStore ? 'bg-white dark:bg-gray-900' : 'bg-slate-50 dark:bg-slate-800/[.5]';
            const hoverBg = 'hover:bg-indigo-50 dark:hover:bg-indigo-900/[.2]';

            const caTotal = storeData.total.revenue;
            const msTotal = storeData.total.costs;
            const msPercentTotal = caTotal > 0 ? msTotal / caTotal : 0;

            return (
              <React.Fragment key={storeName}>
                <tr className={`${baseBg} ${hoverBg}`}>
                  <td rowSpan={3} className="sticky left-0 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-700" style={{backgroundColor: 'inherit'}}>{storeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Chiffre d'affaires HT</td>
                  {sortedDates.map(date => (
                    <td key={date} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 text-right">{formatCurrency(storeData.daily[date]?.revenue || 0)}</td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 text-right font-bold">{formatCurrency(caTotal)}</td>
                </tr>
                <tr className={`${baseBg} ${hoverBg}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">MS chargée</td>
                  {sortedDates.map(date => (
                    <td key={date} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 text-right">{formatCurrency(storeData.daily[date]?.costs || 0)}</td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 text-right font-bold">{formatCurrency(msTotal)}</td>
                </tr>
                <tr className={`${baseBg} ${hoverBg}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-semibold">% MS</td>
                   {sortedDates.map(date => {
                      const day = storeData.daily[date];
                      const percent = day && day.revenue > 0 ? day.costs / day.revenue : 0;
                      return <td key={date} className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 text-right font-semibold">{formatPercentage(percent)}</td>
                    })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 text-right font-bold">{formatPercentage(msPercentTotal)}</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
