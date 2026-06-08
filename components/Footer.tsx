export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇮🇳</span>
            <span className="text-sm font-semibold text-text-primary">Parliament Pulse Link</span>
          </div>
          <p className="text-sm text-text-muted">© 2024 Parliament Pulse Link. AI-Powered Legislative Intelligence for Uttarakhand.</p>
        </div>
      </div>
    </footer>
  );
}