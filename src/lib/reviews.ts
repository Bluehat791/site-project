// Customer reviews, transcribed from Yandex.Maps (screenshots in
// references/review-*.png). Rendered as text rather than images: sharp at any
// size, indexable, and no authors' personal avatars end up on the site.

export const REVIEWS_SOURCE_URL = "https://yandex.com/profile/189481176265?lang=ru";

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
}

export const reviews: Review[] = [
  {
    id: "001",
    author: "Игорь Зинченко",
    date: "26 июня",
    rating: 5,
    text: "Насосы отличного качества",
  },
  {
    id: "002",
    author: "Дмитрий Попов",
    date: "15 мая",
    rating: 5,
    text: "Оперативно помогли подобрать насос, техника в строю 🤝",
  },
  {
    // references/reviews.json flags this one: the author name matches the
    // company's — check with the owner that it isn't a self-review.
    id: "003",
    author: "Югс Аксай",
    date: "26 июня 2024",
    rating: 5,
    text: "Отличная организация. Большой выбор гидравлических насосов (КамАЗ, МАЗ, на китайскую технику), коробок отбора мощности на отечественные и импортные машины.",
  },
  {
    id: "004",
    author: "Андрей",
    date: "14 июля",
    rating: 5,
    text: "Полный спектр гидравлики на спецтехнику",
  },
  {
    id: "005",
    author: "Роман Цикало",
    date: "27 января 2024",
    rating: 5,
    text: "Всё чётко, приобрёл КОМ у грамотного продавца, который всё объяснил и рассказал. Всем рекомендую!!!",
  },
];
