import React, { useState } from 'react';
import { useAppStore } from '../store';
import { MenuItem, TableStatus } from '../types';
import { Plus, Minus, Trash2, CreditCard, ChefHat } from 'lucide-react';

const POS = () => {
  const { tables, activeOrder, createOrder, addToOrder, completeOrder, menuItems } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');

  const filteredItems = selectedCategory === 'ALL' 
    ? menuItems 
    : menuItems.filter(i => i.category === selectedCategory);

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-shift-gray text-center max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-shift-blue">Start Tab</h2>
          <p className="text-gray-500 mb-8">Select a table to begin a new order.</p>
          
          <div className="grid grid-cols-3 gap-4">
            {tables.map(table => (
              <button
                key={table.id}
                disabled={table.status === TableStatus.OCCUPIED}
                onClick={() => createOrder(table.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  table.status === TableStatus.OCCUPIED 
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-shift-blue bg-blue-50 text-shift-blue hover:bg-shift-blue hover:text-white font-bold'
                }`}
              >
                {table.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6 overflow-hidden">
      {/* Menu Grid */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['ALL', 'FOOD', 'DRINK'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${
                selectedCategory === cat 
                  ? 'bg-shift-dark text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToOrder(item)}
              className={`${item.color} h-32 rounded-2xl p-4 flex flex-col justify-between items-start text-left transition-transform active:scale-95 hover:opacity-90 shadow-sm border-2 border-black/5`}
            >
              <span className="font-bold text-lg leading-tight text-shift-dark bg-white/80 px-2 py-1 rounded">{item.name}</span>
              <span className="bg-white/90 px-2 py-1 rounded-md font-mono font-bold text-shift-dark">${item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Order Sidebar */}
      <div className="w-full lg:w-96 bg-white border-l-2 border-gray-200 flex flex-col shadow-2xl rounded-l-2xl z-20">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
           <div className="flex justify-between items-center">
             <h3 className="font-bold text-xl">Order #{activeOrder.id.slice(-4)}</h3>
             <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">PENDING</span>
           </div>
           <p className="text-sm text-gray-500 mt-1">Table: {tables.find(t => t.id === activeOrder.tableId)?.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeOrder.items.map((item, idx) => (
            <div key={`${item.menuItemId}-${idx}`} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full font-mono text-sm font-bold">
                  {item.quantity}x
                </div>
                <div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <p className="font-bold font-mono">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          {activeOrder.items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
              <ChefHat size={48} />
              <p>No items yet</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="font-mono text-2xl text-shift-blue">${activeOrder.total.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => completeOrder(activeOrder.id)}
            disabled={activeOrder.items.length === 0}
            className="w-full py-4 bg-shift-blue text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <CreditCard size={20} />
            PAY & SEND TO KITCHEN
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;