import {
  Code,
  DollarSign,
  Palette,
  Lightbulb,
  Database,
  Server,
  Terminal,
  Layout,
  TrendingUp,
} from "lucide-react";

export const POPULAR_TAGS_DATA = [
  { icon: Code, name: "javascript", count: "82,645", colorClass: "blue" },
  {
    icon: DollarSign,
    name: "bitcoin",
    count: "65,523",
    isTrending: true,
    colorClass: "orange",
  },
  {
    icon: Palette,
    name: "design",
    count: "51,354",
    isTrending: true,
    colorClass: "purple",
  },
  { icon: Lightbulb, name: "innovation", count: "48,029", colorClass: "green" },
  { icon: Database, name: "database", count: "40,123", colorClass: "blue" },
  { icon: Server, name: "backend", count: "35,987", colorClass: "orange" },
  { icon: Terminal, name: "devops", count: "30,500", colorClass: "purple" },
  { icon: Layout, name: "frontend", count: "28,000", colorClass: "blue" },
  { icon: TrendingUp, name: "finance", count: "25,500", colorClass: "orange" },
];
