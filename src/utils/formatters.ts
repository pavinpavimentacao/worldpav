// Utilitários de formatação para inputs

/**
 * Formata CPF: 000.000.000-00
 */
export const formatCPF = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara
  return limited
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Formata RG: 00.000.000-0
 */
export const formatRG = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 9 dígitos
  const limited = numbers.slice(0, 9);
  
  // Aplica a máscara
  return limited
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const formatPhone = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara baseada no tamanho
  if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

/**
 * Valida e formata email
 */
export const formatEmail = (value: string): string => {
  // Remove espaços e converte para minúsculo
  return value.trim().toLowerCase();
};

/**
 * Remove formatação de CPF (apenas números)
 */
export const unformatCPF = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Remove formatação de RG (apenas números)
 */
export const unformatRG = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Remove formatação de telefone (apenas números)
 */
export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida CPF
 */
export const isValidCPF = (cpf: string): boolean => {
  const numbers = unformatCPF(cpf);
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false; // Todos os dígitos iguais
  
  // Validação do dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone brasileiro
 */
export const isValidPhone = (phone: string): boolean => {
  const numbers = unformatPhone(phone);
  return numbers.length >= 10 && numbers.length <= 11;
};
