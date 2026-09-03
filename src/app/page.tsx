import Hero from "./components/Hero";
import BreedCatalog from "./components/BreedCatalog";
import "./home.css";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="home-lux">
      <Hero />
      <BreedCatalog />
    </div>
  );
}
