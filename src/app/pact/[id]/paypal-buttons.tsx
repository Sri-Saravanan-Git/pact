"use client";
import { useEffect, useRef, useState } from "react";

type PayPalNS = {
  Buttons: (o: {
    style?: object;
    createOrder: () => Promise<string>;
    onApprove: (d: { orderID: string }) => Promise<void>;
    onError: (e: unknown) => void;
  }) => { render: (el: HTMLElement) => Promise<void>; close?: () => void };
};

let loader: Promise<PayPalNS> | undefined;
function loadSdk(): Promise<PayPalNS> {
  const w = window as unknown as { paypal?: PayPalNS };
  if (w.paypal) return Promise.resolve(w.paypal);
  loader ??= new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&intent=authorize&currency=USD&components=buttons&disable-funding=card,credit,paylater,venmo`;
    s.onload = () => ok(w.paypal!);
    s.onerror = () => {
      loader = undefined;
      fail(new Error("PayPal checkout could not load. Use the sandbox test card instead."));
    };
    document.head.appendChild(s);
  });
  return loader;
}

/** PayPal's own button, intent=authorize: the buyer approves, then the server authorizes (holds) the order. */
export function PayPalButtons({ createOrder, onApproved, onError }: { createOrder: () => Promise<string>; onApproved: (orderId: string) => Promise<void>; onError: (m: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let closed = false;
    let inst: { close?: () => void } | undefined;
    loadSdk()
      .then((pp) => {
        if (closed || !box.current) return;
        inst = pp.Buttons({
          style: { layout: "horizontal", color: "blue", shape: "pill", label: "paypal", height: 48, tagline: false },
          createOrder,
          onApprove: (d) => onApproved(d.orderID),
          onError: () => onError("PayPal reported a problem. Try again, or use the sandbox test card."),
        });
        return (inst as { render: (el: HTMLElement) => Promise<void> }).render(box.current).then(() => setReady(true));
      })
      .catch((e) => onError((e as Error).message));
    return () => {
      closed = true;
      inst?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {!ready && <div className="h-12 animate-pulse rounded-full bg-canvas" aria-label="Loading PayPal" />}
      <div ref={box} className="w-full" />
    </div>
  );
}
