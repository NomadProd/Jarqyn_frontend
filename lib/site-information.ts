/**
 * Typed informational content for /info and footer-linked sections.
 * Merged with persisted admin edits via DemoProvider (`siteInformation`).
 */

export type InfoAccordionItem = {
  id: string;
  title: string;
  body: string;
};

export type InfoAccordionSection = {
  heading: string;
  items: InfoAccordionItem[];
};

export type ContactsDetails = {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socialNote: string;
};

export type SiteInformationContent = {
  pageIntro: string;
  faq: InfoAccordionSection;
  contacts: ContactsDetails;
  delivery: InfoAccordionSection;
  returns: InfoAccordionSection;
  about: InfoAccordionSection;
  careers: InfoAccordionSection;
  privacy: InfoAccordionSection;
  offer: InfoAccordionSection;
  corporate: InfoAccordionSection;
  stores: InfoAccordionSection;
  purchase: InfoAccordionSection;
  accountHelp: InfoAccordionSection;
  productQuestions: InfoAccordionSection;
};

export const defaultSiteInformation: SiteInformationContent = {
  pageIntro:
    "Базовая справочная информация по сервису Jarqyn. Тексты можно править в админ-блоке «Информация для сайта» в кабинете администратора.",
  faq: {
    heading: "Частые вопросы",
    items: [
      {
        id: "faq-order",
        title: "Как оформить заказ?",
        body: "Выберите модель в коллекции, размер и город принта, затем перейдите в корзину или сразу к оформлению. После отправки заказа менеджер свяжется для подтверждения."
      },
      {
        id: "faq-pay",
        title: "Как оплатить?",
        body: "Оплата подключается на этапе интеграции платёжного провайдера. В демо режиме статус оплаты можно отметить в личном кабинете для теста."
      },
      {
        id: "faq-status",
        title: "Где посмотреть статус заказа?",
        body: "История и статус доступны в разделе «Аккаунт» после входа — блок заказов и трекинг."
      }
    ]
  },
  contacts: {
    phone: "+7 (700) 000-00-00",
    email: "hello@jarqyn.kz",
    address: "Казахстан, для юридического адреса уточняйте у поддержки",
    workingHours: "Пн–Пт 10:00–19:00 (Astana time)",
    socialNote: "Актуальные соцсети — в шапке сайта и карточках амбассадоров."
  },
  delivery: {
    heading: "Доставка",
    items: [
      {
        id: "delivery-time",
        title: "Сроки",
        body: "Сроки зависят от города и наличия позиций на складе. После подтверждения заказа менеджер сообщит ориентировочную дату отправки."
      },
      {
        id: "delivery-methods",
        title: "Курьер и самовывоз",
        body: "Способ доставки согласуется индивидуально: курьерская служба или пункт выдачи партнёров по Казахстану."
      }
    ]
  },
  returns: {
    heading: "Возврат и обмен",
    items: [
      {
        id: "returns-rules",
        title: "Условия",
        body: "Возможен возврат при сохранении товарного вида и бирок в срок, установленный публичной офертой. Индивидуальные принты уточняйте у поддержки."
      },
      {
        id: "returns-how",
        title: "Как инициировать возврат",
        body: "Напишите в WhatsApp или на почту из блока контактов — укажите номер заказа и причину."
      }
    ]
  },
  about: {
    heading: "О нас",
    items: [
      {
        id: "about-brand",
        title: "Jarqyn",
        body: "Jarqyn — форма принадлежности нового поколения: честная к материалу, строгая к детали. Униформа настроения, а не шумный мерч."
      }
    ]
  },
  careers: {
    heading: "Вакансии",
    items: [
      {
        id: "careers-general",
        title: "Карьера в Jarqyn",
        body: "Открытые позиции публикуются по мере появления. Отправьте резюме и короткое сопроводительное письмо на почту из блока контактов."
      }
    ]
  },
  privacy: {
    heading: "Конфиденциальность",
    items: [
      {
        id: "privacy-data",
        title: "Персональные данные",
        body: "Мы обрабатываем контактные и заказные данные для исполнения заказа и связи с клиентом. Политика может быть расширена юридическим текстом по запросу."
      }
    ]
  },
  offer: {
    heading: "Публичная оферта",
    items: [
      {
        id: "offer-contract",
        title: "Договор оферты",
        body: "Размещение заказа на сайте является офертой в понимании действующего законодательства РК. Полный юридический текст оферты добавляется администратором при необходимости."
      }
    ]
  },
  corporate: {
    heading: "Корпоративные заказы",
    items: [
      {
        id: "corp-b2b",
        title: "Опт и команды",
        body: "Для школ, клубов и компаний доступны корпоративные партии и кастомизация. Оставьте запрос через WhatsApp или почту — приложите объём и город."
      }
    ]
  },
  stores: {
    heading: "Магазины",
    items: [
      {
        id: "stores-channels",
        title: "Онлайн и офлайн",
        body: "Основная точка продаж — онлайн-коллекция на этом сайте. Офлайт-партнёры появляются по мере расширения сети."
      }
    ]
  },
  purchase: {
    heading: "Покупка",
    items: [
      {
        id: "purchase-size",
        title: "Выбор размера",
        body: "Используйте размерную сетку на карточке товара. При сомнении уточните параметры у поддержки до оформления."
      }
    ]
  },
  accountHelp: {
    heading: "Личный кабинет",
    items: [
      {
        id: "account-profile",
        title: "Аккаунт и телефон",
        body: "В кабинете хранятся избранное, история заказов и телефон для связи. Телефон можно обновить в любой момент в профиле."
      }
    ]
  },
  productQuestions: {
    heading: "Вопросы по продукту",
    items: [
      {
        id: "product-quality",
        title: "Качество и состав",
        body: "Состав и уход указаны на странице модели. Дополнительные сертификаты или партии — по запросу через поддержку."
      }
    ]
  }
};

export function mergeSiteInformation(partial?: Partial<SiteInformationContent> | null): SiteInformationContent {
  const base = defaultSiteInformation;
  const p = partial ?? {};
  const mergeSection = (key: keyof Omit<SiteInformationContent, "contacts" | "pageIntro">): InfoAccordionSection => {
    const incoming = p[key] as InfoAccordionSection | undefined;
    const def = base[key] as InfoAccordionSection;
    return {
      heading: incoming?.heading ?? def.heading,
      items: incoming?.items?.length ? incoming.items : def.items
    };
  };
  return {
    pageIntro: typeof p.pageIntro === "string" && p.pageIntro.trim() ? p.pageIntro : base.pageIntro,
    faq: mergeSection("faq"),
    contacts: {
      phone: p.contacts?.phone ?? base.contacts.phone,
      email: p.contacts?.email ?? base.contacts.email,
      address: p.contacts?.address ?? base.contacts.address,
      workingHours: p.contacts?.workingHours ?? base.contacts.workingHours,
      socialNote: p.contacts?.socialNote ?? base.contacts.socialNote
    },
    delivery: mergeSection("delivery"),
    returns: mergeSection("returns"),
    about: mergeSection("about"),
    careers: mergeSection("careers"),
    privacy: mergeSection("privacy"),
    offer: mergeSection("offer"),
    corporate: mergeSection("corporate"),
    stores: mergeSection("stores"),
    purchase: mergeSection("purchase"),
    accountHelp: mergeSection("accountHelp"),
    productQuestions: mergeSection("productQuestions")
  };
}
