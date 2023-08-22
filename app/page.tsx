import CreateOrderButton from "@/components/CreateOrderButton/CreateOrderButton";
import Layout from "@/components/Layout/Layout";
import OrderTable from "@/components/OrderTable/OrderTable";
import React from "react";

export default function Home() {
  return (
    <Layout>
      <div className="w-full flex justify-end mb-6">
        <CreateOrderButton />
      </div>
      <OrderTable />
    </Layout>
  );
}
