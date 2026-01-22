import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, CreditCard } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export function CartDrawer() {
  const { isCartOpen, closeCart, cart, removeFromCart, cartTotal } = useShop();
  const navigate = useNavigate();

  // Si está cerrado, no renderizamos nada (o podríamos usar CSS para animar)
  if (!isCartOpen) return null;

  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  });

  const handleCheckout = () => {
    closeCart();
    // Aquí podríamos ir a un checkout global, o manejarlo producto por producto.
    // Para MVP, si hay 1 solo item, vamos directo a su checkout.
    if (cart.length === 1) {
        navigate(`/checkout/${cart[0].id}`);
    } else {
        // Si hay varios, idealmente iríamos a una página /resumen-compra
        // Por ahora, simulamos ir al primero o crearemos esa página luego.
        alert("Checkout multiproducto en construcción. Redirigiendo al primer item.");
        navigate(`/checkout/${cart[0].id}`);
    }
  };

  return (
    <div className="relative z-[60]">
      {/* 1. BACKDROP (Fondo oscuro) */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* 2. PANEL DESLIZANTE */}
      <div className="fixed inset-y-0 right-0 z-[70] flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800">
          
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="text-emerald-500" /> Tu Carrito
            </h2>
            <button 
              onClick={closeCart}
              className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* LISTA DE PRODUCTOS */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <ShoppingBag size={64} className="text-slate-300" />
                <p className="text-lg font-medium text-slate-900 dark:text-white">El carrito está vacío</p>
                <p className="text-sm text-slate-500">¡Explora la Academia para sumar conocimiento!</p>
                <button 
                  onClick={closeCart}
                  className="mt-4 text-emerald-600 font-bold hover:underline"
                >
                  Volver a la tienda
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.map((product) => (
                  <li key={product.id} className="flex py-2">
                    {/* Imagen */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    {/* Info */}
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900 dark:text-white">
                          <h3 className="line-clamp-2 leading-tight pr-4">
                            {product.title}
                          </h3>
                          <p className="ml-4 whitespace-nowrap">
                            {formatoDinero.format(product.discountPrice ?? product.price)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{product.type}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-slate-500">Cant: {product.quantity}</p>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="font-medium text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* FOOTER (Totales y Checkout) */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-6 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex justify-between text-base font-medium text-slate-900 dark:text-white mb-4">
                <p>Subtotal</p>
                <p>{formatoDinero.format(cartTotal)}</p>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 mb-6">
                Impuestos y envío calculados al finalizar la compra.
              </p>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-transparent bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                <CreditCard size={20} /> Finalizar Compra
              </button>
              <div className="mt-6 flex justify-center text-center text-xs text-slate-500">
                <button
                  type="button"
                  className="font-medium text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
                  onClick={closeCart}
                >
                  O continuar comprando
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}