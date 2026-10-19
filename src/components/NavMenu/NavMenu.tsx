import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';

type NavMenuProps = {
  title: string | ReactNode;
  children: ReactNode;
};

function NavMenu({ title, children }: NavMenuProps) {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>{children}</ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

export function ListItem({
  title,
  children,
  href,
  ...props
}: ComponentPropsWithoutRef<'li'> & { href: string }) {
  const isExternal = href.startsWith('https://');
  const linkContent = (
    <div className="flex flex-col gap-1 text-sm">
      <div className="leading-none font-medium">{title}</div>
      <div className="line-clamp-2 text-muted-foreground">{children}</div>
    </div>
  );

  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {linkContent}
            </a>
          ) : (
            <Link href={href}>{linkContent}</Link>
          )
        }
      />
    </li>
  );
}

export default NavMenu;
