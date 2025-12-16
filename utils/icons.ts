import {
  Home, User, Settings, Search, Bell, ShoppingBag, Info, Mail, Phone,
  Heart, Star, MapPin, Calendar, Camera, Music, Video, FileText,
  HelpCircle, Shield, Briefcase, Globe, Cpu, Zap, Layout, Image,
  Link, ExternalLink, Download, Upload, Cloud, Code, Terminal,
  Coffee, Sun, Moon, Smile, Hash, Bookmark, Share2, Flag,
  Menu, Grid, List, Layers, Box, Package, Truck, CreditCard,
  DollarSign, PieChart, BarChart, Activity, UserCheck, Users,
  Lock, Unlock, Key, PenTool, Edit, Trash, Plus, Minus,
  Check, X, ChevronRight, ChevronDown, ArrowRight, ArrowLeft,
  // Food & Drink additions
  Utensils, Wine, Beer, ChefHat, Pizza, Soup, Cake, IceCream, 
  Fish, Leaf, Drumstick, Carrot, Apple, Sandwich, Martini, 
  GlassWater, Flame, Cigarette
} from 'lucide-react';

export const iconMap: Record<string, any> = {
  // Navigation & UI
  Home, User, Settings, Search, Bell, Menu, Grid, List, Layers,
  Layout, Image, Link, ExternalLink, Check, X, Plus, Minus,
  ChevronRight, ChevronDown, ArrowRight, ArrowLeft, Edit, Trash,
  
  // Business
  ShoppingBag, CreditCard, DollarSign, Briefcase, PieChart, 
  BarChart, Activity, UserCheck, Users, Package, Truck, 
  Lock, Unlock, Key, Shield,
  
  // Gastronomy
  Coffee, Utensils, Wine, Beer, ChefHat, Pizza, Soup, Cake, 
  IceCream, Fish, Leaf, Drumstick, Carrot, Apple, Sandwich, 
  Martini, GlassWater, Flame, Cigarette,

  // General / Misc
  Heart, Star, MapPin, Calendar, Camera, Music, Video, FileText,
  HelpCircle, Globe, Cpu, Zap, Download, Upload, Cloud, Code, 
  Terminal, Sun, Moon, Smile, Hash, Bookmark, Share2, Flag, 
  Info, Mail, Phone, PenTool
};

export type IconName = keyof typeof iconMap;

export const iconCategories: Record<string, string[]> = {
  "Gastronómia": [
    "Utensils", "Coffee", "Wine", "Beer", "Martini", "GlassWater", 
    "ChefHat", "Pizza", "Soup", "Cake", "IceCream", "Sandwich",
    "Fish", "Drumstick", "Leaf", "Carrot", "Apple", "Flame", "Cigarette"
  ],
  "Základné": [
    "Star", "Heart", "Home", "User", "Settings", "Search", "Bell", "Info",
    "MapPin", "Phone", "Mail", "Calendar", "Check", "X"
  ],
  "Obchod": [
    "ShoppingBag", "CreditCard", "DollarSign", "Package", "Truck", 
    "Briefcase", "Shield", "Activity", "Users"
  ],
  "Rozhranie": [
    "Menu", "Grid", "List", "Layers", "Layout", "Image", "Link", 
    "Edit", "Trash", "Plus", "Minus", "ArrowRight"
  ],
  "Rôzne": [
    "Smile", "Music", "Camera", "Video", "Flag", "Bookmark", "Share2", 
    "Sun", "Moon", "Zap", "Globe", "FileText"
  ]
};