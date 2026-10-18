import type { ReactNode } from 'react';

type NavbarProps = {
  children?: ReactNode;
};

function Navbar({ children }: NavbarProps) {
  return <div>{children}</div>;
}

export default Navbar;
