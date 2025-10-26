import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-neutral-800 bg-[#05090E]">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-3">
          <h3 className="text-base sm:text-lg text-white text-center md:text-left">Join the Autonomous Future.</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs text-white">
            <Link href="/docs" className="hover:text-[#63f2d2] transition-colors">
              Docs
            </Link>
            <Link href="https://pod.0rca.network" className="hover:text-[#63f2d2] transition-colors">
              POD
            </Link>
            <a href="https://forum.0rca.network" className="hover:text-[#63f2d2] transition-colors">
              Forum
            </a>
            <Link href="/about" className="hover:text-[#63f2d2] transition-colors">
              About
            </Link>
            <Link href="/whitepaper" className="hover:text-[#63f2d2] transition-colors">
              Whitepaper
            </Link>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-3 flex flex-col md:flex-row items-center justify-between gap-2 font-mono text-xs text-neutral-400">
          <p>© 2025 0rca Protocol. Built by the 0rca Team.</p>
          <a href="mailto:zero80932@gmail.com" className="hover:text-[#63f2d2] transition-colors">
            zero80932@gmail.com
          </a>
        </div>
      </div>
    </footer>
  )
}
