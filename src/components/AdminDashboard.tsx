import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { LogOut, Shield, Mail, Calendar, Building2, MessageSquare, Info, ChevronRight, Lock } from 'lucide-react';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  area: string;
  message: string;
  createdAt: any;
}

export const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if admin doc exists or if it's the bootstrapped admin
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDoc.exists() || currentUser.email === 'chinchuarchibo@gmail.com') {
            setIsAdmin(true);
            // If bootstrapped but no doc, create the doc for easier lookup later
            if (!adminDoc.exists() && currentUser.email === 'chinchuarchibo@gmail.com') {
              await setDoc(doc(db, 'admins', currentUser.uid), { email: currentUser.email });
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'contactRequests'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ContactRequest[];
        setRequests(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contactRequests');
      });

      return () => unsubscribe();
    }
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-10 rounded-3xl text-center space-y-8">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto border border-brand-orange/20">
            <Lock className="w-10 h-10 text-brand-orange" />
          </div>
          <h1 className="text-3xl font-bold font-display">Acceso Restringido</h1>
          <p className="text-gray-400">Panel de administración privado para Kobit Soluciones Tecnológicas.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-brand-orange text-black font-black uppercase text-xs tracking-widest hover:shadow-[0_0_30px_rgba(255,106,0,0.3)] transition-all transform hover:-translate-y-1"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-10 rounded-3xl text-center space-y-6">
          <Shield className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Sin Permisos</h1>
          <p className="text-gray-400">Tu cuenta ({user.email}) no tiene permisos de administrador.</p>
          <button 
            onClick={handleLogout}
            className="text-brand-orange font-bold hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-brand-orange w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Admin Control Panel</span>
            </div>
            <h1 className="text-4xl font-bold font-display">Dashboard de Contactos</h1>
          </div>
          <div className="flex items-center gap-6 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user.displayName || 'Admin'}</div>
              <div className="text-[10px] text-gray-500">{user.email}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all border border-white/10"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              Solicitudes Recientes ({requests.length})
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {requests.length === 0 ? (
                <div className="glass-panel p-10 text-center rounded-2xl text-gray-500 text-sm italic">
                  No hay solicitudes registradas aún.
                </div>
              ) : (
                requests.map((req) => (
                  <button 
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full text-left p-6 rounded-2xl transition-all border ${
                      selectedRequest?.id === req.id 
                      ? 'bg-brand-orange/10 border-brand-orange/50 shadow-[0_0_20px_rgba(255,106,0,0.1)]' 
                      : 'glass-panel border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedRequest?.id === req.id ? 'rotate-90 text-brand-orange' : 'text-gray-600'}`} />
                    </div>
                    <div className="font-bold text-lg tracking-tight mb-1 truncate">{req.name}</div>
                    <div className="text-xs text-gray-400 font-medium truncate">{req.company}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
              {selectedRequest ? (
                <div 
                  className="glass-panel p-10 md:p-14 rounded-3xl border-brand-orange/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-[60px] rounded-full" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 tracking-tight">{selectedRequest.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-brand-orange" />
                           {selectedRequest.createdAt?.toDate ? selectedRequest.createdAt.toDate().toLocaleString() : 'Fecha no disponible'}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-brand-orange text-[10px] font-black uppercase tracking-widest">
                      {selectedRequest.area}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 mb-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                          <Mail className="w-3 h-3" /> Email de contacto
                        </label>
                        <a href={`mailto:${selectedRequest.email}`} className="block text-lg font-bold text-white hover:text-brand-orange transition-colors">
                          {selectedRequest.email}
                        </a>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                          <Building2 className="w-3 h-3" /> Empresa
                        </label>
                        <div className="text-lg font-bold text-white">{selectedRequest.company}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-10 border-t border-white/5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Mensaje / Requerimiento
                    </label>
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/5 text-gray-300 leading-relaxed text-lg whitespace-pre-wrap italic">
                      "{selectedRequest.message}"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] glass-panel border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-10 space-y-6">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <Info className="w-10 h-10 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Selecciona una solicitud</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Selecciona un contacto de la lista lateral para ver los detalles completos y procesar el requerimiento.</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
