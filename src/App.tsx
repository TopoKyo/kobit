/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, lazy, Suspense } from 'react';
import { 
  Search, 
  BarChart3, 
  Lightbulb, 
  Rocket, 
  GraduationCap, 
  Users, 
  Package, 
  Database, 
  Cpu, 
  Code2, 
  Globe, 
  Settings, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  Fingerprint,
  QrCode,
  FileBarChart,
  Brain,
  Check,
  Loader2,
  Lock,
  ArrowUpRight,
  Video,
  Image as ImageIcon,
  Quote,
  Target,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { AdminDashboard } from './components/AdminDashboard';

// --- Types ---

interface PortfolioCase {
  id: string;
  title: string;
  videoUrl?: string;
  photos?: string[];
  testimonial?: string;
  testimonialAuthor?: string;
  challenge: string;
  solution: string;
  impact: string;
}

// --- Components ---

const Modal = ({ isOpen, onClose, title, subtitle, content, methodology }: { isOpen: boolean, onClose: () => void, title: string, subtitle?: string, content: string, methodology: string[] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-orange/5 blur-[80px] rounded-full pointer-events-none" />
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange hover:text-black transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-4">{subtitle || 'Detalles del Servicio'}</h3>
              <h2 className="text-3xl font-bold font-display mb-8">{title}</h2>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">¿Qué es?</h4>
                  <p className="text-gray-400 text-lg leading-relaxed">{content}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Nuestra Metodología</h4>
                  <div className="grid gap-4">
                    {methodology.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-brand-orange/20 transition-all">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-[10px] font-bold text-brand-orange shrink-0">
                          0{idx + 1}
                        </div>
                        <p className="text-sm text-gray-300 font-medium leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <a 
                  href="#contact"
                  onClick={onClose}
                  className="px-8 py-4 bg-brand-orange text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                >
                  Consultar sobre este servicio <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PortfolioModal = ({ isOpen, onClose, caseItem }: { isOpen: boolean, onClose: () => void, caseItem: PortfolioCase | null }) => {
  if (!caseItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-0 overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="fixed top-12 right-12 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange hover:text-black transition-all z-50 backdrop-blur-xl"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-10 md:p-20">
              <div className="max-w-3xl">
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                  Caso de Éxito
                </h3>
                <h2 className="text-4xl md:text-6xl font-bold font-display mb-12 leading-tight tracking-tight">{caseItem.title}</h2>
              </div>

              {/* Multimedia Section */}
              {(caseItem.videoUrl || (caseItem.photos && caseItem.photos.length > 0)) && (
                <div className="mb-20 space-y-12">
                   {caseItem.videoUrl && (
                     <div className="aspect-video w-full rounded-3xl overflow-hidden glass-panel border-white/5 shadow-2xl group relative text-center">
                       <iframe 
                         src={caseItem.videoUrl.replace('watch?v=', 'embed/').split('&')[0]} 
                         className="w-full h-full"
                         allowFullScreen
                         frameBorder="0"
                       />
                     </div>
                   )}

                   {caseItem.photos && caseItem.photos.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {caseItem.photos.map((photo, i) => (
                         <div key={i} className="aspect-[4/3] rounded-[2rem] overflow-hidden glass-panel border-white/5 hover:border-brand-orange/20 transition-all">
                           <img src={photo} alt={`${caseItem.title} - ${i+1}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" referrerPolicy="no-referrer" />
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              )}

              {/* Textual Content */}
              <div className="grid md:grid-cols-3 gap-16 md:gap-20">
                <div className="space-y-12">
                   <div className="space-y-4">
                     <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
                       <Target className="w-4 h-4" /> Desafío
                     </h4>
                     <p className="text-gray-400 text-lg leading-relaxed">{caseItem.challenge}</p>
                   </div>
                   <div className="space-y-4">
                     <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
                       <Lightbulb className="w-4 h-4" /> Solución
                     </h4>
                     <p className="text-gray-400 text-lg leading-relaxed">{caseItem.solution}</p>
                   </div>
                   <div className="space-y-4">
                     <h4 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
                       <TrendingUp className="w-4 h-4" /> Impacto
                     </h4>
                     <p className="text-white text-2xl font-bold tracking-tight">{caseItem.impact}</p>
                   </div>
                </div>

                {/* Testimonial Section */}
                <div className="md:col-span-2">
                  {caseItem.testimonial && (
                    <div className="bg-brand-orange/5 border border-brand-orange/20 p-10 md:p-16 rounded-[3rem] relative overflow-hidden">
                      <Quote className="absolute top-10 left-10 w-20 h-20 text-brand-orange/10 -rotate-12" />
                      <div className="relative z-10">
                        <p className="text-2xl md:text-3xl font-display font-medium text-white mb-10 leading-relaxed italic">
                          "{caseItem.testimonial}"
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-orange/20 flex items-center justify-center">
                            <span className="text-brand-orange font-black">
                              {caseItem.testimonialAuthor?.[0] || 'K'}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-lg text-brand-orange">{caseItem.testimonialAuthor || 'Referente del Proyecto'}</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Testimonio del Cliente</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!caseItem.testimonial && (
                    <div className="h-full flex flex-col justify-center items-center text-center p-10 border-2 border-dashed border-white/5 rounded-[3rem]">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-brand-orange" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Transformación Exitosa</h4>
                      <p className="text-gray-500 max-w-xs mx-auto">Este proyecto demuestra nuestro compromiso con la excelencia operativa y la adopción digital real.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to action */}
              <div className="mt-24 pt-16 border-t border-white/5 text-center">
                <h3 className="text-3xl font-bold mb-8">¿Listo para ser nuestro próximo caso de éxito?</h3>
                <a 
                  href="#contact"
                  onClick={onClose}
                  className="inline-flex items-center gap-3 px-12 py-5 bg-brand-orange text-black font-black uppercase text-xs tracking-widest rounded-full hover:shadow-[0_0_50px_rgba(255,106,0,0.4)] transition-all transform hover:-translate-y-1"
                >
                  Agendar Diagnóstico Sin Costo
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Proceso', href: '#workflow' },
    { name: 'Soluciones', href: '#solutions' },
    { name: 'Ready Systems', href: '#ready-systems' },
    { name: 'Capacitación', href: '#training' },
    { name: 'Casos', href: '#cases' },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-black/90 backdrop-blur-md border-white/10 py-4' : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-bold text-black text-sm">K</div>
          <span className="text-xl font-bold tracking-tight">KOBIT <span className="text-brand-orange">SOLUCIONES</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-brand-orange text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-white transition-all transform hover:scale-105"
          >
            Agendar Diagnóstico
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-brand-black border-b border-white/10 py-6 px-10 flex flex-col gap-4 md:hidden">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-lg font-medium hover:text-brand-orange py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-brand-orange text-brand-black px-5 py-3 rounded-xl text-center font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Agendar Diagnóstico
          </a>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onSelectService }: { onSelectService: (service: any) => void }) => {
  const methodologySteps = [
    { 
      n: '01', 
      title: 'Visita y Análisis de Procesos',
      desc: 'Ingresamos a tu operación para entender cómo trabajas realmente, identificando ineficiencias que pasan desapercibidas.',
      methodology: [
        "Entrevistas con personal clave en terreno.",
        "Mapeo detallado de flujos de trabajo actuales.",
        "Detección de cuellos de botella y pérdidas de tiempo.",
        "Presentación de informe de diagnóstico situacional."
      ]
    },
    { 
      n: '02', 
      title: 'Diseño de Solución a Medida',
      desc: 'No vendemos software enlatado. Creamos una arquitectura tecnológica que resuelve tus problemas específicos.',
      methodology: [
        "Definición de arquitectura técnica personalizada.",
        "Selección de stack tecnológico óptimo.",
        "Diseño de experiencia de usuario (UX) centrada en el proceso.",
        "Validación de prototipos funcionales con el cliente."
      ]
    },
    { 
      n: '03', 
      title: 'Desarrollo e Implementación',
      desc: 'Construimos e integramos la solución en tu infraestructura actual, asegurando una transición suave y robusta.',
      methodology: [
        "Desarrollo modular con entregas semanales.",
        "Integración con sistemas y APIs existentes.",
        "Pruebas rigurosas de estrés y ciberseguridad.",
        "Despliegue controlado y puesta en marcha."
      ]
    },
    { 
      n: '04', 
      title: 'Capacitación y Adopción Digital',
      desc: 'Garantizamos que la tecnología sea utilizada. Acompañamos a tu equipo en el proceso de cambio cultural.',
      methodology: [
        "Talleres prácticos para todo el personal involucrado.",
        "Creación de guías interactivas y videotutoriales.",
        "Soporte técnico prioritario post-lanzamiento.",
        "Medición de eficiencia y KPIs de adopción digital."
      ]
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Atmospheric Accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-orange opacity-10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-brand-orange opacity-5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-12 gap-0 items-center w-full">
        <div
          className="col-span-12 lg:col-span-12 xl:col-span-7 pr-12 py-20"
        >
          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.2em] text-brand-orange font-bold mb-8">
            Diagnóstico • Tecnología • IA
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 font-display">
            Detectamos problemas <br/>
            <span className="text-gradient-hero">en tu empresa y los resolvemos con tecnología.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mb-10 leading-relaxed">
            Creamos sistemas, automatizamos procesos e integramos IA para optimizar tu negocio. No solo entregamos software: <span className="text-white font-semibold">transformamos tu operación empresarial.</span>
          </p>

          <div className="bg-white/5 border-l-4 border-brand-orange p-6 rounded-r-lg max-w-md mb-12">
            <p className="text-sm italic text-gray-300 leading-relaxed">
              "Nos aseguramos de que tu equipo domine cada herramienta implementada con capacitación continua y acompañamiento real."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#contact" 
              className="px-8 py-4 bg-brand-orange text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Solicitar Visita Técnica <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#workflow" 
              className="border border-white/20 hover:bg-white/5 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Nuestra Metodología
            </a>
          </div>
        </div>

        {/* Right Column Grid Style */}
        <div
          className="hidden xl:flex col-span-5 bg-white/5 border-l border-white/10 p-10 flex-col justify-between self-stretch h-full overflow-hidden relative"
        >
          <div className="bg-dot-pattern absolute inset-0 opacity-20 pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange mb-8">Nuestra Metodología</h3>
            <div className="space-y-6">
              {methodologySteps.map((step, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onSelectService(step)}
                  className="flex items-center gap-5 group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs transition-all duration-300 
                    ${idx === 3 ? 'border-brand-orange bg-brand-orange/10 text-brand-orange font-bold' : 'border-white/20 text-white/50 group-hover:border-brand-orange group-hover:text-white group-hover:bg-brand-orange/5'}`}>
                    {step.n}
                  </div>
                  <div className={`text-sm tracking-tight transition-colors ${idx === 3 ? 'font-bold text-white' : 'font-medium text-white/70 group-hover:text-white'}`}>{step.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12 bg-black/40 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Soluciones Estratégicas</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Gestión de Inventario',
                'IA & Automatización',
                'Páginas Web & E-commerce',
                'Marketing Digital & SEO',
                'Control de Personal',
                'Dashboards de Datos',
                'Ciberseguridad',
                'Consultoría IT'
              ].map((item) => (
                <div key={item} className="p-4 border border-white/5 rounded-xl bg-white/5 text-[11px] flex items-center gap-3 hover:border-brand-orange/30 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0"></div> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WorkflowSection = ({ onSelectService }: { onSelectService: (service: any) => void }) => {
  const steps = [
    { 
      n: '01', 
      title: 'Visita y Análisis', 
      desc: 'Ingresamos a tu operación para entender cómo trabajas realmente e identificar ineficiencias.',
      methodology: [
        "Entrevistas presenciales con operadores.",
        "Mapeo de procesos críticos de negocio.",
        "Identificación de fugas de capital y tiempo.",
        "Diagnóstico de infraestructura tecnológica."
      ]
    },
    { 
      n: '02', 
      title: 'Diseño Estratégico', 
      desc: 'Creamos una arquitectura tecnológica robusta que resuelve tus problemas específicos.',
      methodology: [
        "Arquitectura de software a medida.",
        "Diseño de interfaz UX optimizada.",
        "Planificación de escalabilidad futura.",
        "Definición de integraciones necesarias."
      ]
    },
    { 
      n: '03', 
      title: 'Desarrollo Ágil', 
      desc: 'Construimos e integramos la solución asegurando una transición suave y segura.',
      methodology: [
        "Desarrollo por sprints semanales.",
        "Control de calidad continuo (QA).",
        "Auditoría de seguridad en el código.",
        "Migración de datos legacy controlada."
      ]
    },
    { 
      n: '04', 
      title: 'Implementación', 
      desc: 'Desplegamos el sistema en tu entorno real con monitorización constante por expertos.',
      methodology: [
        "Capacitación técnica al equipo IT.",
        "Puesta en marcha en entornos reales.",
        "Monitorización activa de performance.",
        "Certificación de seguridad estructural."
      ]
    },
    { 
      n: '05', 
      title: 'Cultura Digital', 
      desc: 'Acompañamos a tu equipo hasta que dominen las herramientas y logren autonomía.',
      methodology: [
        "Talleres de cambio cultural digital.",
        "Soporte 24/7 post-implementación.",
        "Medición de retorno de inversión (ROI).",
        "Evolución continua del sistema."
      ]
    }
  ];

  return (
    <section id="workflow" className="py-32 bg-[#050505] relative overflow-hidden">
      <div className="bg-dot-pattern absolute inset-0 opacity-10" />
      <div className="max-w-7xl mx-auto px-10 relative z-10 text-center">
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6">Metodología Inmersiva</h3>
        <h2 className="text-4xl md:text-5xl font-bold mb-20 font-display leading-tight">
          Transformamos tu operación con un <span className="text-gradient-hero">plan estratégico.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {steps.map((step) => (
            <div
              key={step.n}
              onClick={() => onSelectService(step)}
              className="group cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-sm font-mono mb-8 group-hover:border-brand-orange group-hover:bg-brand-orange/5 transition-all duration-300">
                    {step.n}
                  </div>
                  <div className="absolute top-0 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-brand-orange" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-4 group-hover:text-brand-orange transition-colors">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SolutionsSection = ({ onSelectService }: { onSelectService: (service: any) => void }) => {
  const solutions = [
    {
      title: "Gestión Operativa",
      icon: Users,
      items: ["Control de asistencia y turnos", "Registro de tareas diarias", "Reportes de desempeño TV"],
      desc: "Digitalizamos cada aspecto de tu operación diaria para eliminar el papel y los errores humanos. Desde el control de personal hasta la eficiencia en tiempo real.",
      methodology: [
        "Auditoría presencial de flujos operativos actuales.",
        "Mapeo de cuellos de botella y puntos de fricción.",
        "Implementación de dashboard centralizado.",
        "Entrenamiento personalizado por área de trabajo."
      ]
    },
    {
      title: "Inventario y Stock",
      icon: Package,
      items: ["Trazabilidad completa", "Alertas de stock automático", "Optimización de almacenes"],
      desc: "Sistemas inteligentes que te permiten saber exactamente qué tienes, dónde está y cuánto vale en cada momento.",
      methodology: [
        "Etiquetado inteligente y configuración de almacenes.",
        "Integración con lecturas móviles (QR/Barra).",
        "Configuración de algoritmos de re-compra automática.",
        "Capacitación en control de mermas y auditoría."
      ]
    },
    {
      title: "Inteligencia Artificial",
      icon: Cpu,
      items: ["Análisis predictivo", "Automatización de documentos", "Asistentes virtuales"],
      desc: "Implementamos modelos de IA que no solo analizan datos, sino que ejecutan acciones para optimizar tu tiempo.",
      methodology: [
        "Identificación de datos estructurados e históricos.",
        "Entrenamiento de modelos específicos para tu industria.",
        "Integración de agentes inteligentes en tus canales actuales.",
        "Monitorización y re-ajuste de precisión continua."
      ]
    },
    {
      title: "Software a Medida",
      icon: Code2,
      items: ["Plataformas escalables", "Aplicaciones progresivas", "Sistemas ERP/CRM"],
      desc: "Desarrollamos soluciones que se adaptan a tu negocio, no al revés. Escalabilidad y robustez garantizada.",
      methodology: [
        "Definición técnica de requerimientos y stack.",
        "Diseño de arquitectura escalable.",
        "Desarrollo ágil con entregas incrementales.",
        "Garantía de rendimiento y seguridad total."
      ]
    },
    {
      title: "Desarrollo Web",
      icon: Globe,
      items: ["Páginas web corporativas", "E-commerce & Tiendas online", "Landing pages de conversión"],
      desc: "Tu presencia digital debe ser una máquina de ventas. Diseñamos con un enfoque radical en la conversión.",
      methodology: [
        "Análisis de público objetivo y competencia.",
        "Diseño de experiencia de usuario (UX) persuasiva.",
        "Desarrollo optimizado para velocidad y móviles.",
        "Integración de pasarelas de pago y CRM."
      ]
    },
    {
      title: "Marketing & SEO",
      icon: Search,
      items: ["Posicionamiento Web (SEO)", "Google Ads & Social Media", "Estrategia de contenidos"],
      desc: "Atraemos a los clientes correctos mediante estrategias basadas en datos y posicionamiento orgánico real.",
      methodology: [
        "Auditoría técnica de SEO y palabras clave.",
        "Configuración de campañas de alta conversión.",
        "Creación de contenido estratégico y relevante.",
        "Análisis de ROI y optimización de presupuesto."
      ]
    },
    {
      title: "Análisis de Datos",
      icon: BarChart3,
      items: ["Dashboards personalizados", "Business Intelligence", "Visualización de Kpis"],
      desc: "Transformamos números fríos en decisiones estratégicas visuales que cualquier líder puede entender.",
      methodology: [
        "Limpieza y normalización de fuentes de datos.",
        "Creación de métricas de rendimiento (KPIs).",
        "Diseño de interfaz de visualización interactiva.",
        "Taller de toma de decisiones basadas en datos."
      ]
    },
    {
      title: "Ciberseguridad",
      icon: ShieldCheck,
      items: ["Auditorías de seguridad", "Protección de datos sensitivos", "Consultoría de riesgos IT"],
      desc: "Blindamos tu activo más valioso: la información. Protegemos tu empresa de amenazas externas e internas.",
      methodology: [
        "Evaluación de vulnerabilidades en infraestructura.",
        "Implementación de protocolos de cifrado y backup.",
        "Políticas de acceso y gestión de identidades.",
        "Plan de respuesta ante incidentes y desastres."
      ]
    }
  ];

  return (
    <section id="solutions" className="py-32">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6">Expertise</h3>
            <h2 className="text-4xl md:text-6xl font-bold font-display leading-[1.1]">Soluciones <span className="text-gradient-hero">que escalan.</span></h2>
          </div>
          <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
            Eliminamos la fricción tecnológica creando herramientas que hablan el mismo idioma que tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {solutions.map((sol) => (
            <div 
              key={sol.title} 
              onClick={() => onSelectService(sol)}
              className="p-8 glass-panel rounded-lg hover:border-brand-orange/30 transition-all flex flex-col group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-brand-orange" />
              </div>
              <div className="w-10 h-10 border border-white/10 rounded flex items-center justify-center mb-10 group-hover:bg-brand-orange group-hover:text-black transition-all">
                <sol.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-6">{sol.title}</h3>
              <ul className="space-y-4 mt-auto">
                {sol.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs text-gray-400 font-medium tracking-tight">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ReadySystemsSection = ({ onSelectService }: { onSelectService: (service: any) => void }) => {
  const systems = [
    {
      title: "Asistencia Biométrica",
      icon: Fingerprint,
      desc: "Control mediante reconocimiento facial o huella con registro automático y reportes en tiempo real.",
      features: ["Reducción de fraude", "Integración con nómina", "Alertas de atrasos"],
      methodology: [
        "Instalación de hardware biométrico certificado.",
        "Sincronización con base de datos de empleados.",
        "Configuración de alertas por SMS/WhatsApp.",
        "Inducción al personal sobre el nuevo marcaje."
      ]
    },
    {
      title: "Bodega con QR",
      icon: QrCode,
      desc: "Control de inventario ágil mediante escaneo móvil. Trazabilidad completa de stock y movimientos.",
      features: ["Escaneo móvil", "Alertas de stock", "Reportes de mermas"],
      methodology: [
        "Generación sistemática de códigos QR por producto.",
        "Configuración de la App móvil de bodega.",
        "Establecimiento de umbrales críticos de stock.",
        "Planificación de inventarios rotativos digitales."
      ]
    },
    {
      title: "Informes con IA",
      icon: FileBarChart,
      desc: "Generación automática de informes con análisis inteligente de patrones para apoyo en toma de decisiones.",
      features: ["Análisis predictivo", "Dashboards automáticos", "Detección de anomalías"],
      methodology: [
        "Unificación de canales de datos.",
        "Programación de cronjobs de análisis.",
        "Diseño de interfaz de reportes interactiva.",
        "Envío automatizado de resúmenes gerenciales."
      ]
    },
    {
      title: "Medición de Soft Skills",
      icon: Brain,
      desc: "Evaluación continua de habilidades blandas y desempeño para potenciar el talento de tu equipo.",
      features: ["Métricas de comunicación", "Seguimiento de productividad", "Informes individuales"],
      methodology: [
        "Diseño de encuestas y evaluaciones dinámicas.",
        "Seteo de parámetros de evaluación continua.",
        "Generación de reportes de clima y feedback.",
        "Sesiones de coaching basadas en resultados."
      ]
    }
  ];

  return (
    <section id="ready-systems" className="py-32 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-orange/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        <div className="text-center mb-20">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6 text-center">Fast Implementation</h3>
          <h2 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-8">Sistemas <span className="text-gradient-hero">listos para implementar.</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Contamos con soluciones probadas que podemos poner en marcha rápidamente en tu empresa, adaptándolas a tus flujos específicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systems.map((sys, idx) => (
            <div 
              key={sys.title}
              onClick={() => onSelectService(sys)}
              className="p-10 glass-panel rounded-3xl group hover:border-brand-orange/30 transition-all flex flex-col md:flex-row gap-8 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-brand-orange" />
              </div>
              <div className="w-20 h-20 shrink-0 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-orange group-hover:text-black transition-all duration-500">
                <sys.icon className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{sys.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{sys.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {sys.features.map(f => (
                    <span key={f} className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-white/5 border border-white/5 rounded-full text-gray-500">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-brand-orange text-sm font-bold uppercase tracking-widest italic flex items-center justify-center gap-3">
            <span className="w-12 h-[1px] bg-brand-orange/30"></span> 
            Implementación en tiempo récord 
            <span className="w-12 h-[1px] bg-brand-orange/30"></span>
          </p>
        </div>
      </div>
    </section>
  );
};

const TrainingSection = () => {
  return (
    <section id="training" className="py-32 bg-black border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-orange/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="w-14 h-14 rounded-xl bg-brand-orange text-black flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(255,106,0,0.3)]">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6">Diferenciador Clave</h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 font-display leading-tight">Acompañamiento y <br/><span className="text-gradient-hero">Capacitación Real.</span></h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed font-medium">
            El software solo es valioso si se utiliza correctamente. Nos quedamos hasta que cada miembro de tu equipo domine la herramienta y optimice su flujo de trabajo.
          </p>
          
          <div className="space-y-8">
            {[
              { title: "Entrenamiento práctico", desc: "Sesiones directo con los empleados sobre los procesos reales de la empresa." },
              { title: "Acompañamiento en la adopción", desc: "Monitorizamos el uso inicial para corregir dudas y ajustar flujos." },
              { title: "Mejora Continua", desc: "Optimizamos el sistema basándonos en el feedback real del equipo operativo." }
            ].map((item) => (
              <div key={item.title} className="flex gap-5">
                <div className="mt-1 shrink-0">
                  <CheckCircle2 className="text-brand-orange w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 tracking-tight text-white">{item.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
           <div className="aspect-video glass-panel rounded-3xl p-10 flex flex-col justify-center gap-12 overflow-hidden relative">
              <div className="bg-dot-pattern absolute inset-0 opacity-10 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  <span className="text-gray-500">Adopción Operativa</span>
                  <span className="text-brand-orange">98% Completado</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,106,0,0.5)]"
                  />
                </div>
              </div>
              
              <div className="relative z-10 grid grid-cols-3 gap-6">
                {[
                  { label: "Usuarios", val: "120+" },
                  { label: "Errores", val: "-92%" },
                  { label: "Rating", val: "4.9/5" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-6 bg-black/40 rounded-xl border border-white/5">
                    <div className="text-3xl font-bold text-white tracking-tighter mb-1">{stat.val}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
           </div>
           
           {/* Floating badges */}
           <div 
             className="absolute -top-6 -right-6 p-4 bg-black border border-brand-orange/40 rounded-xl glow-orange z-20"
           >
              <div className="flex items-center gap-3">
                <Settings className="text-brand-orange w-4 h-4 animate-spin-slow" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">System Optimized</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

const CaseStudy = ({ cases, onSelect }: { cases: PortfolioCase[], onSelect: (c: PortfolioCase) => void }) => {
  const defaultCases = [
    {
      id: 'default-1',
      title: "Logística Inteligente",
      challenge: "Empresa de logística sin control operativo y fugas de información.",
      solution: "Sistema de gestión + capacitación presencial del personal en terreno.",
      impact: "Reducción de errores administrativos en un 80% en 3 meses."
    },
    {
      id: 'default-2',
      title: "Optimización de Almacén",
      challenge: "Almacén con inventario desordenado y productos vencidos.",
      solution: "Software de trazabilidad + alertas automáticas con IA predictiva.",
      impact: "Ahorro de $15k mensuales en mermas y productos vencidos."
    },
    {
      id: 'default-3',
      title: "Automatización Comercial",
      challenge: "Procesos manuales en ventas y carga lenta de pedidos.",
      solution: "Automatización con IA para carga de pedidos y bitácora digital.",
      impact: "Duplicación de capacidad de carga sin contratar personal extra."
    }
  ];

  const displayCases = cases.length > 0 ? cases : defaultCases as PortfolioCase[];

  return (
    <section id="cases" className="py-32">
      <div className="max-w-7xl mx-auto px-10">
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6 text-center">Resultados Comprobados</h3>
        <h2 className="text-4xl md:text-5xl font-bold mb-20 font-display text-center leading-tight">Transformaciones <span className="text-gradient-hero">Reales.</span></h2>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {displayCases.map((cs, idx) => (
            <div 
              key={cs.id}
              onClick={() => onSelect(cs)}
              className="p-10 glass-panel rounded-2xl flex flex-col justify-between group cursor-pointer hover:border-brand-orange/30 transition-all hover:translate-y-[-4px]"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caso de Éxito #0{idx+1}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {cs.videoUrl && <Video className="w-3 h-3 text-brand-orange" />}
                  {cs.photos && cs.photos.length > 0 && <ImageIcon className="w-3 h-3 text-brand-orange" />}
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-brand-orange transition-colors">{cs.title}</h3>
                  <h4 className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.2em] mb-4">Desafío Operativo</h4>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{cs.challenge}</p>
                </div>
                <div className="pt-8 border-t border-white/5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Impacto Final</div>
                  <p className="text-lg font-bold text-white tracking-tight">{cs.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ValueProp = () => {
  const props = [
    { title: "Personalización Total", desc: "No usamos plantillas. Construimos lo que tu negocio necesita.", icon: ShieldCheck },
    { title: "Enfoque en Adopción", desc: "Priorizamos que tu equipo ame la herramienta tanto como nosotros.", icon: Users },
    { title: "IA de Última Generación", desc: "Automatizamos lo repetitivo para que enfoques en lo estratégico.", icon: Zap },
    { title: "Control Absoluto", desc: "Dashboards que te muestran la salud de tu empresa en un vistazo.", icon: TrendingUp }
  ];

  return (
    <section className="py-32 bg-brand-orange text-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        <h2 className="text-4xl md:text-7xl font-black mb-20 font-display tracking-tight leading-[0.9]">
          ¿Por qué elegir <br/>
          <span className="bg-black text-brand-orange px-4 py-1 inline-block -rotate-1 mt-4">KOBIT</span>?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {props.map((p) => (
            <div key={p.title} className="space-y-6 border-l-2 border-black/20 pl-8">
              <p.icon className="w-10 h-10 stroke-[2.5]" />
              <h3 className="text-2xl font-bold tracking-tight">{p.title}</h3>
              <p className="text-black/70 text-sm leading-relaxed font-medium">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Decorative large K */}
      <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 text-[40rem] font-black text-black/5 pointer-events-none select-none">
        K
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    area: 'Optimización de Procesos',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      await addDoc(collection(db, 'contactRequests'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setFormData({ name: '', email: '', company: '', area: 'Optimización de Procesos', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'contactRequests');
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-12 gap-20 items-center relative z-10">
        <div className="lg:col-span-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-orange mb-6 text-left">Contacto Directo</h3>
          <h2 className="text-4xl md:text-6xl font-bold mb-10 font-display leading-[1.1]">¿Hablamos de <br/><span className="text-gradient-hero">tu próximo éxito?</span></h2>
          <p className="text-lg text-gray-400 mb-12 max-w-md leading-relaxed">
            Agenda una visita de diagnóstico gratuita para identificar oportunidades de ahorro y automatización en tu operación actual.
          </p>
          
          <div className="space-y-6">
            <a href="https://wa.me/your-number" className="group flex items-center gap-6 p-6 glass-panel rounded-2xl max-w-sm hover:border-brand-orange/40 transition-all">
              <div className="w-14 h-14 bg-brand-orange/10 rounded-full flex items-center justify-center border border-brand-orange/20">
                <MessageCircle className="w-7 h-7 text-brand-orange" />
              </div>
              <span className="text-xl font-bold group-hover:text-brand-orange transition-colors tracking-tight">WhatsApp Corporativo</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 glass-panel p-12 rounded-2xl shadow-2xl relative">
          <div className="absolute -top-12 -right-6 w-24 h-24 bg-brand-orange/20 blur-[60px] rounded-full" />
          
          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Tu Nombre</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-brand-orange transition-colors text-white placeholder:text-gray-700" 
                  placeholder="Nombre completo" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Email de contacto</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-brand-orange transition-colors text-white placeholder:text-gray-700" 
                  placeholder="juan@empresa.com" 
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Nombre de Empresa</label>
                <input 
                  type="text" 
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-brand-orange transition-colors text-white placeholder:text-gray-700" 
                  placeholder="Empresa S.A." 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Área de Interés</label>
                <select 
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-brand-orange transition-colors appearance-none text-gray-500"
                >
                  <option>Optimización de Procesos</option>
                  <option>Inventario y Logística</option>
                  <option>Software a Medida (ERP/CRM)</option>
                  <option>Páginas Web y E-commerce</option>
                  <option>Marketing Digital & SEO</option>
                  <option>Análisis de Datos & BI</option>
                  <option>Ciberseguridad</option>
                  <option>Implementación de IA</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Mensaje o Problema a Resolver</label>
              <textarea 
                rows={3} 
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-brand-orange transition-colors text-white placeholder:text-gray-700 resize-none" 
                placeholder="Cuéntanos brevemente qué necesitas optimizar..."
              />
            </div>
            <button 
              disabled={status === 'submitting'}
              className="w-full py-6 bg-brand-orange text-black font-black uppercase text-xs tracking-[0.4em] hover:shadow-[0_0_50px_rgba(255,106,0,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                </span>
              ) : status === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> ¡Enviado con éxito!
                </span>
              ) : 'Agendar Diagnóstico'}
            </button>

            {status === 'error' && (
              <p className="text-center text-red-500 text-xs font-bold uppercase tracking-widest mt-4">
                Ocurrió un error. Por favor intenta más tarde.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onAdminClick }: { onAdminClick: () => void }) => (
  <footer className="border-t border-white/10 bg-black flex flex-col items-center relative z-10 overflow-hidden">
    {/* Bottom Conversion Bar */}
    <div className="w-full h-auto min-h-24 flex flex-col md:flex-row items-center px-10 py-8 justify-between gap-8 border-b border-white/5">
      <div className="flex flex-wrap gap-10 md:gap-16">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Personalización</span>
          <span className="text-sm font-bold text-white uppercase tracking-tight">100% a Medida</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Resultados</span>
          <span className="text-sm font-bold text-white uppercase tracking-tight">+45% Eficiencia</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Soporte</span>
          <span className="text-sm font-bold text-white uppercase tracking-tight">Acompañamiento Real</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="hidden sm:inline text-sm text-gray-400 font-medium">¿Listo para optimizar tu negocio?</span>
        <a 
          href="#contact"
          className="px-8 py-3 bg-brand-orange text-black font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
        >
          Solicitar Visita Técnica
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>

    <div className="w-full py-12 px-10 text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-bold text-black text-sm">K</div>
        <span className="text-xl font-bold tracking-tight uppercase">KOBIT <span className="text-brand-orange">SOLUCIONES</span></span>
      </div>
      <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed mb-10">
        No solo desarrollamos tecnología. La implementamos, la enseñamos y la optimizamos con inteligencia artificial para hacer crecer tu empresa ante cualquier desafío operativo.
      </p>
      
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={onAdminClick}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-gray-500 hover:text-brand-orange hover:border-brand-orange/50 transition-all group"
        >
          <Lock className="w-3 h-3 transition-transform group-hover:scale-110" />
          Panel de Control
        </button>
        
        <div className="text-[10px] text-gray-700 uppercase tracking-[0.4em] font-bold">
          © 2026 Kobit Soluciones Tecnológicas.
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeService, setActiveService] = useState<any>(null);
  const [activePortfolio, setActivePortfolio] = useState<PortfolioCase | null>(null);
  const [portfolioCases, setPortfolioCases] = useState<PortfolioCase[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioCase[];
      setPortfolioCases(data);
    }, (error) => {
      console.warn("Portfolio collection could not be loaded, using fallbacks:", error);
      // Instead of throwing, we just log and let the app continue with defaultCases
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Hidden way to enter admin mode: check URL for ?admin=true
    if (window.location.search.includes('admin=true')) {
      setShowAdmin(true);
    }
  }, []);

  if (showAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen selection:bg-brand-orange selection:text-brand-black">
      <Navbar />
      <main>
        <Hero onSelectService={setActiveService} />
        <WorkflowSection onSelectService={setActiveService} />
        <SolutionsSection onSelectService={setActiveService} />
        <ReadySystemsSection onSelectService={setActiveService} />
        <TrainingSection />
        <CaseStudy cases={portfolioCases} onSelect={setActivePortfolio} />
        <ValueProp />
        <Contact />
      </main>
      <Footer onAdminClick={() => setShowAdmin(true)} />

      <Modal 
        isOpen={!!activeService}
        onClose={() => setActiveService(null)}
        title={activeService?.title || ''}
        subtitle={activeService?.features ? 'Sistema Listo para Implementar' : 'Nuestra Expertise'}
        content={activeService?.desc || ''}
        methodology={activeService?.methodology || []}
      />

      <PortfolioModal 
        isOpen={!!activePortfolio}
        onClose={() => setActivePortfolio(null)}
        caseItem={activePortfolio}
      />
    </div>
  );
}
