// PWA Utilities for PuppyTrainer Pro
// Provides install prompt and PWA-specific functionality

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.setupEventListeners();
    this.checkInstallationStatus();
  }

  private setupEventListeners() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('💾 PWA install prompt available');
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PuppyTrainer Pro installed successfully!');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      console.log('📡 Back online - syncing data...');
      this.showConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
      console.log('📱 Gone offline - using cached data');
      this.showConnectionStatus('offline');
    });
  }

  private checkInstallationStatus() {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('📱 Running as installed PWA');
    }
  }

  // Check if app can be installed
  public canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  // Show install prompt
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('❌ Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`👤 User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Install prompt failed:', error);
      return false;
    }
  }

  // Check if app is installed
  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Check if device is online
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Show connection status
  private showConnectionStatus(status: 'online' | 'offline') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-opacity duration-300 ${
      status === 'online' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = status === 'online' 
      ? '📡 Back online!' 
      : '📱 You\'re offline - data saved locally';
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Get install instructions for different platforms
  public getInstallInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      return 'Tap the menu button and select "Add to Home Screen" or "Install App"';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Tap the share button and select "Add to Home Screen"';
    } else if (userAgent.includes('chrome')) {
      return 'Look for the install button in the address bar or browser menu';
    } else {
      return 'Look for an install or "Add to Home Screen" option in your browser menu';
    }
  }

  // Request persistent storage
  public async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();
        console.log(`💾 Persistent storage: ${persistent ? 'granted' : 'denied'}`);
        return persistent;
      } catch (error) {
        console.error('❌ Failed to request persistent storage:', error);
        return false;
      }
    }
    return false;
  }

  // Get storage usage estimate
  public async getStorageEstimate(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        console.log('💾 Storage estimate:', estimate);
        return estimate;
      } catch (error) {
        console.error('❌ Failed to get storage estimate:', error);
        return null;
      }
    }
    return null;
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// React hook for PWA functionality
import { useState, useEffect } from 'react';

export function usePWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check initial state
    setCanInstall(pwaManager.canInstall());
    setIsInstalled(pwaManager.isAppInstalled());

    // Listen for PWA events
    const checkInstallability = () => {
      setCanInstall(pwaManager.canInstall());
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', checkInstallability);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallability);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = async () => {
    const success = await pwaManager.showInstallPrompt();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return success;
  };

  return {
    canInstall,
    isInstalled,
    isOnline,
    install,
    getInstallInstructions: () => pwaManager.getInstallInstructions(),
    requestPersistentStorage: () => pwaManager.requestPersistentStorage(),
    getStorageEstimate: () => pwaManager.getStorageEstimate()
  };
}