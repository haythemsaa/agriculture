// Global toast instance
let toastInstance: any = null

export const useToast = () => {
  const setToastInstance = (instance: any) => {
    toastInstance = instance
  }

  const toast = {
    success: (message: string, title?: string) => {
      if (toastInstance) {
        toastInstance.success(message, title)
      } else {
        console.warn('Toast not initialized')
      }
    },
    error: (message: string, title?: string) => {
      if (toastInstance) {
        toastInstance.error(message, title)
      } else {
        console.error('Toast not initialized:', message)
      }
    },
    warning: (message: string, title?: string) => {
      if (toastInstance) {
        toastInstance.warning(message, title)
      } else {
        console.warn('Toast not initialized:', message)
      }
    },
    info: (message: string, title?: string) => {
      if (toastInstance) {
        toastInstance.info(message, title)
      } else {
        console.info('Toast not initialized:', message)
      }
    },
  }

  return {
    toast,
    setToastInstance,
  }
}
