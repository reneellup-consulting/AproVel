export const formatCurrency = (
  amount: number | string | undefined | null,
  currencySymbol: string = '₱',
): string => {
  const numericAmount = Number(amount);

  // Safety check: returns 0.00 if the value is invalid (NaN)
  if (isNaN(numericAmount)) {
    return `${currencySymbol}0.00`;
  }

  return (
    currencySymbol +
    numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Define month names manually to ensure cross-platform consistency
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = date.getDate().toString().padStart(2, '0'); // Ensures '01' instead of '1'
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const toProperCase = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

export const formatCompactNumber = (
  number: number,
  currencySymbol: string = '₱',
) => {
  if (number >= 1000000)
    return `${currencySymbol}${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${currencySymbol}${(number / 1000).toFixed(0)}K`;
  return formatCurrency(number, currencySymbol);
};

export const formatCycleTime = (hours: number): string => {
  const format = (val: number) => Number(val.toFixed(1));
  const pluralize = (val: number, unit: string) => {
    const formatted = format(val);
    return `${formatted} ${unit}${formatted === 1 ? '' : 's'}`;
  };

  if (hours < 1) {
    const minutes = hours * 60;
    return pluralize(minutes, 'Minute');
  }

  if (hours < 24) {
    return pluralize(hours, 'Hour');
  }

  const days = hours / 24;
  if (days < 7) {
    return pluralize(days, 'Day');
  }

  const weeks = days / 7;
  if (weeks < 4) {
    return pluralize(weeks, 'Week');
  }

  const months = days / 30;
  if (months < 12) {
    return pluralize(months, 'Month');
  }

  const years = days / 365;
  return pluralize(years, 'Year');
};
