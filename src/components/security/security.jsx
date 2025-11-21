'use client'
import { useEffect } from 'react';

const SecurityProtection = () => {
  useEffect(() => {
    let devToolsOpened = false;
    let originalFetch = window.fetch;

    // Fetch ni override qilish funksiyasi
    const overrideFetch = () => {
      window.fetch = function(...args) {
        // Agar bloklangan bo'lsa
        if (localStorage.getItem('devToolsBlocked') === 'true') {
          return Promise.resolve(new Response(JSON.stringify({
            error: 'API access blocked - Developer Tools detected',
            message: 'Please close Developer Tools and reload the page',
            blocked_url: args[0]
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        // Normal fetch
        return originalFetch.apply(this, args);
      };
    };

    const detectDevTools = () => {
      if (devToolsOpened) return;

      // 1. Window o'lchami orqali
      const widthThreshold = 160;
      const heightThreshold = 160;
      
      if (window.outerWidth - window.innerWidth > widthThreshold || 
          window.outerHeight - window.innerHeight > heightThreshold) {
        triggerProtection();
        return;
      }
      
      // 2. Debugger orqali
      try {
        const start = Date.now();
        debugger;
        if (Date.now() - start > 100) {
          triggerProtection();
          return;
        }
      } catch (e) {}
    };

    const triggerProtection = () => {
      if (devToolsOpened) return;
      devToolsOpened = true;
      
      console.clear();  
      // LocalStorage ga bloklanganligini yozish
      localStorage.setItem('devToolsBlocked', 'true');
      
      // Fetch ni override qilish
      overrideFetch();
      
      // Sahifani bloklash
      showBlockOverlay();
    };

    const showBlockOverlay = () => {
      const overlay = document.createElement('div');
      overlay.id = 'security-overlay';
      overlay.style.cssText = `
        position: fixed; 
        top: 0; left: 0; 
        width: 100vw; 
        height: 100vh; 
        background: #0a0a0a; 
        color: white; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        font-family: Arial, sans-serif; 
        z-index: 99999;
        flex-direction: column;
        text-align: center;
        padding: 20px;
      `;
      
      overlay.innerHTML = `
        <div style="background: #1a1a1a; padding: 40px; border-radius: 10px; border: 2px solid #ff4444; max-width: 500px;">
          <h1 style="color: #ff4444; font-size: 28px; margin-bottom: 20px;">🚫 Xavfsizlik Himoyasi</h1>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="localStorage.removeItem('devToolsBlocked'); window.location.reload()" style="
              background: #28a745; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 5px; 
              cursor: pointer;
            ">Qayta Yuklash</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
    };

    // ✅ ENG MUHIM: Komponent yuklanishidan OLDIN fetch ni override qilish
    overrideFetch();

    // Oldin bloklanganligini tekshirish
    if (localStorage.getItem('devToolsBlocked') === 'true') {
      triggerProtection();
      return;
    }
    const monitorInterval = setInterval(detectDevTools, 500);
    return () => {
      clearInterval(monitorInterval);
      // Cleanup - original fetch ni qaytarish
      window.fetch = originalFetch;
    };
  }, []);

  return null;
};

export default SecurityProtection;