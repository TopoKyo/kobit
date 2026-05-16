import { useState, useEffect, FormEvent } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Shield, Mail, Calendar, Building2, MessageSquare, Info, ChevronRight, Lock, Layout, Briefcase, Plus, X, Trash2, Edit2, Video, Image as ImageIcon, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  area: string;
  message: string;
  createdAt: any;
}

interface PortfolioItem {
  id: string;
  title: string;
  videoUrl?: string;
  photos?: string[];
  testimonial?: string;
  testimonialAuthor?: string;
  challenge: string;
  solution: string;
  impact: string;
  createdAt: any;
  updatedAt: any;
}

export const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'portfolio'>('requests');
  
  // Portfolio States
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    videoUrl: '',
    photos: '', // Will split by comma or newline
    testimonial: '',
    testimonialAuthor: '',
    challenge: '',
    solution: '',
    impact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Logged in user:", currentUser.email, currentUser.uid);
        try {
          // Check if bootstrapped admin first to avoid permission issues before doc exists
          if (currentUser.email === 'chinchuarchibo@gmail.com') {
            setIsAdmin(true);
            try {
              const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
              if (!adminDoc.exists()) {
                await setDoc(doc(db, 'admins', currentUser.uid), { 
                  email: currentUser.email,
                  bootstrapped: true,
                  createdAt: new Date().toISOString()
                });
              }
            } catch (e) {
              console.warn("Could not sync bootstrapped admin to Firestore:", e);
            }
          } else {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          }
        } catch (error: any) {
          console.error("Error checking admin status:", error);
          setError("Error al verificar permisos: " + (error.message || "Unknown error"));
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

  useEffect(() => {
    if (isAdmin && activeTab === 'portfolio') {
      const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PortfolioItem[];
        setPortfolioItems(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'portfolio');
      });

      return () => unsubscribe();
    }
  }, [isAdmin, activeTab]);

  const handleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Optional: Force account selection
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Error al iniciar sesión");
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

  const handleSavePortfolio = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setError(null);

    const photosArray = portfolioForm.photos
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const data = {
      title: portfolioForm.title,
      videoUrl: portfolioForm.videoUrl || null,
      photos: photosArray,
      testimonial: portfolioForm.testimonial || null,
      testimonialAuthor: portfolioForm.testimonialAuthor || null,
      challenge: portfolioForm.challenge,
      solution: portfolioForm.solution,
      impact: portfolioForm.impact,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingPortfolio) {
        await updateDoc(doc(db, 'portfolio', editingPortfolio.id), data);
      } else {
        await addDoc(collection(db, 'portfolio'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsAddingPortfolio(false);
      setEditingPortfolio(null);
      setPortfolioForm({
        title: '',
        videoUrl: '',
        photos: '',
        testimonial: '',
        testimonialAuthor: '',
        challenge: '',
        solution: '',
        impact: ''
      });
    } catch (err: any) {
      console.error("Error saving portfolio item:", err);
      setError("Error al guardar el caso de portafolio");
      handleFirestoreError(err, editingPortfolio ? OperationType.UPDATE : OperationType.CREATE, 'portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditPortfolio = (item: PortfolioItem) => {
    setEditingPortfolio(item);
    setPortfolioForm({
      title: item.title,
      videoUrl: item.videoUrl || '',
      photos: item.photos?.join('\n') || '',
      testimonial: item.testimonial || '',
      testimonialAuthor: item.testimonialAuthor || '',
      challenge: item.challenge,
      solution: item.solution,
      impact: item.impact
    });
    setIsAddingPortfolio(true);
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este caso?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
    } catch (err) {
      console.error("Error deleting portfolio:", err);
      setError("No se pudo eliminar el caso");
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
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-xs text-left">
              <strong>Error de Login:</strong> {error}
            </div>
          )}

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
          <p className="text-gray-400">Tu cuenta ({user.email}) no tiene permisos de administrador o no ha verificado su correo electrónico.</p>
          {!user.emailVerified && (
            <div className="p-4 bg-brand-orange/10 border border-brand-orange/30 rounded-xl text-brand-orange text-sm">
              Tu correo electrónico no está verificado. Por favor, verifica tu cuenta de Google.
            </div>
          )}
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
            <h1 className="text-4xl font-bold font-display">
              {activeTab === 'requests' ? 'Dashboard de Contactos' : 'Gestión de Portafolio'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mr-4">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'requests' ? 'bg-brand-orange text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Mail className="w-4 h-4" /> Consultas
              </button>
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'portfolio' ? 'bg-brand-orange text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Briefcase className="w-4 h-4" /> Portafolio
              </button>
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
          </div>
        </header>

        {activeTab === 'requests' ? (
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
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-orange" />
                Casos de Éxito ({portfolioItems.length})
              </h2>
              <button 
                onClick={() => {
                  setIsAddingPortfolio(true);
                  setEditingPortfolio(null);
                  setPortfolioForm({
                    title: '',
                    videoUrl: '',
                    photos: '',
                    testimonial: '',
                    testimonialAuthor: '',
                    challenge: '',
                    solution: '',
                    impact: ''
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" /> Nuevo Caso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="glass-panel p-8 rounded-3xl border-white/5 hover:border-brand-orange/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-black transition-all">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditPortfolio(item)} className="p-2 hover:text-brand-orange transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePortfolio(item.id)} className="p-2 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium italic truncate">
                      {item.videoUrl && <Video className="w-3 h-3" />}
                      {item.photos?.length ? <ImageIcon className="w-3 h-3" /> : null}
                      {item.testimonial && <MessageSquare className="w-3 h-3" />}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {item.challenge}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                    </span>
                    <div className="text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
                      Caso Activo
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isAddingPortfolio && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-4xl p-10 my-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <h2 className="text-2xl font-bold font-display">
                      {editingPortfolio ? 'Editar Caso de Portafolio' : 'Nuevo Caso de Portafolio'}
                    </h2>
                    <button onClick={() => setIsAddingPortfolio(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePortfolio} className="space-y-10 relative z-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Basics */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Título del Proyecto</label>
                          <input 
                            required
                            value={portfolioForm.title}
                            onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="Ej: Automatización de Inventarios Retail"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">URL del Video (Youtube/Vimeo)</label>
                          <div className="relative">
                            <Video className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                            <input 
                              value={portfolioForm.videoUrl}
                              onChange={(e) => setPortfolioForm({...portfolioForm, videoUrl: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-brand-orange/50 outline-none transition-all font-mono text-xs"
                              placeholder="https://youtu.be/..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">URLs de Fotos (Una por línea)</label>
                          <textarea 
                            value={portfolioForm.photos}
                            onChange={(e) => setPortfolioForm({...portfolioForm, photos: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all font-mono text-xs h-32 resize-none"
                            placeholder="https://image1.jpg&#10;https://image2.jpg"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                            <Target className="w-3 h-3" /> Desadío Operativo
                          </label>
                          <textarea 
                            required
                            value={portfolioForm.challenge}
                            onChange={(e) => setPortfolioForm({...portfolioForm, challenge: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all min-h-[100px] h-[100px]"
                            placeholder="¿Cuál era el problema principal?"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" /> La Solución
                          </label>
                          <textarea 
                            required
                            value={portfolioForm.solution}
                            onChange={(e) => setPortfolioForm({...portfolioForm, solution: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all min-h-[100px] h-[100px]"
                            placeholder="¿Qué tecnología implementamos?"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> Impacto Final
                          </label>
                          <textarea 
                            required
                            value={portfolioForm.impact}
                            onChange={(e) => setPortfolioForm({...portfolioForm, impact: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all min-h-[100px] h-[100px]"
                            placeholder="¿Qué resultados medibles obtuvimos?"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Testimonio del Cliente</label>
                          <textarea 
                            value={portfolioForm.testimonial}
                            onChange={(e) => setPortfolioForm({...portfolioForm, testimonial: e.target.value})}
                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all h-24 italic"
                            placeholder="&quot;Kobit transformó nuestra empresa...&quot;"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Autor del Testimonio</label>
                          <input 
                            value={portfolioForm.testimonialAuthor}
                            onChange={(e) => setPortfolioForm({...portfolioForm, testimonialAuthor: e.target.value})}
                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="Nombre, Cargo en la empresa"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-10">
                      <button 
                        type="button"
                        onClick={() => setIsAddingPortfolio(false)}
                        className="px-8 py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-brand-orange text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Guardando...' : (editingPortfolio ? 'Actualizar Caso' : 'Publicar Caso')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
