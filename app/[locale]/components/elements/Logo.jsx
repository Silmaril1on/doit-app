import Image from "next/image";
import Link from "next/link";

const Logo = ({ size = "sm", className }) => {
  const sizeClasses = {
    xs: "w-10 h-auto",
    sm: "w-14 h-auto",
    md: "w-22 h-auto",
    lg: "w-26 h-auto",
  };

  return (
    <Link href="/">
      <div className={`${className} ${sizeClasses[size]}  `}>
        <Image
          src="/assets/elivagar-logo.png"
          alt="DJDB Logo"
          width={150}
          height={150}
        />
      </div>
    </Link>
  );
};

export default Logo;
