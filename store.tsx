import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ingredient, MenuItem, Table, Order, Reservation, OrderStatus, TableStatus } from './types';
import { INITIAL_INGREDIENTS, INITIAL_TABLES, INITIAL_RESERVATIONS, MENU_ITEMS as INITIAL_MENU_ITEMS } from './constants';

interface AppContextType {
  ingredients: Ingredient[];
  tables: Table[];
  orders: Order[];
  reservations: Reservation[];
  activeOrder: Order | null;
  menuItems: MenuItem[];
  systemPrompt: string;
  
  // Actions
  createOrder: (tableId: string) => void;
  addToOrder: (menuItem: MenuItem) => void;
  updateOrderItemQuantity: (menuItemId: string, delta: number) => void;
  updateOrderItemNotes: (menuItemId: string, notes: string) => void;
  removeOrderItem: (menuItemId: string) => void;
  completeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deductInventory: (menuItem: MenuItem) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  
  // Admin Actions
  updateSystemPrompt: (prompt: string) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SYSTEM_PROMPT = `
You are "ShiftBot", the AI Operations Assistant for a busy restaurant called "SHIFT HAPPENS!".
Your tone is professional, efficient, but slightly witty.
Your capabilities:
1. Answer questions about current inventory levels.
2. Suggest recipes based on menu items.
3. Draft responses to guest reviews (simulate this).
4. Provide advice on handling operational conflicts.

Keep answers concise (under 150 words) unless asked for a detailed report.
Format your response with Markdown if helpful.
`.trim();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);

  const createOrder = (tableId: string) => {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      tableId,
      items: [],
      status: OrderStatus.PENDING,
      total: 0,
      timestamp: new Date(),
    };
    setOrders([...orders, newOrder]);
    setActiveOrder(newOrder);
    updateTableStatus(tableId, TableStatus.OCCUPIED);
  };

  const addToOrder = (menuItem: MenuItem) => {
    if (!activeOrder) return;

    const updatedOrder = { ...activeOrder };
    const existingItemIndex = updatedOrder.items.findIndex(i => i.menuItemId === menuItem.id);

    if (existingItemIndex >= 0) {
      updatedOrder.items[existingItemIndex].quantity += 1;
    } else {
      updatedOrder.items.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price
      });
    }

    updatedOrder.total += menuItem.price;
    
    // Update local active order state
    setActiveOrder(updatedOrder);
    
    // Update in global orders list
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const updateOrderItemQuantity = (menuItemId: string, delta: number) => {
    if (!activeOrder) return;

    const updatedOrder = { ...activeOrder };
    const itemIndex = updatedOrder.items.findIndex(i => i.menuItemId === menuItemId);

    if (itemIndex >= 0) {
      const item = { ...updatedOrder.items[itemIndex] };
      const newQuantity = item.quantity + delta;
      
      if (newQuantity > 0) {
          item.quantity = newQuantity;
          updatedOrder.items[itemIndex] = item;
          
          // Recalculate total
          updatedOrder.total = updatedOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

          setActiveOrder(updatedOrder);
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      }
    }
  };

  const updateOrderItemNotes = (menuItemId: string, notes: string) => {
    if (!activeOrder) return;

    const updatedOrder = { ...activeOrder };
    const itemIndex = updatedOrder.items.findIndex(i => i.menuItemId === menuItemId);

    if (itemIndex >= 0) {
      const item = { ...updatedOrder.items[itemIndex] };
      item.notes = notes;
      updatedOrder.items[itemIndex] = item;

      setActiveOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    }
  };

  const removeOrderItem = (menuItemId: string) => {
    if (!activeOrder) return;

    const updatedOrder = { ...activeOrder };
    updatedOrder.items = updatedOrder.items.filter(i => i.menuItemId !== menuItemId);
    
    // Recalculate total
    updatedOrder.total = updatedOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    setActiveOrder(updatedOrder);
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const deductInventory = (menuItem: MenuItem) => {
    setIngredients(prevIngredients => {
      return prevIngredients.map(ing => {
        const recipeItem = menuItem.recipe.find(r => r.ingredientId === ing.id);
        if (recipeItem) {
          return { ...ing, stock: Math.max(0, ing.stock - recipeItem.quantity) };
        }
        return ing;
      });
    });
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, ...updates } : ing));
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Logic: When order is "Sent" to kitchen, deduct inventory
    order.items.forEach(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (menuItem) {
        // Deduct for each quantity
        for(let i=0; i < item.quantity; i++) {
            deductInventory(menuItem);
        }
      }
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.PREPARING } : o));
    setActiveOrder(null);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  };

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [...prev, reservation]);
  };
  
  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(res => res.id === id ? { ...res, ...updates } : res));
  };

  // Admin Actions
  const updateSystemPrompt = (prompt: string) => {
    setSystemPrompt(prompt);
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider value={{
      ingredients,
      tables,
      orders,
      reservations,
      activeOrder,
      menuItems,
      systemPrompt,
      createOrder,
      addToOrder,
      updateOrderItemQuantity,
      updateOrderItemNotes,
      removeOrderItem,
      completeOrder,
      updateOrderStatus,
      updateTableStatus,
      addReservation,
      updateReservation,
      deductInventory,
      updateIngredient,
      updateSystemPrompt,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};