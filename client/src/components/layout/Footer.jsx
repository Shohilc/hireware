import { Link } from 'react-router-dom';
import { Sparkles, Globe, MessageCircle, Users, Mail } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Browse Jobs', path: '/jobs' },
    { label: 'Companies', path: '/jobs' },
    { label: 'Dashboard', path: '/dashboard' },
  ],
  Resources: [
    { label: 'Career Tips', path: '#' },
    { label: 'Salary Guide', path: '#' },
    { label: 'Resume Builder', path: '#' },
  ],
  Company: [
    { label: 'About Us', path: '#' },
    { label: 'Contact', path: '#' },
    { label: 'Privacy Policy', path: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/85 bg-white/70 dark:bg-zinc-950/70 transition-colors duration-500 ease-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-zinc-900 dark:text-white">HireWave</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Aggregate jobs from multiple platforms. Search, filter, and apply smarter.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, MessageCircle, Users, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-brand-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-brand-400 hover:border-brand-500/20 dark:hover:border-brand-500/30 flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} HireWave. Built with ❤️ for job seekers everywhere.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Aggregate • Filter • Apply
          </p>
        </div>
      </div>
    </footer>
  );
}
