"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MessageCircle, Search, ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { buildWhatsAppUrl, buildGeneralEnquiryMessage } from "@/lib/whatsapp";
import type { NavCollection } from "@/lib/collections";

// Heavy, rarely-needed UI is split out of the initial bundle and only fetched on first use.
const SearchModal = dynamic(() => import("@/components/website/search-modal").then((m) => m.SearchModal));
const MobileMenu = dynamic(() => import("@/components/website/mobile-menu").then((m) => m.MobileMenu));
const CartDrawer = dynamic(() => import("@/components/ecommerce/cart-drawer").then((m) => m.CartDrawer));

const iconBtn =
  "focus-ring inline-flex h-10 w-10 items-center justify-center text-[color:var(--hdr-fg)] transition-colors hover:text-[color:var(--hdr-accent)]";

export function HeaderActions({
  whatsappNumber,
  collections,
  paymentsEnabled,
}: {
  whatsappNumber: string;
  collections: NavCollection[];
  paymentsEnabled: boolean;
}) {
  const { count, openCart, isOpen: cartOpen } = useCart();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchUsed, setSearchUsed] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuUsed, setMenuUsed] = React.useState(false);
  const [cartUsed, setCartUsed] = React.useState(false);

  React.useEffect(() => {
    // Keep the drawer mounted once it has been opened so its close animation still plays.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (cartOpen) setCartUsed(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [cartOpen]);

  return (
    <>
      <div className="flex items-center justify-self-end lg:col-start-3 lg:row-start-1">
        <button
          type="button"
          aria-label="Search"
          onClick={() => {
            setSearchUsed(true);
            setSearchOpen(true);
          }}
          className={iconBtn}
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        <a
          href={buildWhatsAppUrl(whatsappNumber, buildGeneralEnquiryMessage())}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className={`${iconBtn} hidden sm:inline-flex`}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
        </a>
        <button
          type="button"
          aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          onClick={openCart}
          className={`${iconBtn} relative`}
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] leading-none text-ivory">
              {count}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => {
            setMenuUsed(true);
            setMenuOpen(true);
          }}
          className={`${iconBtn} lg:hidden`}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {searchUsed && <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />}
      {menuUsed && (
        <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} collections={collections} whatsappNumber={whatsappNumber} />
      )}
      {(cartUsed || cartOpen) && <CartDrawer whatsappNumber={whatsappNumber} paymentsEnabled={paymentsEnabled} />}
    </>
  );
}
