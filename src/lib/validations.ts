export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  if (parseInt(cleanCPF[9]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return parseInt(cleanCPF[10]) === digit2;
};

export const validateRG = (rg: string): boolean => {
  // Remove caracteres não alfanuméricos
  const cleanRG = rg.replace(/[^a-zA-Z0-9]/g, '');
  
  // RG deve ter entre 7 e 9 caracteres
  return cleanRG.length >= 7 && cleanRG.length <= 9;
};

export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Telefone deve ter 10 ou 11 dígitos
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

export const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '').slice(0, 11); // Limita a 11 dígitos
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatRG = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '').slice(0, 9); // Limita a 9 dígitos
  return cleanValue
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '').slice(0, 11); // Limita a 11 dígitos
  if (cleanValue.length <= 10) {
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

export const formatCEP = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '').slice(0, 8); // Limita a 8 dígitos
  return cleanValue.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};