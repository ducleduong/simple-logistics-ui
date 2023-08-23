import Link from "next/link";

const CreateOrderButton = () => {
  return (
    <Link
      href="/create-order"
      className="inline-flex items-center justify-center rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
    >
      Create new order
    </Link>
  );
};

export default CreateOrderButton;
