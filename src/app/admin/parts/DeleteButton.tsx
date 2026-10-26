"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (
          !confirm(
            "Удалить запчасть? Если по ней уже были заказы, она будет только скрыта из каталога."
          )
        ) {
          e.preventDefault();
        }
      }}
      className="text-red-500 underline"
    >
      Удалить
    </button>
  );
}
