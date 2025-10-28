
import { ExtractedStoreData } from '../types';

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

const formatNumber = (num: number) => num.toFixed(2);
const formatPercent = (num: number) => `${(num * 100).toFixed(2)}%`;

export const downloadCsv = (data: ExtractedStoreData[], filename: string = 'report.csv') => {
  if (!data.length) return;

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
  
  const headers = ['Magasin', 'Indicateur', ...sortedDates, 'Total'];
  
  const rows = Object.entries(transformedData).flatMap(([storeName, storeData]) => {
    const revenueRow = [
      storeName,
      "Chiffre d'affaires HT",
      ...sortedDates.map(date => formatNumber(storeData.daily[date]?.revenue || 0)),
      formatNumber(storeData.total.revenue),
    ];
    const costsRow = [
      storeName,
      'MS chargée',
      ...sortedDates.map(date => formatNumber(storeData.daily[date]?.costs || 0)),
      formatNumber(storeData.total.costs),
    ];
    const percentRow = [
      storeName,
      '% MS',
      ...sortedDates.map(date => {
        const day = storeData.daily[date];
        return day && day.revenue ? formatPercent(day.costs / day.revenue) : '0.00%';
      }),
      storeData.total.revenue ? formatPercent(storeData.total.costs / storeData.total.revenue) : '0.00%',
    ];
    return [revenueRow, costsRow, percentRow];
  });

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
