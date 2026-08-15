export const toast = {
  success: (msg: string) => console.log('Toast success:', msg),
  error: (msg: string) => console.log('Toast error:', msg),
  warning: (msg: string) => console.log('Toast warning:', msg),
  info: (msg: string) => console.log('Toast info:', msg),
};

export function useToast() {
  return { toast };
}
