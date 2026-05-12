import HomeHero from "./sections/HomeHero";
import HomeFeatured from "./sections/HomeFeatured";
import HomeQa from "./sections/HomeQa";
import Footer from "../footer/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-black ">
      <HomeHero />
      <HomeFeatured />
      <HomeQa />
      <Footer />
    </div>
  );
};

export default HomePage;
