export const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-12 text-center mt-auto">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-center items-center gap-2 mb-4">
          <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633-4.696-2.713"/></svg>
          <span className="font-bold text-xl text-white">EcoTrade</span>
      </div>
      <p className="mb-6">The premier B2B scrap marketplace for a sustainable future.</p>
      <div className="flex justify-center gap-6 text-sm mb-8">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
      </div>
      <p className="text-sm">&copy; 2026 EcoTrade Commodities. All rights reserved.</p>
    </div>
  </footer>
);
