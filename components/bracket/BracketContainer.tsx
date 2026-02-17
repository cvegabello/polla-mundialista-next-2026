export const BracketContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      /* 🚀 CAMBIO: Usamos 'overflow-auto' para habilitar el scroll vertical del bloque entero */
      className="w-full h-[calc(100vh-180px)] overflow-auto custom-scrollbar 
                    bg-slate-900/60 backdrop-blur-xl rounded-3xl 
                    border border-white/10 
                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
    >
      <div className="flex flex-row flex-nowrap items-start pl-8 pt-6 gap-6 min-w-max">
        {children}
        <div className="w-10 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
};
