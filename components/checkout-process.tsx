"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

const steps = [
  {
    step: "01",
    title: "Корзина и данные",
    body: "Добавьте позицию и заполните контакты — мы соберём заказ без лишних полей."
  },
  {
    step: "02",
    title: "Оплата Robokassa",
    body: "Безопасная оплата картой или доступными методами через защищённый шлюз Robokassa."
  },
  {
    step: "03",
    title: "Подтверждение",
    body: "Менеджер свяжется с вами для финального подтверждения и доставки."
  }
];

type CheckoutProcessProps = {
  className?: string;
  heading?: string;
};

export const CheckoutProcess = memo(function CheckoutProcess({ className = "", heading = "Как проходит заказ" }: CheckoutProcessProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={`border border-white/[0.08] bg-graphite/60 px-6 py-10 sm:px-10 lg:px-12 ${className}`}>
      <div className="mx-auto max-w-[1100px]">
        <p className="font-display text-[10px] uppercase tracking-[0.38em] text-mist">Прозрачность</p>
        <h2 className="mt-4 font-display text-2xl uppercase tracking-tight text-fog sm:text-3xl">{heading}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
          Три шага — без сюрпризов. Текущий прототип сохраняет демо-заказ в аккаунте; боевой поток подключается к Robokassa на том же сценарии.
        </p>

        <ol className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {steps.map((item, index) => (
            <motion.li
              key={item.step}
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col border border-white/[0.07] bg-ink/80 p-6 sm:p-7"
            >
              <div className="pointer-events-none absolute inset-3 rounded-sm border border-white/[0.04]" aria-hidden />
              <span className="font-display text-[11px] uppercase tracking-[0.42em] text-brass">{item.step}</span>
              <div className="mt-6 aspect-[16/10] w-full overflow-hidden rounded-sm border border-white/[0.06] bg-mossdeep">
                <div className="flex h-full w-full flex-col p-4">
                  <div className="h-2 w-12 rounded-full bg-white/10" />
                  <div className="mt-4 flex-1 rounded-sm border border-white/[0.06] bg-black/35 p-3">
                    <div className="h-2 w-3/4 rounded-full bg-white/[0.08]" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-white/[0.06]" />
                    <div className="mt-6 h-8 w-full rounded-sm bg-moss/40" />
                    <div className="mt-2 h-8 w-full rounded-sm bg-white/[0.05]" />
                  </div>
                  <div className="mt-3 h-6 w-full rounded-sm bg-white/[0.06]" />
                </div>
              </div>
              <h3 className="mt-6 font-display text-lg uppercase tracking-tight text-fog">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{item.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
});
