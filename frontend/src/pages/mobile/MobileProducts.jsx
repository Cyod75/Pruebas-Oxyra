import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import NutritionDashboard from "./nutrition/NutritionDashboard";
import { IconNutrition, IconSearch, IconFilter, IconChevronRight, IconLoader } from "../../components/icons/Icons"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "../../config/api"; 
import ModernLoader from "../../components/shared/ModernLoader";
import { useConnection } from "../../context/ConnectionContext";

const CATEGORIES = ["Todos", "Suplementos", "Ropa", "Equipamiento", "Otros"];

export default function MobileProducts() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("products"); // "products" | "nutrition"
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { reportError } = useConnection();
  
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. CARGAR PRODUCTOS
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Error fetching products");
        
        const data = await res.json();
        setProducts(data);
        
        // Si todo sale bien, quitamos el loading
        setLoading(false); 
        
    } catch (error) {
        console.error("Error cargando productos:", error);
        // Notificamos al sistema global de conexión
        reportError();
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
    const matchesSearch = p.nombre?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- LÓGICA DE VISUALIZACIÓN ---
  const showCarousel = selectedCategory === "Todos" && searchQuery === "";
  const featured = filteredProducts.filter(p => p.destacado);
  const displayList = showCarousel 
      ? filteredProducts.filter(p => !p.destacado) 
      : filteredProducts;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground pb-24 font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER COMPARTIDO --- */}
      <div className="px-5 pb-2 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between mb-5">
            <div>
                <h1 className="text-3xl font-black tracking-tight">{t("shop.title")}</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {activeTab === "products" ? t("shop.subtitles.products") : t("shop.subtitles.nutrition")}
                </p>
            </div>
            <div className="h-10 w-10 bg-secondary/30 rounded-full flex items-center justify-center border border-white/5">
                <IconNutrition className="text-foreground h-5 w-5 opacity-80" />
            </div>
        </div>

        {/*  SEGMENTED CONTROL INTEGRADO  */}
        <div className="flex items-center p-1 rounded-[16px] bg-secondary/30 mb-6 border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 h-10 rounded-[13px] text-sm font-bold transition-all duration-200 active:scale-95 ${
              activeTab === "products" 
                ? "bg-foreground text-background shadow-md scale-[1.02]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("shop.tabs.products")}
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`flex-1 h-10 rounded-[13px] text-sm font-bold transition-all duration-200 active:scale-95 ${
              activeTab === "nutrition" 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("shop.tabs.nutrition")}
          </button>
        </div>

        {/* --- EXTRAS DEL HEADER SÓLO PARA PRODUCTOS --- */}
        {activeTab === "products" && (
          <div className="animate-in fade-in duration-300">
            {/* Buscador */}
            <div className="relative mb-6">
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("shop.search_placeholder")} 
                  className="pl-11 bg-secondary/30 border-transparent h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary text-base placeholder:text-muted-foreground/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Categorías (Scroll Horizontal) */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    shrink-0 whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95
                    ${selectedCategory === cat 
                      ? "bg-foreground text-background shadow-lg scale-105" 
                      : "bg-secondary/30 text-muted-foreground border border-transparent hover:border-border"}
                  `}
                >
                  {cat === "Todos" ? t("shop.categories.todos") :
                   cat === "Suplementos" ? t("shop.categories.suplementos") :
                   cat === "Ropa" ? t("shop.categories.ropa") :
                   cat === "Equipamiento" ? t("shop.categories.equipamiento") : t("shop.categories.otros")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- CONTENT ZONE --- */}
      
      {/* 1. NUTRICIÓN */}
      {activeTab === "nutrition" && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <NutritionDashboard />
        </div>
      )}

      {/* 2. PRODUCTOS */}
      {activeTab === "products" && (
        <div className="animate-in slide-in-from-left-4 duration-300">
          {loading && (
            <div className="min-h-[40vh] flex items-center justify-center">
              <ModernLoader text="PREPARANDO NUTRICIÓN..." />
            </div>
          )}

          {!loading && (
            <div className="space-y-8 pb-10 mt-4">
              {/* CARRUSEL DESTACADOS */}
              {showCarousel && featured.length > 0 && (
                  <div className="animate-in fade-in duration-700 delay-100">
                      <div className="px-5 mb-3 flex items-end justify-between">
                          <h3 className="text-lg font-bold tracking-tight">{t("shop.featured")}</h3>
                      </div>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 snap-x snap-mandatory pb-4">
                          {featured.map(product => (
                              <div 
                                  key={product.id}
                                  onClick={() => setSelectedProduct(product)}
                                  className="
                                      snap-center shrink-0 w-[75vw] md:w-[280px] aspect-[16/9] relative 
                                      rounded-3xl overflow-hidden bg-muted cursor-pointer 
                                      active:scale-[0.98] transition-transform duration-300 shadow-sm border border-white/5
                                  "
                              >
                                  <img 
                                      src={product.imagen} 
                                      className="w-full h-full object-cover brightness-[0.65]" 
                                      alt={product.nombre}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                                  
                                  <div className="absolute bottom-4 left-5 right-5 text-white">
                                      <Badge className="bg-white/20 backdrop-blur-md text-white border-0 mb-2 px-2 py-0.5 text-[10px]">
                                          {product.empresa}
                                      </Badge>
                                      <h4 className="font-bold text-xl leading-none mb-1 truncate">{product.nombre}</h4>
                                      <p className="text-sm font-medium opacity-90 text-gray-200">${product.precio}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* GRID CATÁLOGO */}
              <div className="px-5 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                   <div className="flex items-center gap-2 mb-4">
                       <h3 className="text-lg font-bold tracking-tight">
                          {searchQuery ? t("shop.results") : (selectedCategory === "Todos" ? t("shop.catalog") : (
                            selectedCategory === "Suplementos" ? t("shop.categories.suplementos") :
                            selectedCategory === "Ropa" ? t("shop.categories.ropa") :
                            selectedCategory === "Equipamiento" ? t("shop.categories.equipamiento") : t("shop.categories.otros")
                          ))}
                       </h3>
                       <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full font-mono">
                          {displayList.length}
                       </span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                      {displayList.map((product) => (
                          <div 
                              key={product.id} 
                              onClick={() => setSelectedProduct(product)}
                              className="group flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform duration-200"
                          >
                              <div className="aspect-[3/4] w-full rounded-[1.5rem] overflow-hidden bg-secondary/20 relative shadow-sm border border-white/5">
                                  <img 
                                      src={product.imagen} 
                                      alt={product.nombre}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                   {product.codigo && (
                                      <div className="absolute top-2 right-2">
                                           <Badge className="bg-pink-500/90 backdrop-blur-sm text-white border-0 text-[9px] font-bold px-2 shadow-sm">
                                               {t("shop.promo_badge")}
                                           </Badge>
                                      </div>
                                  )}
                              </div>

                              <div className="px-1 space-y-1">
                                  <div className="flex justify-between items-start">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                          {product.empresa}
                                      </span>
                                  </div>
                                  <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-2">
                                      {product.nombre}
                                  </h3>
                                  <div className="text-sm font-medium text-foreground/80">
                                      ${product.precio}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Empty State */}
              {displayList.length === 0 && (
                 <div className="py-12 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <IconFilter className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-sm">{t("shop.no_products")}</p>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- SHEET DE DETALLES (SÓLO PARA PRODUCTOS) --- */}
      <Sheet open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-[2.5rem] p-0 border-0 bg-background flex flex-col overflow-hidden">
            <SheetHeader className="hidden">
                <SheetTitle>{t("shop.details.title")}</SheetTitle>
                <SheetDescription>
                    {t("shop.details.description", { name: selectedProduct?.nombre })}
                </SheetDescription>
            </SheetHeader>

            {selectedProduct && (
              <>
                <ScrollArea className="flex-1 w-full pb-24">
                    <div className="relative h-[50vh] w-full">
                        <img 
                            src={selectedProduct.imagen} 
                            className="w-full h-full object-cover"
                            alt="Product Hero"
                        />
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
                        
                        <div 
                            className="absolute top-6 right-6 h-9 w-9 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform border border-white/10"
                            onClick={() => setSelectedProduct(null)}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </div>
                    </div>

                    <div className="px-6 -mt-10 relative z-10">
                        <div className="bg-card border border-border/40 shadow-xl rounded-3xl p-5 mb-6">
                            <div className="flex items-start justify-between mb-2">
                                 <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">{selectedProduct.empresa}</span>
                                    <h2 className="text-2xl font-black leading-tight">{selectedProduct.nombre}</h2>
                                 </div>
                                 <span className="text-xl font-bold text-primary">${selectedProduct.precio}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="bg-secondary/50 font-medium">
                                  {selectedProduct.categoria === "Suplementos" ? t("shop.categories.suplementos") :
                                   selectedProduct.categoria === "Ropa" ? t("shop.categories.ropa") :
                                   selectedProduct.categoria === "Equipamiento" ? t("shop.categories.equipamiento") : t("shop.categories.otros")}
                                </Badge>
                                {selectedProduct.destacado && <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0">{t("shop.top_sales")}</Badge>}
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            <h3 className="text-sm font-bold text-foreground">{t("shop.about_product")}</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                                {selectedProduct.descripcion}
                            </p>
                            
                            {selectedProduct.codigo && (
                                <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 border-dashed flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-primary/70">{t("shop.promo_code")}</p>
                                        <p className="text-lg font-mono font-bold text-foreground tracking-widest">{selectedProduct.codigo}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 text-xs font-bold" onClick={() => navigator.clipboard.writeText(selectedProduct.codigo)}>
                                        {t("shop.copy")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/95 to-transparent pt-10">
                    <Button 
                        className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" 
                        size="lg"
                        onClick={() => window.open(selectedProduct.url, '_blank')}
                    >
                        {t("shop.view_in", { company: selectedProduct.empresa })}
                        <IconChevronRight className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                </div>
              </>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}