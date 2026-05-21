export const normalizeInputValue = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly === '') {
    return '';
  }

  return digitsOnly.replace(/^0+(?=\d)/, '');
};
