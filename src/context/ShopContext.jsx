import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { ownsProduct } from '../utils/product';
import { 
  productService, 
  requestService, 
  bannerService, 
  noticeService, 
  orderService 
} from '../services/storageService';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const { currentUser, isAuthLoading } = useAuth();
  const loadVersion = useRef(0);
  const [dataError, setDataError] = useState('');
  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [notices, setNotices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Cart & Wishlist persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('themor_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('themor_wishlist');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2'];
    } catch {
      return [];
    }
  });

  // Global search & UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null); // { message, type: 'info'|'success'|'error' }

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Initial load from storage service
  const loadInitialData = async () => {
    const version = ++loadVersion.current;
    try {
      const [prods, bans, nots, reqs, ords] = await Promise.all([
        productService.getAll(),
        bannerService.getAll(),
        noticeService.getAll(),
        requestService.getAll(),
        orderService.getAll()
      ]);
      if (version !== loadVersion.current) return;
      setDataError('');
      setProducts(prods);
      setBanners(bans);
      setNotices(nots);
      setRequests(reqs);
      setOrders(ords);
    } catch (err) {
      if (version === loadVersion.current) setDataError(err.message);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    setOrders([]);
    setRequests([]);
    loadInitialData();
    const refresh = () => { if (document.visibilityState === 'visible') loadInitialData(); };
    const interval = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    window.addEventListener('themor-data-changed', refresh);
    return () => { loadVersion.current++; clearInterval(interval); window.removeEventListener('focus', refresh); window.removeEventListener('themor-data-changed', refresh); };
  }, [isAuthLoading, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    const onApiError = event => showToast(event.detail, 'error');
    window.addEventListener('themor-api-error', onApiError);
    return () => window.removeEventListener('themor-api-error', onApiError);
  }, []);

  // Save Cart & Wishlist
  useEffect(() => {
    localStorage.setItem('themor_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('themor_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Purge self-registered items from cart if current user is their seller
  useEffect(() => {
    if (currentUser) {
      setCart(prev => {
        const filtered = prev.filter(item => !ownsProduct(currentUser, item));
        return filtered.length !== prev.length ? filtered : prev;
      });
    }
  }, [currentUser]);

  // Product CRUD
  const addProduct = async (productData) => {
    const created = await productService.create(productData);
    setProducts(prev => [created, ...prev]);
    showToast(`'${created.name}' 상품이 등록되었습니다.`);
    return created;
  };

  const updateProduct = async (id, updatedFields) => {
    const updated = await productService.update(id, updatedFields);
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
    showToast('상품 정보가 성공적으로 수정되었습니다.');
    return updated;
  };

  const deleteProduct = async (id) => {
    await productService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('상품이 삭제되었습니다.', 'info');
  };

  // Cart operations
  const addToCart = (product, quantity = 1, { silent = false } = {}) => {
    if (ownsProduct(currentUser, product)) {
      showToast('본인이 직접 등록한 판매 상품은 장바구니에 담을 수 없습니다.', 'error');
      return false;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity, selected: true }];
    });
    if (!silent) {
      showToast(`'${product.name}' 장바구니에 담았습니다.`);
    }
    return true;
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const toggleCartItemSelection = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllCartItems = (selected) => {
    setCart(prev => prev.map(item => ({ ...item, selected })));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('장바구니에서 삭제되었습니다.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast('관심 상품에서 제외되었습니다.', 'info');
        return prev.filter(id => id !== product.id);
      } else {
        showToast(`'${product.name}' 관심 상품에 추가했습니다.`);
        return [...prev, product.id];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Request / User proposals operations
  const submitRequest = async (requestData) => {
    if (requestData.type === 'report') {
      const target = products.find(product => requestData.targetProductId ? product.id === requestData.targetProductId : product.name === requestData.targetItem);
      if (ownsProduct(currentUser, target)) {
        showToast('본인이 등록한 상품은 신고할 수 없습니다.', 'error');
        return null;
      }
    }
    const created = await requestService.create(requestData);
    setRequests(prev => [created, ...prev]);
    showToast(`신청이 정상 접수되었습니다. (접수번호: ${created.id})`);
    return created;
  };

  const updateRequestStatus = async (id, newStatus, adminNote) => {
    const updated = await requestService.updateStatus(id, newStatus, adminNote);
    setRequests(prev => prev.map(r => (r.id === id ? updated : r)));
    showToast(`접수번호 [${id}] 상태가 [${newStatus}]으로 변경되었습니다.`);
    return updated;
  };

  // Order placement
  const placeOrder = async (orderPayload, { fromCart = false } = {}) => {
    const created = await orderService.create(orderPayload);
    productService.getAll().then(setProducts).catch(() => {});
    setOrders(prev => [created, ...prev]);
    // remove ordered items from cart only if order was initiated from cart checkout
    if (fromCart) {
      const orderedIds = new Set((orderPayload.items || []).map(i => i.id));
      setCart(prev => prev.filter(item => !orderedIds.has(item.id)));
    }
    showToast(`주문이 성공적으로 접수되었습니다! (주문번호: ${created.orderId})`);
    return created;
  };

  // Banners & Notices admin operations
  const addBanner = async (bannerData) => {
    const created = await bannerService.create(bannerData);
    setBanners(prev => [...prev, created]);
    showToast('새 프로모션 배너가 등록되었습니다.');
  };

  const updateBanner = async (id, fields) => {
    const updated = await bannerService.update(id, fields);
    setBanners(prev => prev.map(b => (b.id === id ? updated : b)));
    showToast('배너가 수정되었습니다.');
  };

  const deleteBanner = async (id) => {
    await bannerService.delete(id);
    setBanners(prev => prev.filter(b => b.id !== id));
    showToast('배너가 삭제되었습니다.', 'info');
  };

  const addNotice = async (noticeData) => {
    const created = await noticeService.create(noticeData);
    setNotices(prev => [created, ...prev]);
    showToast('새 공지사항이 등록되었습니다.');
  };

  const updateNotice = async (id, fields) => {
    const updated = await noticeService.update(id, fields);
    setNotices(prev => prev.map(n => (n.id === id ? updated : n)));
    showToast('공지사항이 수정되었습니다.');
  };

  const deleteNotice = async (id) => {
    await noticeService.delete(id);
    setNotices(prev => prev.filter(n => n.id !== id));
    showToast('공지사항이 삭제되었습니다.', 'info');
  };

  return (
    <ShopContext.Provider value={{
      products,
      dataError,
      refreshData: loadInitialData,
      banners,
      notices,
      requests,
      orders,
      cart,
      wishlist,
      searchQuery,
      setSearchQuery,
      toast,
      showToast,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      updateCartQuantity,
      toggleCartItemSelection,
      toggleAllCartItems,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      submitRequest,
      updateRequestStatus,
      placeOrder,
      addBanner,
      updateBanner,
      deleteBanner,
      addNotice,
      updateNotice,
      deleteNotice
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
