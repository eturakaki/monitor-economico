import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'; // Agregamos Link y useLocation
import { products } from '../data/products';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); // <--- Necesario para recordar dónde volver después del login
  const { user } = useAuth();
  
  const product = products.find(p => p.id === id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) navigate('/academia');
  }, [product, navigate]);

  if (!product) return null;

  const formatoDinero = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      alert(`¡Pago exitoso! Has comprado: ${product.title}`);
      setLoading(false);
      navigate('/dashboard'); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
          <ArrowLeft size={20} /> Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: EL PRODUCTO (Visible siempre) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tu Pedido</h1>
              
              <div className="flex gap-4 items-start">
                <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{product.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{product.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-emerald-600 font-bold text-lg">
                        {formatoDinero.format(product.discountPrice ?? product.price)}
                    </span>
                    {product.discountPrice && (
                        <span className="text-sm text-slate-400 line-through">
                            {formatoDinero.format(product.price)}
                        </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: EL MURO DE PAGO */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl sticky top-24">
              
              {/* === LÓGICA DE PROTECCIÓN === */}
              {user ? (
                // OPCIÓN A: SI ESTÁ LOGUEADO -> PAGA
                <>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Detalle Final</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>{formatoDinero.format(product.discountPrice ?? product.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Impuestos</span>
                      <span className="text-slate-400">Incluidos</span>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                      <span>A Pagar</span>
                      <span>{formatoDinero.format(product.discountPrice ?? product.price)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : (
                      <>
                        <CreditCard size={18} /> Confirmar Pago
                      </>
                    )}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={14} /> Transacción segura SSL
                  </div>
                </>
              ) : (
                // OPCIÓN B: NO ESTÁ LOGUEADO -> BLOQUEO
                <div className="text-center py-2">
                   <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
                      <Lock size={24} />
                   </div>
                   <h3 className="font-bold text-slate-900 dark:text-white mb-2">Identifícate para comprar</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      Necesitamos tu cuenta para asignarte el acceso al curso/libro inmediatamente.
                   </p>

                   <div className="space-y-3">
                      {/* BOTÓN LOGIN: Enviamos 'state' para que Login sepa volver AQUÍ */}
                      <Link 
                        to="/login" 
                        state={{ from: location }} 
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                         <LogIn size={18} /> Iniciar Sesión
                      </Link>

                      <Link 
                        to="/register" 
                        state={{ from: location }}
                        className="w-full py-2.5 flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                         <UserPlus size={18} /> Crear Cuenta
                      </Link>
                   </div>
                </div>
              )}
              {/* =========================== */}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}