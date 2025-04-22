import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-[#f59e0b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 11l5-5m5 0l5 5m-9-9h.01M14 8h.01" />
              </svg>
              <span className="ml-2 text-xl font-bold">GreenGrocer</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">Quality produce for businesses and individuals at the best prices.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-300 hover:text-white text-sm">Home</Link></li>
              <li><Link href="/products" className="text-slate-300 hover:text-white text-sm">Products</Link></li>
              <li><Link href="/" className="text-slate-300 hover:text-white text-sm">Wholesale Program</Link></li>
              <li><Link href="/" className="text-slate-300 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/" className="text-slate-300 hover:text-white text-sm">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              <li><Link href="/products?category=1" className="text-slate-300 hover:text-white text-sm">Fruits</Link></li>
              <li><Link href="/products?category=2" className="text-slate-300 hover:text-white text-sm">Vegetables</Link></li>
              <li><Link href="/products?category=3" className="text-slate-300 hover:text-white text-sm">Dairy</Link></li>
              <li><Link href="/products?category=4" className="text-slate-300 hover:text-white text-sm">Bakery</Link></li>
              <li><Link href="/products?category=6" className="text-slate-300 hover:text-white text-sm">Organic</Link></li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-slate-300 mr-2 mt-0.5" />
                <span className="text-slate-300 text-sm">123 Produce Lane, Farmville, CA 90210</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-slate-300 mr-2 mt-0.5" />
                <span className="text-slate-300 text-sm">info@greengrocer.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-slate-300 mr-2 mt-0.5" />
                <span className="text-slate-300 text-sm">(800) 123-4567</span>
              </li>
              <li className="mt-4">
                <h3 className="text-sm font-medium mb-2">Subscribe to our newsletter</h3>
                <div className="flex">
                  <Input 
                    type="email" 
                    placeholder="Your email" 
                    className="w-full text-slate-800 rounded-r-none focus-visible:ring-[#0f766e]"
                  />
                  <Button className="bg-[#f59e0b] hover:bg-[#f59e0b]/90 rounded-l-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© 2023 GreenGrocer. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
