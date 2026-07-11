import { useCallback } from 'react';

declare global {
  interface Window {
    ue?: {
      dashboardinterface?: {
        open3dview: () => void;
        opendashboard: (path: string) => void;
      };
    };
  }
}

export function useUE5() {
  const isUE5 = typeof window !== 'undefined' && !!window.ue?.dashboardinterface;

  const open3DView = useCallback(() => {
    if (isUE5) {
      window.ue!.dashboardinterface!.open3dview();
      return true;
    }
    return false;
  }, [isUE5]);

  const openDashboard = useCallback((path: string) => {
    if (isUE5) {
      window.ue!.dashboardinterface!.opendashboard(path);
      return true;
    }
    return false;
  }, [isUE5]);

  return {
    isUE5,
    open3DView,
    openDashboard
  };
}
