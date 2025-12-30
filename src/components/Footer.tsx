export default function Footer() {
  return (
    <footer className="mt-auto py-8 text-center text-sm text-gray-500 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
      <p>© {new Date().getFullYear()} Evolve. Made with <span className="text-red-500 animate-pulse">♥</span> by Krunal Gamit</p>
    </footer>
  );
}