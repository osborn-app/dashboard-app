import Swal, { SweetAlertOptions } from 'sweetalert2';

/**
 * Custom SweetAlert configuration with proper z-index
 * to work with modals and dialogs
 */
const defaultOptions: SweetAlertOptions = {
  customClass: {
    container: 'z-[99999]', // Higher than modal (z-50)
    popup: 'z-[99999]',
  },
  backdrop: true,
  allowOutsideClick: true,
};

/**
 * SweetAlert with proper z-index configuration
 */
export const Alert = {
  fire: (options: SweetAlertOptions) => {
    return Swal.fire({
      ...defaultOptions,
      ...options,
    });
  },

  success: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultOptions,
      icon: 'success',
      title,
      text,
    });
  },

  error: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultOptions,
      icon: 'error',
      title,
      text,
    });
  },

  warning: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultOptions,
      icon: 'warning',
      title,
      text,
    });
  },

  confirm: (options: SweetAlertOptions) => {
    return Swal.fire({
      ...defaultOptions,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
      ...options,
    });
  },
};

export default Alert;

