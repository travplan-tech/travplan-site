"use client";
import { Mail, Phone, MapPin, Facebook, Instagram, Globe, Shield, CreditCard, HeadphonesIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = {
  destinations: [
    { name: 'India Tours', href: '/destinations?country=India' },
    { name: 'Nepal Tours', href: '/destinations?country=Nepal' },
    { name: 'Thailand Tours', href: '/destinations?region=Thailand' },
    { name: 'Maldives Tours', href: '/destinations?region=Maldives' },
    { name: 'Bali Tours', href: '/destinations?region=Bali' },
    { name: 'Asia Tours', href: '/destinations?region=Asia' },
    { name: 'Europe Tours', href: '/destinations?region=Europe' },
    { name: 'Africa Tours', href: '/destinations?region=Africa' },
  ],
  categories: [
    { name: 'Family', href: '/destinations?tourType=Family' },
    { name: 'Couples', href: '/destinations?tourType=Couples' },
    { name: 'Friends', href: '/destinations?tourType=Friends' },
    { name: 'Adventure', href: '/destinations?tourType=Adventure' },
    { name: 'Cultural & Architecture', href: '/destinations?tourType=Cultural & Architecture' },
    { name: 'Pilgrim Tours', href: '/destinations?tourType=Pilgrim Tours' },
    { name: 'Luxury', href: '/destinations?tourType=Luxury' },
    { name: 'Instagrammable', href: '/destinations?tourType=Instagrammable' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ],
  support: [
    { name: 'Help Center', href: '/contact' },
    // { name: 'Travel Insurance', href: '/insurance' },
    // { name: 'Cancellation Policy', href: '/cancellation' },
    // { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    // { name: 'Terms of Service', href: '/terms' },
    // { name: 'Refund Policy', href: '/refund' },
  ],
};

const socialLinks = [
  // { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/Travplan' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/Travplan.in?igsh=MXE0ZXBiMTU2Nmd3NQ==' },
  { name: 'WhatsApp', icon: Phone, href: 'https://wa.me/7011990884' },
  { name: 'Google', icon: Globe, href: 'https://share.google/z741QzbcH9tbag9Nz' },
];

const trustBadges = [
  { icon: Shield, title: '100% Secure', desc: 'Secure Payments' },
  { icon: Globe, title: '150+ Countries', desc: 'Worldwide Tours' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always Here' },
  { icon: CreditCard, title: 'Easy Refunds', desc: 'Hassle-free' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Trust Badges */}
      <div className="border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:flex md:justify-between items-center gap-6 md:gap-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex max-w-fit items-center gap-3 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <badge.icon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-purple.webp"
                alt="Travplan Logo"
                width={48}
                height={48}
                className="w-10 md:w-12"
              />
              <span className="font-bold text-gray-900 md:text-lg"><span className="text-primary">TRAV</span>PLAN</span>
            </Link>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Discover the world with Travplan. We offer curated travel experiences across 150+ countries
              with verified local operators, best price guarantee, and 24/7 customer support.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 self-start">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">Destinations</h4>
            <ul className="space-y-2">
              {footerLinks.destinations.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tour Categories */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">Tour Types</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              <a href="mailto:Info@Travplan.in" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Mail size={16} />
                Info@Travplan.in
              </a>
              <a href="tel:+917011990884" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Phone size={16} />
                +91 7011990884
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} />
              Workingdom, Block A, Sector 7 Dwarka, Palam, New Delhi, Delhi, 110077
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2026 Travplan. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {footerLinks.legal.map((link, index) => (
                <span key={link.name} className="flex items-center">
                  <Link href={link.href} className="hover:text-purple-600 transition-colors">
                    {link.name}
                  </Link>
                  {index < footerLinks.legal.length - 1 && <span className="ml-4 text-gray-300">|</span>}
                </span>
              ))}
            </div>
            {/* <div className="flex items-center gap-3">
              <span className="text-gray-400">We accept:</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-purple-100 rounded flex items-center justify-center text-[8px] font-bold text-purple-700">VISA</div>
                <div className="w-10 h-6 bg-purple-100 rounded flex items-center justify-center text-[8px] font-bold text-purple-700">MC</div>
                <div className="w-10 h-6 bg-purple-100 rounded flex items-center justify-center text-[8px] font-bold text-purple-700">AMEX</div>
                <div className="w-10 h-6 bg-purple-100 rounded flex items-center justify-center text-[8px] font-bold text-purple-700">PP</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}